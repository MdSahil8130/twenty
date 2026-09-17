import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CoreObjectEventEntity } from 'src/engine/subscriptions/enums/core-object-event-entity.enum';
import { CoreObjectEventOperation } from 'src/engine/subscriptions/enums/core-object-event-operation.enum';

@ObjectType('CoreObjectEvent')
export class CoreObjectEventDTO {
  @Field(() => CoreObjectEventEntity)
  entity: CoreObjectEventEntity;

  @Field(() => CoreObjectEventOperation)
  operation: CoreObjectEventOperation;

  @Field(() => UUIDScalarType)
  coreWorkflowId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  coreWorkflowVersionId?: string;

  @Field(() => Number)
  revision: number;
}
