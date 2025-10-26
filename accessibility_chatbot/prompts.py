# prompts.py

ACCESSIBILITY_PROMPTS = {
    "dyslexia": {
        "display_name": "Dyslexia-Friendly Text",
        "prompt_template": """
        **Task:** Reformat and rewrite the provided text to be significantly easier to read and understand for individuals with dyslexia.
        **Specific Instructions:**
        1.  **Simplify Vocabulary:** Replace complex or jargon-filled words with simpler, more common synonyms.
        2.  **Shorten Sentences:** Break down long, complex sentences into shorter, more direct ones.
        3.  **Use Active Voice:** Convert passive voice to active voice wherever possible to improve clarity.
        4.  **Bold Key Terms:** Identify and **bold** the most important keywords, concepts, or headings. Do not over-bold; focus on truly critical information.
        5.  **Increase Line Spacing:** Indicate increased line spacing (this is a formatting instruction for the PDF tool, but mention it for content flow).
        6.  **Use Clear Paragraphs:** Ensure paragraphs are concise and focused on a single idea. Break up dense blocks of text.
        7.  **Avoid Justified Text:** (Implicit, as we're generating new text)
        8.  **Provide a Summary (Optional, if text is very long):** If the original text is extensive, start with a 1-2 sentence core summary.
        9.  **Maintain Original Meaning:** Ensure the core information and intent of the original text are preserved accurately.
        10. **Output Format:** Provide the rewritten text in a clear, easy-to-read markdown format.

        **Original Text:**
        {text_content}
        """,
    },
    "cognitive_impairment": {
        "display_name": "Cognitive Impairment-Friendly Summary",
        "prompt_template": """
        **Task:** Summarize and simplify the provided text for individuals with cognitive impairments, focusing on clarity, brevity, and essential information.
        **Specific Instructions:**
        1.  **Extract Core Ideas:** Identify and present only the most critical information, eliminating all non-essential details.
        2.  **Extremely Simple Language:** Use very basic vocabulary. Avoid metaphors, idioms, or abstract concepts.
        3.  **Shortest Possible Sentences:** Every sentence should be as short and direct as possible, typically one main idea per sentence.
        4.  **Use Bullet Points/Numbered Lists:** Whenever possible, present information as simple, clear bullet points or numbered lists instead of continuous paragraphs.
        5.  **Remove Ambiguity:** Ensure all statements are unambiguous and easy to interpret.
        6.  **Focus on Actions/Direct Facts:** Emphasize what needs to be done or what the key facts are.
        7.  **Positive and Direct Language:** Use positive framing and direct instructions.
        8.  **No Inferences:** Do not require the reader to make inferences or draw conclusions. State everything explicitly.
        9.  **Maintain Original Meaning (Simplified):** Preserve the absolute core meaning, but strip away all complexity.
        10. **Output Format:** Provide the simplified summary in clear markdown, preferably with a strong emphasis on lists.

        **Original Text:**
        {text_content}
        """,
    },
    "visual_impairment": {
        "display_name": "Low Vision / Screen Reader Optimized Text",
        "prompt_template": """
        **Task:** Reformat and rewrite the provided text to be highly optimized for screen readers and users with low vision. The output should be exceptionally clear, well-structured, and easy to navigate.
        **Specific Instructions:**
        1.  **Clear Headings:** Use clear, descriptive headings (H1, H2, H3) to structure the document. Ensure they accurately reflect the content that follows.
        2.  **Logical Flow:** Organize information logically, with a clear hierarchy and progression of ideas.
        3.  **Descriptive Link Text:** If any links are inferred or should be added (e.g., "for more information, visit our website"), provide highly descriptive link text that makes sense out of context. (e.g., instead of "click here", use "Read more about [Topic] on our website").
        4.  **No Visual-Only Cues:** Ensure no information is conveyed solely through visual means (e.g., color, position) in the text itself.
        5.  **Elaborate on Visuals (if applicable):** If the original text refers to images or charts, provide concise but thorough textual descriptions of their key content or findings.
        6.  **Concise Paragraphs:** Keep paragraphs relatively short.
        7.  **Use Lists:** Employ bullet points or numbered lists for items in a series, steps, or features.
        8.  **Avoid Special Characters/Emojis:** Stick to standard text characters unless explicitly necessary and understandable by screen readers.
        9.  **Maintain Original Meaning:** Ensure the accuracy and completeness of the original information are preserved.
        10. **Output Format:** Provide the optimized text in well-structured markdown.

        **Original Text:**
        {text_content}
        """,
    },
    "adhd": {
        "display_name": "ADHD-Friendly Highlighted Key Points",
        "prompt_template": """
        **Task:** Process the provided text to extract and highlight the absolute most critical information for individuals with ADHD, aiming for maximum clarity and minimal cognitive load.
        **Specific Instructions:**
        1.  **Start with an Executive Summary:** Begin with a 1-3 sentence summary of the core message or main takeaway.
        2.  **Prioritize Key Points:** Extract only the 3-5 most essential facts, actions, or conclusions. Discard all secondary information, anecdotes, or elaborate descriptions.
        3.  **Bold and Underline (Markdown Emphasis):** Use **bold** and *italics* (or indicate underlining where appropriate in markdown) to emphasize these key points.
        4.  **Bullet Points for Actions/Lists:** Present any sequential information or lists as clear, concise bullet points.
        5.  **Direct Language:** Use direct, action-oriented language. Avoid qualifiers or lengthy explanations.
        6.  **Reduce Distractions:** Systematically remove all tangential information, redundant phrasing, or anything that could be considered a distraction.
        7.  **Focus on "What do I need to know/do?":** Frame the output to answer this question immediately.
        8.  **Output Format:** Provide the highly condensed and emphasized key points in markdown.

        **Original Text:**
        {text_content}
        """,
    },
    "esl_simple_english": {
        "display_name": "ESL / Simple English Translation",
        "prompt_template": """
        **Task:** Rewrite the provided text into very simple, clear, and unambiguous English, suitable for English as a Second Language (ESL) learners or those who prefer plain language.
        **Specific Instructions:**
        1.  **Common Vocabulary:** Replace all complex words, idioms, slang, and jargon with widely understood, basic English words.
        2.  **Direct Sentence Structure:** Use subject-verb-object sentence structures predominantly. Avoid inversions or highly complex grammatical constructions.
        3.  **Short Sentences:** Break down compound and complex sentences into simpler, shorter ones.
        4.  **Explain Concepts:** If a concept is inherently complex, explain it briefly in simple terms rather than just using a simpler word.
        5.  **Avoid Phrasal Verbs:** Where possible, replace phrasal verbs with single-word equivalents (e.g., "start" instead of "kick off").
        6.  **Clarity Over Eloquence:** Prioritize absolute clarity and ease of understanding over stylistic flair.
        7.  **Maintain Original Meaning:** Ensure the core message and all factual information are accurately conveyed.
        8.  **Output Format:** Provide the simplified English text in clear markdown format.

        **Original Text:**
        {text_content}
        """,
    },
    "default": {
        "display_name": "General Accessibility Improvement",
        "prompt_template": """
        **Task:** Improve the overall accessibility of the provided text, making it clearer, more organized, and easier to understand for a general audience with diverse needs.
        **Specific Instructions:**
        1.  **Clarity and Conciseness:** Simplify complex sentences and vocabulary without losing meaning. Remove redundancy.
        2.  **Logical Structure:** Organize the text with clear headings, subheadings, and paragraphs.
        3.  **Use Lists:** Convert lists of items or steps into bullet points or numbered lists.
        4.  **Active Voice:** Prefer active voice over passive voice.
        5.  **Highlight Key Information:** Use bolding sparingly to emphasize truly important points.
        6.  **Output Format:** Provide the improved text in well-structured markdown.

        **Original Text:**
        {text_content}
        """,
    },
}