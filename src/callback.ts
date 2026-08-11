const encoder = new TextEncoder();

/**
 * Verifies the `X-Signature-SHA256` header of a callback request.
 *
 * Pass the raw request body exactly as received. Verify before parsing and never re-serialize the JSON.
 */
export async function verifyCallbackSignature(
  body: string | Uint8Array,
  signature: string,
  secret: string,
): Promise<boolean> {
  let expected: Uint8Array<ArrayBuffer>;
  try {
    expected = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const data =
    typeof body === "string" ? encoder.encode(body) : Uint8Array.from(body);

  return crypto.subtle.verify("HMAC", key, expected, data);
}
