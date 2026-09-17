import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { CORE_OBJECT_BROWSER_EVENT_NAME } from '@/sse-db-event/constants/CoreObjectBrowserEventName';
import { type CoreObjectEvent } from '~/generated-metadata/graphql';

export const dispatchCoreObjectEventsFromSseToBrowserEvents = (
  coreObjectEvents: CoreObjectEvent[],
) => {
  for (const coreObjectEvent of coreObjectEvents) {
    dispatchBrowserEvent(CORE_OBJECT_BROWSER_EVENT_NAME, coreObjectEvent);
  }
};
