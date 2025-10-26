# import os
# import re
# from typing import List
# import bleach # Used for sanitizing HTML output from the AI
# from urllib.parse import urlparse # Added for clamp_images
# from io import BytesIO
# import requests
# from PyPDF2 import PdfReader

# MAX_PDF_PAGES = int(os.getenv("MAX_PDF_PAGES", "25"))

# def extract_pdf_text(pdf_url_or_path: str) -> str:
#     try:
#         if pdf_url_or_path.startswith("http"):
#             r = requests.get(pdf_url_or_path, timeout=20)
#             r.raise_for_status()
#             bio = BytesIO(r.content)
#         else:
#             with open(pdf_url_or_path, "rb") as f:
#                 bio = BytesIO(f.read())

#         reader = PdfReader(bio)
#         pages = min(len(reader.pages), MAX_PDF_PAGES)
#         chunks = []
#         for i in range(pages):
#             try:
#                 t = reader.pages[i].extract_text() or ""
#                 chunks.append(t.strip())
#             except Exception:
#                 continue
#         text = "\n\n".join(chunks)
#         return clamp_text(text)
#     except Exception as e:
#         print(f"ERROR: extract_pdf_text failed: {e}")
#         return ""


# # --- Configuration from Environment Variables ---
# # Use defaults from .env file provided by user
# MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "50000"))
# MAX_IMAGES = int(os.getenv("MAX_IMAGES", "15"))

# # --- Bleach Sanitizer Configuration ---
# # Define allowed HTML tags and attributes for the AI's output
# # Start with a safe default and add tags needed for accessible content
# ALLOWED_TAGS = bleach.sanitizer.ALLOWED_TAGS.union({
#     "section", "article", "header", "footer", "aside", "nav", # Semantic tags
#     "h1", "h2", "h3", "h4", "h5", "h6", # Headings
#     "p", "ul", "ol", "li", "dl", "dt", "dd", # Text and list tags
#     "strong", "em", "b", "i", "u", "s", "sub", "sup", "code", "mark", # Inline formatting
#     "blockquote", "hr", "br", # Block elements
#     "span", "div", # Generic containers
#     "img", "figure", "figcaption", # Image related
#     "a", # Links
#     "table", "caption", "thead", "tbody", "tfoot", "tr", "th", "td", # Tables (optional but good for data)
# })

# ALLOWED_ATTRS = {
#     # Allow common attributes, plus specifics for links and images
#     # Avoid 'style' attribute to prevent CSS injection vulnerabilities
#     "*": ["class", "id", "title", "lang", "dir", "aria-label", "role", "data-xpath"], # Added ARIA, data-xpath to wildcard
#     "a": ["href", "title", "target", "rel"], # target="_blank" is common, rel="noopener noreferrer" is safer
#     "img": ["src", "alt", "title", "width", "height", "loading"], # loading="lazy" is useful
#     "li": ["value"], # For ordered lists starting number
#     "ol": ["start", "type"], # type: '1', 'a', 'A', 'i', 'I'
#     "table": ["summary"], # Deprecated but sometimes seen
#     "td": ["colspan", "rowspan", "headers"],
#     "th": ["colspan", "rowspan", "headers", "scope", "abbr"],
#     # Explicitly list tags that can have data-xpath (though wildcard covers it)
#     # "span": ["data-xpath"], "div": ["data-xpath"], etc.
# }

# # Allow standard web protocols for links and image sources
# ALLOWED_PROTOCOLS = ["http", "https", "mailto", "tel"]

# # --- Utility Functions ---

