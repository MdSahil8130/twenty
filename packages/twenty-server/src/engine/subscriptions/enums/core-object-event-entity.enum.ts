import { registerEnumType } from '@nestjs/graphql';

export enum CoreObjectEventEntity {
  WORKFLOW = 'workflow',
  WORKFLOW_VERSION = 'workflowVersion',
}

registerEnumType(CoreObjectEventEntity, {
  name: 'CoreObjectEventEntity',
  description: 'Core Object Event Entity',
});
