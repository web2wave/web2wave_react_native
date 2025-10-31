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
