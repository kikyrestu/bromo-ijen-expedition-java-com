// HTML sanitization utility
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove Google's data attributes and classes
  const cleaned = html
    // Remove Google's data attributes (comprehensive)
    .replace(/\s*data-[a-zA-Z0-9-]+="[^"]*"/g, '')
    // Remove Google's specific classes
    .replace(/\s*class="[^"]*(?:Y3BBE|Fsg96|otQkpb|KsbFXc|U6u95|T286Pc|Yjhzub|eujQNb|j3tEEe)[^"]*"/g, '')
    // Remove role attributes
    .replace(/\s*role="[^"]*"/g, '')
    // Remove aria-level attributes
    .replace(/\s*aria-level="[^"]*"/g, '')
    // Remove aria-label attributes
    .replace(/\s*aria-label="[^"]*"/g, '')
    // Remove tabindex attributes
    .replace(/\s*tabindex="[^"]*"/g, '')
    // Remove allowfullscreen attributes
    .replace(/\s*allowfullscreen="[^"]*"/g, '')
    // Remove loading attributes
    .replace(/\s*loading="[^"]*"/g, '')
    // Remove referrerpolicy attributes
    .replace(/\s*referrerpolicy="[^"]*"/g, '')
    // Remove style attributes with specific Google styles
    .replace(/\s*style="[^"]*(?:border:0|width:\s*\d+px|height:\s*\d+px)[^"]*"/g, '')
    // Clean up empty class attributes
    .replace(/\s*class="\s*"/g, '')
    // Clean up empty style attributes
    .replace(/\s*style="\s*"/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up spaces before closing tags
    .replace(/\s+>/g, '>')
    // Clean up spaces after opening tags
    .replace(/>\s+/g, '>')
    // Remove empty paragraphs with only &nbsp;
    .replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/g, '')
    // Remove empty divs with only &nbsp;
    .replace(/<div[^>]*>\s*&nbsp;\s*<\/div>/g, '')
    // Remove empty spans
    .replace(/<span[^>]*>\s*<\/span>/g, '')
    // Clean up line breaks
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return cleaned;
}

// Alternative: Strip all HTML and return plain text
export function stripHtml(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}
