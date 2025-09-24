/**
 * Markdown Sanitizer and Formatter
 * Safely processes and formats markdown content for better readability
 */

export interface MarkdownOptions {
  allowHtml?: boolean;
  sanitizeHtml?: boolean;
  addLineBreaks?: boolean;
  formatLists?: boolean;
  highlightCode?: boolean;
}

export class MarkdownSanitizer {
  private readonly defaultOptions: MarkdownOptions = {
    allowHtml: false,
    sanitizeHtml: true,
    addLineBreaks: true,
    formatLists: true,
    highlightCode: true
  };

  /**
   * Sanitize and format markdown content
   */
  public sanitize(content: string, options?: MarkdownOptions): string {
    const opts = { ...this.defaultOptions, ...options };
    
    let sanitized = content;

    // Basic sanitization
    sanitized = this.removeHarmfulContent(sanitized);
    
    // Process markdown elements
    sanitized = this.formatHeaders(sanitized);
    sanitized = this.formatLists(sanitized, opts.formatLists || false);
    sanitized = this.formatCodeBlocks(sanitized, opts.highlightCode || false);
    sanitized = this.formatInlineCode(sanitized);
    sanitized = this.formatLinks(sanitized);
    sanitized = this.formatEmphasis(sanitized);
    sanitized = this.formatLineBreaks(sanitized, opts.addLineBreaks || false);
    
    // Final cleanup
    sanitized = this.cleanupWhitespace(sanitized);
    
    return sanitized;
  }

  /**
   * Convert markdown to HTML with sanitization
   */
  public toHtml(content: string, options?: MarkdownOptions): string {
    const opts = { ...this.defaultOptions, ...options };
    let html = this.sanitize(content, opts);
    
    // Convert markdown syntax to HTML
    html = this.convertToHtml(html);
    
    if (opts.sanitizeHtml) {
      html = this.sanitizeHtml(html);
    }
    
    return html;
  }

  /**
   * Extract plain text from markdown
   */
  public toPlainText(content: string): string {
    let text = content;
    
    // Remove markdown syntax
    text = text.replace(/#+\s*/g, ''); // Headers
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    text = text.replace(/\*(.*?)\*/g, '$1'); // Italic
    text = text.replace(/`(.*?)`/g, '$1'); // Inline code
    text = text.replace(/```[\s\S]*?```/g, ''); // Code blocks
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
    text = text.replace(/^[-*+]\s+/gm, ''); // List markers
    text = text.replace(/^\d+\.\s+/gm, ''); // Numbered lists
    
    return this.cleanupWhitespace(text);
  }

  /**
   * Remove potentially harmful content
   */
  private removeHarmfulContent(content: string): string {
    // Remove script tags and their content
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove on* attributes (onclick, onload, etc.)
    content = content.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: links
    content = content.replace(/javascript:/gi, '');
    
    // Remove data: URIs (except data:image)
    content = content.replace(/data:(?!image)[^;]*;[^"']*/gi, '');
    
    return content;
  }

  /**
   * Format headers with proper hierarchy
   */
  private formatHeaders(content: string): string {
    // Ensure headers have proper spacing
    content = content.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, text) => {
      const cleanText = text.trim();
      return `${hashes} ${cleanText}`;
    });
    
    // Add spacing around headers
    content = content.replace(/^(#{1,6}\s+.+)$/gm, '\n$1\n');
    
    return content;
  }

  /**
   * Format lists with consistent indentation
   */
  private formatLists(content: string, enableFormatting: boolean): string {
    if (!enableFormatting) return content;
    
    // Unordered lists
    content = content.replace(/^(\s*)[-*+]\s+(.+)$/gm, '$1• $2');
    
    // Ordered lists - ensure proper numbering
    const lines = content.split('\n');
    let inOrderedList = false;
    let listCounter = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const orderedListMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
      
      if (orderedListMatch) {
        const indent = orderedListMatch[1];
        const text = orderedListMatch[2];
        
        if (!inOrderedList) {
          listCounter = 1;
          inOrderedList = true;
        }
        
        lines[i] = `${indent}${listCounter}. ${text}`;
        listCounter++;
      } else {
        inOrderedList = false;
        listCounter = 1;
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Format code blocks with syntax highlighting hints
   */
  private formatCodeBlocks(content: string, enableHighlighting: boolean): string {
    if (!enableHighlighting) return content;
    
    // Format fenced code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      const cleanCode = code.trim();
      return `\`\`\`${language}\n${cleanCode}\n\`\`\``;
    });
    
    // Ensure code blocks have proper spacing
    content = content.replace(/```[\s\S]*?```/g, (match) => `\n${match}\n`);
    
    return content;
  }

  /**
   * Format inline code
   */
  private formatInlineCode(content: string): string {
    // Ensure proper spacing around inline code
    content = content.replace(/`([^`]+)`/g, ' `$1` ');
    
    // Clean up multiple spaces around code
    content = content.replace(/\s+`([^`]+)`\s+/g, ' `$1` ');
    
    return content;
  }

  /**
   * Format and validate links
   */
  private formatLinks(content: string): string {
    // Standard markdown links
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const cleanUrl = this.sanitizeUrl(url.trim());
      const cleanText = text.trim();
      return `[${cleanText}](${cleanUrl})`;
    });
    
    // Auto-link URLs
    content = content.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
      const cleanUrl = this.sanitizeUrl(url);
      return `[${cleanUrl}](${cleanUrl})`;
    });
    
