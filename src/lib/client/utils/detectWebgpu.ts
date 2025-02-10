/**
 * Detects if the browser supports WebGPU.
 */
export async function detectWebGPU(): Promise<boolean> {
  if (!(navigator as any).gpu) return false;

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}
