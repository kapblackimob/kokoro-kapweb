import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { models } from "$lib/shared/resources";

export const GET: RequestHandler = async () => {
  return json(models);
};
