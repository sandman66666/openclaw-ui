/**
 * Lightweight markdown renderer for UI elements
 * Converts markdown to sanitized HTML for safe rendering
 */

export function toSanitizedLightMarkdownHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers (##, ###)
  html = html.replace(/^### (.+)$/gm, '<h3 class="markdown-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="markdown-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="markdown-h1">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="markdown-bold">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="markdown-bold">$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em class="markdown-italic">$1</em>');
  html = html.replace(/_(.+?)_/g, '<em class="markdown-italic">$1</em>');

  // Code inline
  html = html.replace(/`(.+?)`/g, '<code class="markdown-code">$1</code>');

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Lists (unordered)
  html = html.replace(/^\* (.+)$/gm, '<li class="markdown-li">$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li class="markdown-li">$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(new RegExp('(<li[^>]*>.*?</li>\\n?)+', 'gs'), (match) => {
    return `<ul class="markdown-ul">${match}</ul>`;
  });

  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}
