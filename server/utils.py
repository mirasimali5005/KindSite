import os
import re
from typing import List
import bleach

MAX_TEXT = int(os.getenv("MAX_TEXT_CHARS", "40000"))
MAX_IMAGES = int(os.getenv("MAX_IMAGES", "10"))

# Minimal but safe-ish sanitizer for model HTML output.
# Strips scripts/events; allows only a small tag/attr set for readability.
ALLOWED_TAGS = bleach.sanitizer.ALLOWED_TAGS.union({
    "section","article","header","footer","aside",
    "h1","h2","h3","h4","h5","h6",
    "p","ul","ol","li","strong","em","b","i","code",
    "blockquote","hr","br","span","div","img","a"
})
ALLOWED_ATTRS = {
    **bleach.sanitizer.ALLOWED_ATTRIBUTES,
    "a": ["href","title","name","target","rel"],
    "img": ["src","alt","title","aria-label","role"],
    "span": ["data-xpath"],
    "div": ["data-xpath"],
}
ALLOWED_PROTOCOLS = ["http","https","mailto"]

def clamp_text(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"\s+", " ", s).strip()
    return s[:MAX_TEXT]

def clamp_images(urls: List[str]) -> List[str]:
    seen = set()
    out = []
    for u in urls or []:
        if not u or u in seen:
            continue
        if u.startswith("data:"):  # skip inline data URIs
            continue
        out.append(u)
        seen.add(u)
        if len(out) >= MAX_IMAGES:
            break
    return out

def sanitize_html(html: str) -> str:
    return bleach.clean(
        html or "",
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRS,
        protocols=ALLOWED_PROTOCOLS,
        strip=True
    )
