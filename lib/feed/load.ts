import { cache } from "react";
import { fetchAllFeeds } from "@/lib/feed/fetch";
import { buildOverview, type Overview } from "@/lib/feed/aggregate";

/** One fetch of every app per request, shared by the layout and the page. */
export const loadOverview = cache(async (): Promise<Overview> => {
  const results = await fetchAllFeeds();
  return buildOverview(results);
});
