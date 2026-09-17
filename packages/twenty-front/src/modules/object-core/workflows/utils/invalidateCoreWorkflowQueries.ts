import { type ApolloClient } from '@apollo/client';

import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowsDocument,
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionsDocument,
} from '~/generated/graphql';

export const invalidateCoreWorkflowQueries = async (
  apolloCoreClient: ApolloClient,
  {
    shouldInvalidateWorkflowList = true,
  }: { shouldInvalidateWorkflowList?: boolean } = {},
) => {
  const fieldNames = [
    'coreWorkflow',
    'coreWorkflowVersion',
    'coreWorkflowVersions',
    ...(shouldInvalidateWorkflowList ? ['coreWorkflows'] : []),
  ];

  for (const fieldName of fieldNames) {
    apolloCoreClient.cache.evict({ id: 'ROOT_QUERY', fieldName });
  }

  await apolloCoreClient.refetchQueries({
    include: [
      GetCoreWorkflowVersionsDocument,
      GetCoreWorkflowVersionDocument,
      GetCoreWorkflowDocument,
      ...(shouldInvalidateWorkflowList ? [GetCoreWorkflowsDocument] : []),
    ],
    onQueryUpdated: (query) => query.options.fetchPolicy !== 'standby',
  });
};
