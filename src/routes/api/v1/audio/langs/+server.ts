import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { langs } from "$lib/shared/resources";

export const GET: RequestHandler = async () => {
  return json(langs);
};
