import { CoreObjectEventEntity } from 'src/engine/subscriptions/enums/core-object-event-entity.enum';
import { CoreObjectEventOperation } from 'src/engine/subscriptions/enums/core-object-event-operation.enum';
import { buildCoreWorkflowEvent } from 'src/engine/subscriptions/core-object-event/utils/build-core-workflow-event.util';

describe('buildCoreWorkflowEvent', () => {
  it('builds a workflow event when no version is given', () => {
    expect(
      buildCoreWorkflowEvent({
        operation: CoreObjectEventOperation.UPDATED,
        coreWorkflowId: 'core-workflow-1',
        revision: 12,
      }),
    ).toEqual({
      entity: CoreObjectEventEntity.WORKFLOW,
      operation: CoreObjectEventOperation.UPDATED,
      coreWorkflowId: 'core-workflow-1',
      coreWorkflowVersionId: undefined,
      revision: 12,
    });
  });

  it('builds a version event when a version is given', () => {
    expect(
      buildCoreWorkflowEvent({
        operation: CoreObjectEventOperation.DELETED,
        coreWorkflowId: 'core-workflow-1',
        coreWorkflowVersionId: 'core-version-1',
        revision: 13,
      }),
    ).toEqual({
      entity: CoreObjectEventEntity.WORKFLOW_VERSION,
      operation: CoreObjectEventOperation.DELETED,
      coreWorkflowId: 'core-workflow-1',
      coreWorkflowVersionId: 'core-version-1',
      revision: 13,
    });
  });

  it('never carries workspace identifiers or definition content', () => {
    const event = buildCoreWorkflowEvent({
      operation: CoreObjectEventOperation.CREATED,
      coreWorkflowId: 'core-workflow-1',
      coreWorkflowVersionId: 'core-version-1',
      revision: 1,
    });

    expect(Object.keys(event).sort()).toEqual([
      'coreWorkflowId',
      'coreWorkflowVersionId',
      'entity',
      'operation',
      'revision',
    ]);
  });
});
