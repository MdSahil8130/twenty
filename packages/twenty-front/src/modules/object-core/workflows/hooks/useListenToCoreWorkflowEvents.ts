import { captureException } from '@sentry/react';
import { useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { invalidateCoreWorkflowQueries } from '@/object-core/workflows/utils/invalidateCoreWorkflowQueries';
import { CORE_OBJECT_BROWSER_EVENT_NAME } from '@/sse-db-event/constants/CoreObjectBrowserEventName';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { type CoreObjectEvent } from '~/generated-metadata/graphql';

import { CORE_WORKFLOW_EVENT_DEBOUNCE_TIME_IN_MS } from '@/object-core/workflows/constants/CoreWorkflowEventDebounceTimeInMs';
import { CORE_WORKFLOW_EVENT_MAX_WAIT_TIME_IN_MS } from '@/object-core/workflows/constants/CoreWorkflowEventMaxWaitTimeInMs';
import { isCoreWorkflowEventRelevant } from '@/object-core/workflows/utils/isCoreWorkflowEventRelevant';

export const useListenToCoreWorkflowEvents = ({
  coreWorkflowId,
  onCoreWorkflowEvent,
  skip = false,
}: {
  coreWorkflowId?: string;
  onCoreWorkflowEvent?: (coreObjectEvent: CoreObjectEvent) => void;
  skip?: boolean;
} = {}) => {
  const apolloCoreClient = useApolloCoreClient();

  const isReconcilingRef = useRef(false);
  const hasPendingReconciliationRef = useRef(false);

  const reconcile = useCallback(async () => {
    if (isReconcilingRef.current) {
      hasPendingReconciliationRef.current = true;

      return;
    }

    isReconcilingRef.current = true;

    try {
      do {
        hasPendingReconciliationRef.current = false;

        try {
          await invalidateCoreWorkflowQueries(apolloCoreClient);
        } catch (error) {
          captureException(
            error instanceof Error
              ? error
              : new Error('Failed to reconcile core workflow queries'),
          );
        }
      } while (hasPendingReconciliationRef.current);
    } finally {
      isReconcilingRef.current = false;
    }
  }, [apolloCoreClient]);

  const debouncedReconcile = useDebouncedCallback(
    reconcile,
    CORE_WORKFLOW_EVENT_DEBOUNCE_TIME_IN_MS,
    { leading: false, maxWait: CORE_WORKFLOW_EVENT_MAX_WAIT_TIME_IN_MS },
  );

  const handleCoreObjectEvent = useCallback(
    (coreObjectEvent?: CoreObjectEvent) => {
      if (
        skip ||
        !isCoreWorkflowEventRelevant(coreObjectEvent, coreWorkflowId)
      ) {
        return;
      }

      onCoreWorkflowEvent?.(coreObjectEvent);

      debouncedReconcile();
    },
    [skip, coreWorkflowId, onCoreWorkflowEvent, debouncedReconcile],
  );

  useListenToBrowserEvent<CoreObjectEvent>({
    eventName: CORE_OBJECT_BROWSER_EVENT_NAME,
    onBrowserEvent: handleCoreObjectEvent,
  });

  const debouncedResync = useDebouncedCallback(
    () => {
      if (skip) {
        return;
      }

      void reconcile();
    },
    SSE_RESYNC_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedResync,
  });
};