# def clamp_text(s: str) -> str:
#     """
#     Cleans up and truncates text to a maximum length.
#     Removes excessive whitespace.
#     """
#     if not s:
#         return ""
#     # Replace multiple whitespace chars (including newlines, tabs) with a single space
#     s = re.sub(r"\s+", " ", s).strip()
#     # Truncate if longer than MAX_TEXT_CHARS
#     if len(s) > MAX_TEXT_CHARS:
#         print(f"WARN: Truncating text from {len(s)} to {MAX_TEXT_CHARS} characters.")
#         # Find last space before limit to avoid cutting words
#         # Look for a space within the last 100 chars before the limit
#         cut_point = s.rfind(' ', max(0, MAX_TEXT_CHARS - 100), MAX_TEXT_CHARS)
#         if cut_point == -1: # If no space found near the end, just hard cut
#             cut_point = MAX_TEXT_CHARS
#         s = s[:cut_point] + "..." # Add ellipsis to indicate truncation
#     return s

# def clamp_images(urls: List[str]) -> List[str]:
#     """
#     Filters and limits the number of image URLs.
#     - Removes duplicates.
#     - Removes data URIs.
#     - Limits to MAX_IMAGES.
#     - Basic URL validation using urllib.parse.
#     """
#     seen = set()
#     out = []
#     for u in urls or []:
#         # Basic validation and deduplication
#         if not u or not isinstance(u, str) or u in seen:
#             continue
#         # Skip inline data URIs early
#         if u.startswith("data:image"):
#             # print(f"LOG: Skipping data URI image.") # Can be noisy, uncomment if needed
#             continue
#         # Basic check for valid http/https URL structure
#         try:
#             # Handle potential // prefix for scheme-relative URLs by assuming https
#             if u.startswith("//"):
#                 u_to_parse = "https:" + u
#             else:
#                 u_to_parse = u

#             parsed = urlparse(u_to_parse)
#             # Require scheme (http/https) and netloc (domain name)
#             if parsed.scheme not in ['http', 'https'] or not parsed.netloc:
#                  print(f"WARN: Skipping potentially invalid URL scheme or structure: {u[:100]}...")
#                  continue
#         except ValueError:
#             # Catch errors during URL parsing
#             print(f"WARN: Skipping invalid URL format: {u[:100]}...")
#             continue

#         # Add validated URL
#         # Optional: Further validation like checking image file extensions? Likely overkill.
#         out.append(u) # Append the original URL (u), not the potentially modified u_to_parse
#         seen.add(u)
#         if len(out) >= MAX_IMAGES:
#             print(f"WARN: Clamping images to first {MAX_IMAGES}.")
#             break
#     return out

# def sanitize_html(html_input: str) -> str:
#     """
#     Uses bleach to clean the HTML output from the AI model,
#     removing potentially harmful tags and attributes based on ALLOWED_* lists.
#     """
#     if not html_input:
#         return ""

#     try:
#         # Use bleach.linkify optionally? No, let AI generate links directly.
#         cleaned_html = bleach.clean(
#             html_input,
#             tags=ALLOWED_TAGS,
#             attributes=ALLOWED_ATTRS,
#             protocols=ALLOWED_PROTOCOLS,
#             strip=True,  # Remove disallowed tags entirely instead of escaping
#             strip_comments=True # Remove HTML comments
#         )
#         # Check if the cleaning process removed everything, which might indicate issues
#         # Add a more robust check for empty/whitespace-only output
#         if not cleaned_html.strip() and html_input.strip():
#              print("WARN: Sanitizer removed all content. Input might have been malformed or contained only disallowed tags.")
#              # Provide a minimal fallback that indicates content was removed
#              return "<p>(Content removed by security sanitizer)</p>"
#         # Add rel="noopener noreferrer" to external links for security
#         # Note: bleach doesn't do this automatically, would need post-processing or a custom filter
#         # For hackathon, skip this complexity unless specifically needed.
#         # Example using regex (basic, might break complex HTML):
#         # cleaned_html = re.sub(r'<a target="_blank"', '<a target="_blank" rel="noopener noreferrer"', cleaned_html, flags=re.IGNORECASE)
#         return cleaned_html
#     except Exception as e:
#         print(f"ERROR: HTML sanitizer (bleach) failed: {e}")
#         # Fallback to escaping the entire input if bleach crashes, which is safer than returning raw input
#         # Also limit the amount escaped in case of huge malformed input
#         from html import escape
#         escaped_input_preview = escape(html_input[:1000]) + ('...' if len(html_input) > 1000 else '')
#         return f"<p>(Error sanitizing content: {escape(str(e))})</p><pre>{escaped_input_preview}</pre>"

