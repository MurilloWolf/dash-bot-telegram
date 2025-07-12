/**
 * Escapes special characters for safe Markdown formatting in Telegram
 * Based on the official Telegram Bot API documentation
 */
export function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/`/g, "\\`")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/~/g, "\\~")
    .replace(/>/g, "\\>")
    .replace(/#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/-/g, "\\-")
    .replace(/=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/!/g, "\\!");
}

/**
 * Removes Markdown formatting from text
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*(.+?)\*/g, "$1") // Remove bold
    .replace(/_(.+?)_/g, "$1") // Remove italics
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .replace(/\\(.)/g, "$1"); // Remove escapes
}

/**
 * Removes HTML formatting from text
 */
export function stripHTML(text: string): string {
  return text
    .replace(/<b>(.+?)<\/b>/g, "$1") // Remove HTML bold
    .replace(/<i>(.+?)<\/i>/g, "$1") // Remove HTML italics
    .replace(/<code>(.+?)<\/code>/g, "$1") // Remove HTML code
    .replace(/<a [^>]*>(.+?)<\/a>/g, "$1") // Remove HTML links
    .replace(/<[^>]*>/g, ""); // Remove other HTML tags
}

/**
 * Removes any type of formatting (Markdown or HTML)
 */
export function stripFormatting(text: string): string {
  return stripHTML(stripMarkdown(text));
}

/**
 * Formats text as bold in Markdown safely
 */
export function bold(text: string): string {
  return `*${escapeMarkdown(text)}*`;
}

/**
 * Formats text as italic in Markdown safely
 */
export function italic(text: string): string {
  return `_${escapeMarkdown(text)}_`;
}

/**
 * Formats text as inline code in Markdown safely
 */
export function code(text: string): string {
  return `\`${text.replace(/`/g, "\\`")}\``;
}

/**
 * Formats link in Markdown safely
 */
export function link(text: string, url: string): string {
  // For links, we only escape the text, not the URL
  return `[${escapeMarkdown(text)}](${url})`;
}

/**
 * Formats text for use in links without causing parsing issues
 */
export function safeLink(text: string, url: string): string {
  // Remove problematic characters from link text
  const safeText = text.replace(/[[\]()]/g, "");
  return `[${safeText}](${url})`;
}
