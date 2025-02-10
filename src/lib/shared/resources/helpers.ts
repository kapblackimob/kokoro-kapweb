/**
 * Fetches a file from the given url, caching it if possible.
 *
 * @param url The url to be fetched
 */
export async function getFileFromUrl(url: string): Promise<ArrayBuffer> {
  console.log("Downloading URL:", url);

  let cache: Cache | null = null;
  try {
    cache = await caches.open("kokoro-web-resources");
    const cached = await cache.match(url);
    if (cached) {
      console.log("Downloaded from cache");
      return await cached.arrayBuffer();
    }
  } catch (err) {
    console.warn("Can't open cache:", err);
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch model: ${res.status}`);
  }

  const buf = await res.arrayBuffer();
  if (!cache) return buf;

  try {
    await cache.put(url, new Response(buf, { headers: res.headers }));
  } catch (err) {
    console.warn("Can't cache model:", err);
  }

  console.log("Downloaded from network");
  return buf;
}
