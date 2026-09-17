import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { CoreObjectEventPublisher } from 'src/engine/subscriptions/core-object-event/core-object-event-publisher';
import { CoreObjectEventOperation } from 'src/engine/subscriptions/enums/core-object-event-operation.enum';
import { type CoreObjectEvent } from 'src/engine/subscriptions/types/core-object-event.type';
import { buildCoreWorkflowEvent } from 'src/engine/subscriptions/core-object-event/utils/build-core-workflow-event.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

type CoreWorkflowEventInput = {
  operation: CoreObjectEventOperation;
  coreWorkflowId: string;
  coreWorkflowVersionId?: string;
};

@Injectable()
export class CoreWorkflowEventService {
  constructor(
    private readonly coreObjectEventPublisher: CoreObjectEventPublisher,
  ) {}

  publishWorkflowEvents({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: CoreWorkflowEventInput[];
  }): void {
    void this.coreObjectEventPublisher
      .publish({
        workspaceId,
        events: events.map((event) => this.buildEvent(event)),
        requiredPermissionFlag: PermissionFlagType.WORKFLOWS,
      })
      .catch(() => undefined);
  }

  publishWorkflowEventsAfterCommit({
    workspaceId,
    transactionScope,
    events,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    events: CoreWorkflowEventInput[];
  }): void {
    transactionScope.afterCommit(() => {
      this.publishWorkflowEvents({ workspaceId, events });
    });
  }

  private buildEvent({
    operation,
    coreWorkflowId,
    coreWorkflowVersionId,
  }: CoreWorkflowEventInput): CoreObjectEvent {
    return buildCoreWorkflowEvent({
      operation,
      coreWorkflowId,
      coreWorkflowVersionId,
      revision: Date.now(),
    });
  }
}
