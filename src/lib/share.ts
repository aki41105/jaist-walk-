export type ShareResult = 'shared' | 'copied' | 'failed';

export async function shareContent(params: {
  title: string;
  text: string;
  url?: string;
}): Promise<ShareResult> {
  // Try Web Share API first
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: params.title,
        text: params.text,
        url: params.url,
      });
      return 'shared';
    } catch (err) {
      // User cancelled or error - fall through to clipboard
      if (err instanceof Error && err.name === 'AbortError') {
        return 'failed';
      }
    }
  }

  // Fallback: copy to clipboard
  try {
    const copyText = params.url ? `${params.text}\n${params.url}` : params.text;
    await navigator.clipboard.writeText(copyText);
    return 'copied';
  } catch {
    return 'failed';
  }
}
