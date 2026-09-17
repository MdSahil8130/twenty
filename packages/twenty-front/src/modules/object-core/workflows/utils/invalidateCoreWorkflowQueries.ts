import { type ApolloClient } from '@apollo/client';

import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowsDocument,
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionsDocument,
} from '~/generated/graphql';

export const invalidateCoreWorkflowQueries = async (
  apolloCoreClient: ApolloClient,
) => {
  for (const fieldName of [
    'coreWorkflow',
    'coreWorkflowVersion',
    'coreWorkflowVersions',
  ]) {
    apolloCoreClient.cache.evict({ id: 'ROOT_QUERY', fieldName });
  }

  await apolloCoreClient.refetchQueries({
    include: [
      GetCoreWorkflowVersionsDocument,
      GetCoreWorkflowVersionDocument,
      GetCoreWorkflowDocument,
      GetCoreWorkflowsDocument,
    ],
    onQueryUpdated: (query) => query.options.fetchPolicy !== 'standby',
  });
};
