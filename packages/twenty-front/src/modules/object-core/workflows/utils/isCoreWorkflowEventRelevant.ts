import { isDefined } from 'twenty-shared/utils';

import { type CoreObjectEvent } from '~/generated-metadata/graphql';

export const isCoreWorkflowEventRelevant = (
  coreObjectEvent: CoreObjectEvent | undefined,
  coreWorkflowId: string | undefined,
): coreObjectEvent is CoreObjectEvent => {
  if (!isDefined(coreObjectEvent)) {
    return false;
  }

  if (!isDefined(coreWorkflowId)) {
    return true;
  }

  return coreObjectEvent.coreWorkflowId === coreWorkflowId;
};
