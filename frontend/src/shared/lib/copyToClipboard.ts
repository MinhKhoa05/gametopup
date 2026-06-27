export async function copyToClipboard(text: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard is not available.");
  }

  await navigator.clipboard.writeText(text);
}
