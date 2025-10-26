from textwrap import dedent

# --- Gemini 1.5 Pro Prompt ---
def build_multimodal_prompt(origin: str, profile: str, page_text: str, image_urls: list[str]) -> dict:
    """
    Builds the prompt payload for Gemini 1.5 Pro.
    Returns a dictionary structured for the gemini_client function.
    """
    # Ensure profile is uppercase for consistency in the prompt
    profile = profile.upper() if profile else "ADHD"

    system_instruction = dedent(f"""
    You are an AI Accessibility Agent. Your task is to transform the provided webpage content into a single, accessible HTML fragment optimized for a user with [Profile: {profile}].

    **Instructions:**
    1.  **Analyze Content:** Read all the provided text and understand the referenced images based on their URLs/context.
    2.  **Generate Summary:** Create a concise 'Key Takeaways' summary (3-5 bullet points) at the top inside a `<h2>Summary</h2>` section. If the text is very short (e.g., less than 3 paragraphs), skip the summary.
    3.  **Restructure Text:** Rewrite the main text content below the summary (if generated).
        * Use clear, semantic headings (`<h2>`, `<h3>`) for logical sections. Infer sections if not obvious from the text flow. Use headings appropriately; avoid overuse.
        * Break long paragraphs into shorter ones (max 4-5 sentences is ideal). Ensure paragraphs flow logically.
        * Use bullet points (`<ul><li>`) or numbered lists (`<ol><li>`) extensively whenever listing items, steps, features, or distinct ideas presented consecutively.
        * Bold key terms or important phrases using `<strong>` tags judiciously for emphasis. Do not bold entire sentences.
    4.  **Caption Images:** For each image URL provided in the [IMAGES] list, write a brief, descriptive caption (1-2 sentences max). Integrate the caption naturally into the rewritten text near where the image likely appeared in the original flow. Format captions clearly using `<p><em>[Caption for Image 1: Description...]</em></p>`. If the image seems purely decorative or its context is unclear from the text, you may state "[Decorative Image]" or omit the caption.
    5.  **Output Format:** Return ONLY the raw HTML fragment. Do NOT include `<html>`, `<head>`, `<body>` tags. Do NOT include any markdown formatting like ` ```html `. Your entire response should be valid HTML suitable for direct injection into a `<div>`. Ensure proper tag nesting and closing.
    6.  **Safety:** Absolutely DO NOT include any `<script>` tags, inline event handlers (like `onclick`, `onerror`), `<iframe>` tags, or external stylesheets (`<link rel="stylesheet">`) in your output. Only use basic, safe HTML tags for structure and text formatting as defined in the sanitizer rules (headings, p, lists, strong, em, img, a, etc.). Ensure `<a>` tags have reasonable `href` attributes if context provides them, otherwise omit the `<a>` tag or use a placeholder like `#`. Ensure `<img>` tags have descriptive `alt` attributes derived from your caption.
    """)

    # Combine user text and image references for the user part of the prompt
    user_content_parts = []
    user_content_parts.append(dedent(f"""
    [START WEBPAGE CONTENT]
    Originating URL (for context, do not include in output): {origin}
    Accessibility Profile Requested: {profile}

    Full Page Text Content (Note: This text might be truncated for length):
    --- START TEXT ---
    {page_text}
    --- END TEXT ---
    """))

    if image_urls:
        user_content_parts.append("\nImages Referenced on Page (Provide captions for these in the HTML output):")
        for i, url in enumerate(image_urls):
            # Limit URL length in prompt just in case
            safe_url = url[:200] + "..." if len(url) > 200 else url
            user_content_parts.append(f"- Image {i+1} URL: {safe_url}")
    else:
        user_content_parts.append("\nNo images were extracted from this page.")

    user_content_parts.append("[END WEBPAGE CONTENT]")

    user_full_text = "\n".join(user_content_parts)

    # Structure for the gemini_client function
    # The client will use 'system' for system_instruction if model supports it
    return {
        "system": system_instruction,
        "user": user_full_text,
        "images": image_urls # Pass URLs separately for potential client-side processing
    }

# --- Gemini 2.5 Computer Use Prompt ---
def build_cu_prompt() -> str:
    """
    Builds the prompt for Gemini 2.5 Computer Use to find expansion actions.
    Returns a string prompt.
    """
    prompt = dedent("""
    Analyze the provided webpage screenshot. Your primary goal is to identify UI elements (buttons, links) that likely hide or reveal additional page content, or require initial interaction (like cookie banners).

    **Task:**
    Generate a JSON array listing the specific actions needed to expand, reveal, or accept necessary initial interactions on the page.

    **Allowed Actions & Format:**
    Return ONLY a valid JSON array `[]` containing action objects. Each object must strictly adhere to one of the following formats:
    1.  `{"type": "CLICK_XY", "x": <int 0-1000>, "y": <int 0-1000>}`: Use this for clicking specific coordinates identified visually. Prefer this for buttons/links that might be hard to select by text alone, or standard UI elements like close buttons (X).
    2.  `{"type": "CLICK", "textContains": "<string>"}`: Use this ONLY if G2.5CU function calling is unavailable or fails. Try to find elements containing specific, visible, unique text. Prioritize common expansion/acceptance texts. Examples: "Read more", "Show comments", "Expand section", "Accept all", "Load More", "View all". Be specific enough to avoid ambiguity.
    3.  `{"type": "WAIT", "ms": <int>}`: Use ONLY if a brief pause (e.g., 300-1000ms) is needed after a CLICK action for dynamic content to load before the next action or scrape. Use sparingly.
    4.  `{"type": "SCROLL", "direction": "<up|down|left|right>"}`: Use 'down' if content appears to continue below the fold or if 'Load More' elements are common. Use 'right'/'left' only if horizontal scrolling seems necessary to reveal content.
    5.  `{"type": "SCROLL_BOTTOM"}`: Use this specifically if you suspect more content loads upon reaching the very bottom of the page (infinite scroll pattern).

    **Constraints & Priorities:**
    - Output ONLY the JSON array. No explanations, comments, or markdown ```json ``` markers.
    - Limit the total number of actions to a maximum of 5.
    - **Prioritize the specific G2.5CU function calls (`click_at`, `scroll_document`, `wait_5_seconds`)**. Generate the simplified JSON format (`CLICK_XY`, `SCROLL`, `WAIT`) only as a fallback if function calling fails or is unavailable.
    - If using function calls: Prefer `click_at` for reliability. Use `scroll_document` if scrolling is needed.
    - Only include actions that are highly likely to reveal primary page content or dismiss initial blockers (cookie banners). Avoid interacting with ads, main navigation menus, login forms, or potentially destructive actions.
    - If no relevant actions are obvious or necessary based on the visual screenshot, return an empty array `[]`.

    **Example Output (Using Simplified Format - Fallback):**
    ```json
    [
      {"type": "CLICK", "textContains": "Accept all cookies"},
      {"type": "WAIT", "ms": 300},
      {"type": "CLICK", "textContains": "Read More"},
      {"type": "SCROLL_BOTTOM"}
    ]
    ```
    **Example Output (No Actions):**
    ```json
    []
    ```
    """)
    return prompt

