import { type CoreObjectEventEntity } from 'src/engine/subscriptions/enums/core-object-event-entity.enum';
import { type CoreObjectEventOperation } from 'src/engine/subscriptions/enums/core-object-event-operation.enum';

export type CoreObjectEvent = {
  entity: CoreObjectEventEntity;
  operation: CoreObjectEventOperation;
  coreWorkflowId: string;
  coreWorkflowVersionId?: string;
  revision: number;
};