    return content;
  }

  /**
   * Sanitize URLs
   */
  private sanitizeUrl(url: string): string {
    // Remove dangerous protocols
    if (/^(javascript|data|vbscript):/i.test(url)) {
      return '#';
    }
    
    // Ensure http/https for external links
    if (!/^https?:\/\//i.test(url) && !url.startsWith('#') && !url.startsWith('/')) {
      return `https://${url}`;
    }
    
    return url;
  }

  /**
   * Format emphasis (bold, italic)
   */
  private formatEmphasis(content: string): string {
    // Ensure proper spacing around emphasis
    content = content.replace(/\*\*([^*]+)\*\*/g, ' **$1** ');
    content = content.replace(/\*([^*]+)\*/g, ' *$1* ');
    
    // Clean up multiple spaces
    content = content.replace(/\s+\*\*([^*]+)\*\*\s+/g, ' **$1** ');
    content = content.replace(/\s+\*([^*]+)\*\s+/g, ' *$1* ');
    
    return content;
  }

  /**
   * Add proper line breaks
   */
  private formatLineBreaks(content: string, enableFormatting: boolean): string {
    if (!enableFormatting) return content;
    
    // Add line breaks after sentences in paragraphs
    content = content.replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2');
    
    // Ensure paragraphs are separated
    content = content.replace(/\n{3,}/g, '\n\n');
    
    return content;
  }

  /**
   * Clean up excessive whitespace
   */
  private cleanupWhitespace(content: string): string {
    // Remove trailing spaces
    content = content.replace(/[ \t]+$/gm, '');
    
    // Normalize line endings
    content = content.replace(/\r\n/g, '\n');
    
    // Remove excessive blank lines
    content = content.replace(/\n{4,}/g, '\n\n\n');
    
    // Trim start and end
    content = content.trim();
    
    return content;
  }

  /**
   * Convert markdown to HTML
   */
  private convertToHtml(content: string): string {
    let html = content;
    
    // Headers
    html = html.replace(/^(#{6})\s+(.+)$/gm, '<h6>$2</h6>');
    html = html.replace(/^(#{5})\s+(.+)$/gm, '<h5>$2</h5>');
    html = html.replace(/^(#{4})\s+(.+)$/gm, '<h4>$2</h4>');
    html = html.replace(/^(#{3})\s+(.+)$/gm, '<h3>$2</h3>');
    html = html.replace(/^(#{2})\s+(.+)$/gm, '<h2>$2</h2>');
    html = html.replace(/^(#{1})\s+(.+)$/gm, '<h1>$2</h1>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${language}>${this.escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold and italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Lists
    html = html.replace(/^(\s*)•\s+(.+)$/gm, '$1<li>$2</li>');
    html = html.replace(/^(\s*)\d+\.\s+(.+)$/gm, '$1<li>$2</li>');
    
    // Wrap list items in ul/ol tags
    html = this.wrapListItems(html);
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }
    
    return html;
  }

  /**
   * Wrap consecutive list items in proper list tags
   */
  private wrapListItems(content: string): string {
    const lines = content.split('\n');
    const result: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    
    for (const line of lines) {
      const isUnorderedItem = /^\s*<li>/.test(line) && !inOrderedList;
      const isOrderedItem = /^\s*<li>/.test(line) && inOrderedList;
      
      if (isUnorderedItem && !inUnorderedList) {
        result.push('<ul>');
        inUnorderedList = true;
      } else if (!isUnorderedItem && inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      
      if (isOrderedItem && !inOrderedList) {
        result.push('<ol>');
        inOrderedList = true;
      } else if (!isOrderedItem && inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      
      result.push(line);
    }
    
    // Close any remaining lists
    if (inUnorderedList) result.push('</ul>');
    if (inOrderedList) result.push('</ol>');
    
    return result.join('\n');
  }

  /**
   * Sanitize HTML content
   */
  private sanitizeHtml(html: string): string {
    // Allow only safe HTML tags
    // Remove disallowed tags
    html = html.replace(/<(?!\/?(?:${allowedTags.join('|')})\b)[^>]*>/gi, '');
    
    // Remove disallowed attributes
    html = html.replace(/(<[^>]+)\s+((?!(?:${allowedAttributes.join('|')})\s*=)[^=\s]+(?:\s*=\s*[^>\s]+)?)\s*/gi, '$1 ');
    
    return html;
  }

  /**
   * Escape HTML entities
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Utility functions for common markdown operations
 */

export const markdownSanitizer = new MarkdownSanitizer();

export function sanitizeMarkdown(content: string, options?: MarkdownOptions): string {
  return markdownSanitizer.sanitize(content, options);
}

export function markdownToHtml(content: string, options?: MarkdownOptions): string {
  return markdownSanitizer.toHtml(content, options);
}

export function markdownToPlainText(content: string): string {
  return markdownSanitizer.toPlainText(content);
}

/**
 * Format conversation messages with markdown - converts to readable text
 */
export function formatConversationMessage(content: string): string {
  // First, escape any HTML content to prevent XSS
  const sanitized = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Convert markdown to readable text
  let readable = sanitized;

  // Remove code block markers but keep content
  readable = readable.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1');

  // Remove inline code markers but keep content
  readable = readable.replace(/`([^`]+)`/g, '$1');

  // Remove bold markers but keep content
  readable = readable.replace(/\*\*([^*]+)\*\*/g, '$1');

  // Remove italic markers but keep content
  readable = readable.replace(/\*([^*]+)\*/g, '$1');

  // Remove header markers but keep content
  readable = readable.replace(/^#+\s+(.+)$/gm, '$1');

  // Clean up list markers
  readable = readable.replace(/^[-*+]\s+/gm, '');
  readable = readable.replace(/^\d+\.\s+/gm, '');

  // Clean up excessive whitespace and normalize line breaks
  readable = readable.replace(/\n{3,}/g, '\n\n');
  readable = readable.trim();

  return readable;
}

/**
 * Extract key information from markdown content
 */
export function extractMarkdownSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Extract headers and their content
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headerRegex.exec(content)) !== null) {
    const title = match[2].trim();
    const key = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    sections[key] = title;
  }
  
  return sections;
}

/**
 * Validate markdown content
 */
export function validateMarkdown(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for unclosed code blocks
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push('Unclosed code block detected');
  }
  
  // Check for unclosed inline code
  const inlineCodeMatches = content.match(/`/g);
  if (inlineCodeMatches && inlineCodeMatches.length % 2 !== 0) {
    errors.push('Unclosed inline code detected');
  }
  
  // Check for malformed links
  const malformedLinks = content.match(/\[[^\]]*\]\([^)]*$/g);
  if (malformedLinks) {
    errors.push('Malformed links detected');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}