import { isCoreWorkflowEventRelevant } from '@/object-core/workflows/utils/isCoreWorkflowEventRelevant';
import {
  CoreObjectEventEntity,
  CoreObjectEventOperation,
  type CoreObjectEvent,
} from '~/generated-metadata/graphql';

const buildEvent = (
  overrides: Partial<CoreObjectEvent> = {},
): CoreObjectEvent => ({
  __typename: 'CoreObjectEvent',
  entity: CoreObjectEventEntity.WORKFLOW,
  operation: CoreObjectEventOperation.UPDATED,
  coreWorkflowId: 'core-workflow-1',
  revision: 1,
  ...overrides,
});

describe('isCoreWorkflowEventRelevant', () => {
  it('ignores an undefined event', () => {
    expect(isCoreWorkflowEventRelevant(undefined, 'core-workflow-1')).toBe(
      false,
    );
  });

  it('accepts every workflow event when no workflow is scoped', () => {
    expect(isCoreWorkflowEventRelevant(buildEvent(), undefined)).toBe(true);
  });

  it('accepts an event for the scoped workflow', () => {
    expect(isCoreWorkflowEventRelevant(buildEvent(), 'core-workflow-1')).toBe(
      true,
    );
  });

  it('rejects an event for another workflow', () => {
    expect(isCoreWorkflowEventRelevant(buildEvent(), 'core-workflow-2')).toBe(
      false,
    );
  });

  it('accepts a version event of the scoped workflow', () => {
    const versionEvent = buildEvent({
      entity: CoreObjectEventEntity.WORKFLOW_VERSION,
      operation: CoreObjectEventOperation.DELETED,
      coreWorkflowVersionId: 'core-version-1',
    });

    expect(isCoreWorkflowEventRelevant(versionEvent, 'core-workflow-1')).toBe(
      true,
    );
  });
});
