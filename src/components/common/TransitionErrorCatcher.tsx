'use client';

import { useEffect } from 'react';

export default function TransitionErrorCatcher() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        (event.reason.name === 'AbortError' ||
          (event.reason.message &&
            event.reason.message.includes('Transition was aborted')) ||
          String(event.reason).includes('Transition was aborted'))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (
        event.error &&
        (event.error.name === 'AbortError' ||
          (event.error.message &&
            event.error.message.includes('Transition was aborted')) ||
          String(event.error).includes('Transition was aborted'))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection, true);
    window.addEventListener('error', handleError, true);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection, true);
      window.removeEventListener('error', handleError, true);
    };
  }, []);

  return null;
}
