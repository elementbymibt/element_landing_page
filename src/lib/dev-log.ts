export function devLog(scope: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    const stamp = new Date().toISOString();
    // Structured dev logs for faster CRO debugging.
    console.info(`[CRO][${scope}]`, {
      at: stamp,
      ...payload,
    });
  } catch {
    // No-op by design.
  }
}
