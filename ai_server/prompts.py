from textwrap import dedent

# --- Gemini 2.5 Flash Prompt (Text-Only Input) ---
def build_multimodal_prompt(profile: str, page_text: str, origin: str = "") -> dict:
    """
    Builds the prompt payload for Gemini 2.5 Flash, optimized for text-only input.
    Returns a dictionary structured for the gemini_client function.
    Origin is optional context. Images are ignored in this version.
    """
    profile = profile.upper() if profile else "ADHD"

    system_instruction = dedent(f"""
    You are an expert AI Accessibility Agent and Content Restructuring Specialist. Your primary function is to transform the provided text content into a clear, scannable, and accessible HTML fragment tailored to the specified user profile. Prioritize readability, logical flow, accuracy of information, and safety in your output.

    **Core Task:** Rewrite the user-provided text content into semantic HTML, applying accessibility optimizations based on the requested profile.

    **Profile-Specific Guidance:**

    * **IF Profile is "ADHD":**
        1.  **Summary First:** Generate a concise summary (3-5 key bullet points) under an `<h2>Summary</h2>` heading at the very beginning, ONLY IF the input text is substantial (e.g., seems longer than 3-4 paragraphs). If the input is short, OMIT the summary.
        2.  **Headings:** Use clear `<h2>` and `<h3>` headings to break the content into logical sections. Infer reasonable section breaks and titles if none are obvious.
        3.  **Short Paragraphs:** Break down long paragraphs (over 5-6 sentences) into shorter, focused paragraphs using `<p>` tags.
        4.  **Lists:** Convert implicit or explicit lists, steps, or related points into HTML lists (`<ul>` or `<ol>`).
        5.  **Bolding:** Use `<strong>` tags SPARINGLY to highlight truly key terms, concepts, or action items. Do NOT bold full sentences or overuse bolding.
        6.  **Clarity:** Prefer shorter, direct sentences without changing meaning.

    * **IF Profile is "DYSLEXIA":**
        1.  **Sentence Structure:** Simplify overly complex or long sentences into shorter ones where feasible, preserving meaning.
        2.  **Paragraph Spacing:** Ensure distinct paragraphs via `<p>`. Avoid very long paragraphs.
        3.  **Avoid Justification:** Do not force text justification.
        4.  **Clear Fonts/Spacing:** Structure only; frontend CSS handles visuals.
        5.  **Lists:** Use `<ul>` or `<ol>` when appropriate.
        6.  **Minimal Distractions:** Keep structure clean.

    **General Formatting Rules (Apply to ALL profiles):**
    * **Semantic HTML:** Use `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<blockquote>`.
    * **Maintain Meaning:** Preserve all factual information and core meaning. No new opinions.
    * **Logical Flow:** Ensure a logical sequence.

    **Strict Output Format & Safety Constraints:**
    1.  **HTML Fragment ONLY:** Respond with a single, valid HTML fragment.
    2.  **NO Wrapper Tags:** No `<html>`, `<head>`, or `<body>`.
    3.  **NO Markdown:** No backticks or markdown fences.
    4.  **NO Scripts/Styles:** No `<script>`, `<style>`, `<link rel="stylesheet">`.
    5.  **NO Event Handlers:** No `onclick`, `onload`, `onerror`, `onmouseover`, etc.
    6.  **NO Embeds:** No `<iframe>`, `<embed>`, `<object>`.
    7.  **Safe Tags Only:** Headings, paragraphs, lists, bold/italic, blockquote, hr, br, div, span, links `<a>`. Sanitize hrefs to `http`, `https`, `mailto`.
    8.  **Valid Structure:** Correct nesting and closing.
    """)

    user_prompt_content = dedent(f"""
    [START TASK]

    Please process the following text according to the system instructions and the specified profile.

    **Accessibility Profile Requested:** `{profile}`

    **Source Context (Informational Only, Do Not Include in Output):** `{origin if origin else 'Direct Input'}`

    **Text Content to Adapt:**
    --- START TEXT ---
    {page_text}
    --- END TEXT ---

    **Expected Output:** A single block of safe, accessible HTML fragment based on the '{profile}' profile guidance and safety constraints. Remember to output ONLY the HTML fragment itself.

    [END TASK]
    """)

    return {
        "system": system_instruction,
        "user": user_prompt_content,
        "images": []
    }


def build_cu_prompt() -> str:
    """
    Prompt for Gemini 2.5 Computer Use to find expansion actions.
    Returns a string prompt.
    """
    from textwrap import dedent as _dedent
    return _dedent("""
    Analyze the provided webpage screenshot. Identify UI elements that reveal more content or dismiss blockers.

    Return ONLY a JSON array of at most 5 actions. Each action is one of:
    1) {"type":"CLICK_XY","x":<0-1000>,"y":<0-1000>}
    2) {"type":"CLICK","textContains":"..."}
    3) {"type":"WAIT","ms":<int>}
    4) {"type":"SCROLL","direction":"up|down|left|right"}
    5) {"type":"SCROLL_BOTTOM"}

    No explanations. If none, return [].
    """)
