export function isValidUrl(url: string): boolean {
  try {
    const uri = new URL(url);
    return uri.protocol === 'http:' || uri.protocol === 'https:';
  } catch {
    return false;
  }
}

export function prepareUrl(
  baseUrl: string,
  topOffset: number,
  bottomOffset: number
): string {
  const uri = new URL(baseUrl);
  uri.searchParams.set('webview_react_native', '1');
  uri.searchParams.set('top_padding', topOffset.toString());
  uri.searchParams.set('bottom_padding', bottomOffset.toString());
  return uri.toString();
}

/**
 * Backend flags come back in different shapes depending on the endpoint:
 * `true` (cancel, charge), `1` (refund), `'1'` (legacy). Accept all of them.
 */
export function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

/**
 * Pick a human-readable error from a web2wave API response body:
 * `error_msg` first, then `message`.
 */
export function extractErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const { error_msg, message } = body as { error_msg?: unknown; message?: unknown };
  if (typeof error_msg === 'string' && error_msg.trim()) return error_msg;
  if (typeof message === 'string' && message.trim()) return message;
  return undefined;
}

/**
 * Read a response body as JSON without throwing on empty or non-JSON bodies
 * (e.g. an HTML error page from a proxy).
 */
export async function readJsonSafely(response: Response): Promise<any> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
