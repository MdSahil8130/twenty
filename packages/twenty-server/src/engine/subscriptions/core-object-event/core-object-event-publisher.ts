import { Injectable, Logger } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type CoreObjectEvent } from 'src/engine/subscriptions/types/core-object-event.type';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

@Injectable()
export class CoreObjectEventPublisher {
  private readonly logger = new Logger(CoreObjectEventPublisher.name);

  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
    private readonly permissionsService: PermissionsService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async publish({
    workspaceId,
    events,
    requiredPermissionFlag,
  }: {
    workspaceId: string;
    events: CoreObjectEvent[];
    requiredPermissionFlag: PermissionFlagType;
  }): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const permissionByAuthContextKey = new Map<string, boolean>();

    try {
      await this.workspaceEventBroadcaster.broadcastCoreObjectEvents({
        workspaceId,
        coreObjectEvents: events,
        canDeliverToStream: (streamData) =>
          this.resolveStreamPermission({
            workspaceId,
            streamData,
            requiredPermissionFlag,
            permissionByAuthContextKey,
          }),
      });
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: { workspaceId, eventCount: events.length },
      });
      this.logger.warn(
        `Failed to publish ${events.length} core object event(s) for workspace ${workspaceId}`,
      );
    }
  }

  private async resolveStreamPermission({
    workspaceId,
    streamData,
    requiredPermissionFlag,
    permissionByAuthContextKey,
  }: {
    workspaceId: string;
    streamData: EventStreamData;
    requiredPermissionFlag: PermissionFlagType;
    permissionByAuthContextKey: Map<string, boolean>;
  }): Promise<boolean> {
    const { userWorkspaceId, apiKeyId, applicationId } = streamData.authContext;

    if (!isDefined(userWorkspaceId) && !isDefined(apiKeyId)) {
      return false;
    }

    const authContextKey = `${userWorkspaceId ?? ''}:${apiKeyId ?? ''}:${applicationId ?? ''}`;
    const cachedPermission = permissionByAuthContextKey.get(authContextKey);

    if (isDefined(cachedPermission)) {
      return cachedPermission;
    }

    const hasPermission = await this.permissionsService
      .userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: requiredPermissionFlag,
        apiKeyId,
        applicationId,
      })
      .catch((error) => {
        this.exceptionHandlerService.captureExceptions([error], {
          additionalData: { workspaceId, userWorkspaceId, apiKeyId },
        });

        return false;
      });

    permissionByAuthContextKey.set(authContextKey, hasPermission);

    return hasPermission;
  }
}
