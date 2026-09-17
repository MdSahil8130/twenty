import { gql } from '@apollo/client';

export const ON_EVENT_SUBSCRIPTION = gql`
  subscription OnEventSubscription($eventStreamId: String!) {
    onEventSubscription(eventStreamId: $eventStreamId) {
      eventStreamId
      objectRecordEventsWithQueryIds {
        objectRecordEvent {
          action
          objectNameSingular
          recordId
          userId
          workspaceMemberId
          properties {
            updatedFields
            before
            after
            diff
          }
        }
        queryIds
      }
      metadataEvents {
        type
        metadataName
        recordId
        updatedCollectionHash
        properties {
          updatedFields
          before
          after
          diff
        }
      }
      coreObjectEvents {
        entity
        operation
        coreWorkflowId
        coreWorkflowVersionId
        revision
      }
      queueJobEvents {
        jobId
        state
        attemptsMade
        failedReason
        enqueuedAt
        startedAt
        finishedAt
      }
    }
  }
`;
