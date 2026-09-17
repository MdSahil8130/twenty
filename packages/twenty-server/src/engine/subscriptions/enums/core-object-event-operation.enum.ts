import { registerEnumType } from '@nestjs/graphql';

export enum CoreObjectEventOperation {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

registerEnumType(CoreObjectEventOperation, {
  name: 'CoreObjectEventOperation',
  description: 'Core Object Event Operation',
});
