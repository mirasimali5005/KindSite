from textwrap import dedent

def build_multimodal_prompt(origin: str, profile: str, page_text: str, image_urls: list[str]) -> dict:
    """
    Returns a Gemini messages/payload structure (model-dependent).
    Keep it simple; Person B can adapt to actual SDK call.
    """
    system = dedent(f"""
    You are an AI Accessibility Agent. Transform the provided webpage content into a single, accessible HTML fragment for a user with [Profile: {profile}].
    Make the content scannable: top summary, clear headings, bullets, short sentences, bold key phrases.
    For each image URL, generate a concise caption (≤2 sentences) and weave it near where it appeared.
    Return ONLY the final HTML fragment. No extra commentary, no <script> or inline event handlers.
    """)

    user_text = dedent(f"""
    [ORIGIN]: {origin}
    [PROFILE]: {profile}

    [TEXT] (possibly truncated for latency):
    {page_text}

    [IMAGES]:
    {chr(10).join(f"- {u}" for u in image_urls)}
    """)

    # Generic structure compatible with many chat APIs:
    return {
        "system": system,
        "user": user_text,
        "images": image_urls,  # your client decides how to pass these
    }
