/**
 * Track an event with Umami, it will retry every second until the umami
 * script is loaded
 *
 * https://umami.is/docs/tracker-functions
 *
 * @param event The event name
 * @param eventData The event data
 */
export const track = (event: string, eventData?: any) => {
  if ((window as any).disableTracking) {
    console.log("Tracking is disabled");
    return;
  }

  if (typeof (window as any).umami !== "undefined") {
    (window as any).umami.track(event, eventData);
    return;
  }

  setTimeout(() => {
    track(event, eventData);
  }, 1000);
};

/**
 * Identify a session with Umami, it will retry every second until the umami
 * script is loaded
 *
 * https://umami.is/docs/tracker-functions
 *
 * @param sessionData The session data
 */
export const identify = (sessionData: any) => {
  if ((window as any).disableTracking) {
    console.log("Tracking is disabled");
    return;
  }

  if (typeof (window as any).umami !== "undefined") {
    (window as any).umami.identify(sessionData);
    return;
  }

  setTimeout(() => {
    identify(sessionData);
  }, 1000);
};
