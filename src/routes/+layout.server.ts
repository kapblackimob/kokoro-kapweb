import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  let enableTracking = true;
  if (env.KW_PUBLIC_NO_TRACK === "true") enableTracking = false;
  if (dev) enableTracking = false;

  return {
    enableTracking,
  };
};
