import { isDefined } from 'twenty-shared/utils';

import { CoreObjectEventEntity } from 'src/engine/subscriptions/enums/core-object-event-entity.enum';
import { type CoreObjectEventOperation } from 'src/engine/subscriptions/enums/core-object-event-operation.enum';
import { type CoreObjectEvent } from 'src/engine/subscriptions/types/core-object-event.type';

export const buildCoreWorkflowEvent = ({
  operation,
  coreWorkflowId,
  coreWorkflowVersionId,
  revision,
}: {
  operation: CoreObjectEventOperation;
  coreWorkflowId: string;
  coreWorkflowVersionId?: string;
  revision: number;
}): CoreObjectEvent => ({
  entity: isDefined(coreWorkflowVersionId)
    ? CoreObjectEventEntity.WORKFLOW_VERSION
    : CoreObjectEventEntity.WORKFLOW,
  operation,
  coreWorkflowId,
  coreWorkflowVersionId,
  revision,
});
