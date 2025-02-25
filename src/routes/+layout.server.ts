import { KW_NO_TRACK } from "$env/static/private";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  let enableTracking = true;
  if (KW_NO_TRACK === "true") enableTracking = false;

  return {
    enableTracking,
  };
};