import os
import re
from typing import List
from io import BytesIO

import bleach
import requests
from urllib.parse import urlparse
from PyPDF2 import PdfReader

MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "50000"))
MAX_IMAGES = int(os.getenv("MAX_IMAGES", "15"))
MAX_PDF_PAGES = int(os.getenv("MAX_PDF_PAGES", "25"))

ALLOWED_TAGS = bleach.sanitizer.ALLOWED_TAGS.union({
    "section","article","header","footer","aside","nav",
    "h1","h2","h3","h4","h5","h6",
    "p","ul","ol","li","dl","dt","dd",
    "strong","em","b","i","u","s","sub","sup","code","mark",
    "blockquote","hr","br",
    "span","div",
    "img","figure","figcaption",
    "a",
    "table","caption","thead","tbody","tfoot","tr","th","td",
})
ALLOWED_ATTRS = {
    "*": ["class","id","title","lang","dir","aria-label","role","data-xpath"],
    "a": ["href","title","target","rel"],
    "img": ["src","alt","title","width","height","loading"],
    "li": ["value"],
    "ol": ["start","type"],
    "table": ["summary"],
    "td": ["colspan","rowspan","headers"],
    "th": ["colspan","rowspan","headers","scope","abbr"],
}
ALLOWED_PROTOCOLS = ["http","https","mailto","tel"]

def clamp_text(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) > MAX_TEXT_CHARS:
        cut_point = s.rfind(' ', max(0, MAX_TEXT_CHARS - 100), MAX_TEXT_CHARS)
        if cut_point == -1:
            cut_point = MAX_TEXT_CHARS
        s = s[:cut_point] + "..."
    return s

def clamp_images(urls: List[str]) -> List[str]:
    seen, out = set(), []
    for u in urls or []:
        if not u or not isinstance(u, str) or u in seen:
            continue
        if u.startswith("data:image"):
            continue
        try:
            u_to_parse = "https:" + u if u.startswith("//") else u
            parsed = urlparse(u_to_parse)
            if parsed.scheme not in ["http","https"] or not parsed.netloc:
                continue
        except ValueError:
            continue
        out.append(u)
        seen.add(u)
        if len(out) >= MAX_IMAGES:
            break
    return out

def sanitize_html(html_input: str) -> str:
    if not html_input:
        return ""
    try:
        cleaned_html = bleach.clean(
            html_input,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRS,
            protocols=ALLOWED_PROTOCOLS,
            strip=True,
            strip_comments=True,
        )
        if not cleaned_html.strip() and html_input.strip():
            return "<p>(Content removed by security sanitizer)</p>"
        return cleaned_html
    except Exception as e:
        from html import escape
        preview = escape(html_input[:1000]) + ('...' if len(html_input) > 1000 else '')
        return f"<p>(Error sanitizing content: {escape(str(e))})</p><pre>{preview}</pre>"

def extract_pdf_text(pdf_url_or_path: str) -> str:
    try:
        if pdf_url_or_path.startswith("http"):
            r = requests.get(pdf_url_or_path, timeout=25)
            r.raise_for_status()
            bio = BytesIO(r.content)
        else:
            with open(pdf_url_or_path, "rb") as f:
                bio = BytesIO(f.read())
        reader = PdfReader(bio)
        pages = min(len(reader.pages), MAX_PDF_PAGES)
        chunks = []
        for i in range(pages):
            try:
                t = reader.pages[i].extract_text() or ""
                chunks.append(t.strip())
            except Exception:
                continue
        return clamp_text("\n\n".join(chunks))
    except Exception as e:
        print(f"ERROR: extract_pdf_text failed: {e}")
        return ""
