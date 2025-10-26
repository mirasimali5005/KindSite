# # import os
# # import json
# # import time
# # from google import genai
# # from google.genai import types
# # from google.genai.types import Content, Part
# # from urllib.parse import urlparse # To potentially handle image URLs better later

# # # --- Configuration ---
# # # Use GOOGLE_API_KEY from .env
# # API_KEY = os.getenv("GEMINI_API_KEY")
# # if API_KEY:
# #     try:
# #         genai.configure(api_key=API_KEY)
# #         print("LOG: Google API Key configured successfully.")
# #     except Exception as e:
# #         print(f"ERROR: Failed to configure Google API Key: {e}")
# #         API_KEY = None # Ensure API_KEY is None if config fails
# # else:
# #     print("WARN: GOOGLE_API_KEY environment variable not set. AI calls will be mocked.")

# # # Define specific model IDs from environment using defaults from your .env
# # MODEL_MULTIMODAL = os.getenv("MODEL_MULTIMODAL", "gemini-1.5-pro-latest")
# # MODEL_CU = os.getenv("MODEL_CU", "gemini-2.5-computer-use-preview-10-2025")

# # # Timeout for AI API calls using default from your .env
# # TIMEOUT = int(os.getenv("REQUEST_TIMEOUT_SEC", "45"))

# # class GeminiError(Exception):
# #     """Custom exception for Gemini API call errors."""
# #     pass

# # # --- Gemini 1.5 Pro Client (Updated to use SDK) ---
# # def call_gemini_multimodal(payload: dict) -> str:
# #     """
# #     Calls Gemini 1.5 Pro (or specified multimodal model) with text and image URLs.
# #     Expects payload with 'system', 'user', 'images' keys.
# #     Returns the generated HTML string.
# #     """
# #     if not API_KEY:
# #         print("MOCK: call_gemini_multimodal (no API key)")
# #         return (
# #             "<div><h2>Summary (Mock)</h2><ul><li>Placeholder output (no GOOGLE_API_KEY set)</li></ul>"
# #             f"<p>Profile: {payload.get('profile','N/A')}</p>"
# #             f"<p>Images received: {len(payload.get('images', []))}</p></div>"
# #         )

# #     try:
# #         model = genai.GenerativeModel(MODEL_MULTIMODAL,
# #                                        system_instruction=payload.get("system")) # Pass system prompt if supported

# #         # Build content structure for the SDK
# #         content_parts = []
# #         content_parts.append(payload["user"]) # Add the main user text

# #         # Add image URLs as text references (simple approach for hackathon)
# #         image_urls = payload.get("images", [])
# #         if image_urls:
# #              content_parts.append("\nImage References:")
# #              for i, img_url in enumerate(image_urls):
# #                  content_parts.append(f"- Image {i+1}: {img_url}")

# #         print(f"LOG: Calling {MODEL_MULTIMODAL} with {len(content_parts)} text parts...")
# #         # Note: The SDK might handle timeouts differently, check generate_content options
# #         request_options = {"timeout": TIMEOUT} # Pass timeout if supported
# #         response = model.generate_content(content_parts, request_options=request_options)

# #         if response.candidates and response.candidates[0].content.parts:
# #             html_output = response.candidates[0].content.parts[0].text
# #             print(f"LOG: Received {len(html_output)} chars from {MODEL_MULTIMODAL}")
# #             return html_output or "<div><p>(Empty model response)</p></div>"
# #         else:
# #             print(f"WARN: Unexpected response structure from {MODEL_MULTIMODAL}: {response}")
# #             try:
# #                 block_reason = response.prompt_feedback.block_reason
# #                 block_message = response.prompt_feedback.block_reason_message
# #                 raise GeminiError(f"Response blocked. Reason: {block_reason}. Message: {block_message}")
# #             except (AttributeError, IndexError):
# #                  raise GeminiError(f"Unexpected or empty response structure. Check logs.")

# #     except Exception as e:
# #         print(f"ERROR: Exception during Gemini 1.5 Pro call: {e}")
# #         raise GeminiError(f"Failed to call {MODEL_MULTIMODAL}: {type(e).__name__} - {e}")


# # # --- Gemini 2.5 Computer Use Client ---
# # def call_gemini_cu(prompt: str, screenshot_path: str) -> list:
# #     """
# #     Calls Gemini 2.5 Computer Use model with a prompt and a local screenshot file.
# #     Uploads the file, calls the model, parses FunctionCalls, deletes the file.
# #     Returns a list of simplified action objects expected by the frontend.
# #     """
# #     if not API_KEY:
# #         print("MOCK: call_gemini_cu (no API key)")
# #         return [
# #             {"type": "CLICK", "textContains": "Mock Read More (No Key)"},
# #             {"type": "WAIT", "ms": 300}
# #         ]
# #     if not os.path.exists(screenshot_path):
# #          raise GeminiError(f"Screenshot file not found at: {screenshot_path}")

# #     uploaded_file = None
# #     try:
# #         print(f"LOG: Uploading screenshot: {screenshot_path}")
# #         uploaded_file = genai.upload_file(path=screenshot_path)
# #         print(f"LOG: Screenshot upload initiated: {uploaded_file.name}, State: {uploaded_file.state.name}")

# #         upload_start_time = time.time()
# #         while uploaded_file.state.name == "PROCESSING":
# #              print("LOG: Waiting for screenshot processing...")
# #              if time.time() - upload_start_time > TIMEOUT: # Use overall timeout for upload too
# #                  raise GeminiError(f"Screenshot upload timed out after {TIMEOUT} seconds: {uploaded_file.name}")
# #              time.sleep(3)
# #              uploaded_file = genai.get_file(uploaded_file.name)
# #              if uploaded_file.state.name == "FAILED":
# #                   raise GeminiError(f"Screenshot file processing failed: {uploaded_file.name}")

# #         if uploaded_file.state.name != "ACTIVE":
# #              raise GeminiError(f"Screenshot file not active after processing: {uploaded_file.name}, State: {uploaded_file.state.name}")
# #         print(f"LOG: Screenshot ready: {uploaded_file.name}")

# #         computer_use_tool = types.Tool(
# #             computer_use=types.ComputerUse(
# #                 environment=types.Environment.ENVIRONMENT_BROWSER,
# #             )
# #         )
# #         generate_content_config = types.GenerateContentConfig(tools=[computer_use_tool])

# #         model = genai.GenerativeModel(MODEL_CU)

# #         print(f"LOG: Calling {MODEL_CU} with prompt and screenshot file {uploaded_file.name}...")
# #         request_options = {"timeout": TIMEOUT} # Pass timeout if supported
# #         response = model.generate_content(
# #             [prompt, uploaded_file],
# #             generation_config=generate_content_config,
# #             request_options=request_options
# #         )

# #         actions_list = []
# #         if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
# #             print("LOG: Received response parts from G2.5CU:")
# #             for part in response.candidates[0].content.parts:
# #                  if part.function_call:
# #                     fc = part.function_call
# #                     action_name = fc.name
# #                     action_args = dict(fc.args)
# #                     print(f"  - Found Function Call: {action_name} with args: {action_args}")

# #                     # Translate to Frontend Action Format
# #                     if action_name == "click_at":
# #                          actions_list.append({
# #                              "type": "CLICK_XY",
# #                              "x": action_args.get("x"),
# #                              "y": action_args.get("y")
# #                          })
# #                     elif action_name == "type_text_at":
# #                         if "text" in action_args and action_args["text"] is not None:
# #                             actions_list.append({
# #                                 "type": "TYPE_XY",
# #                                 "x": action_args.get("x"),
# #                                 "y": action_args.get("y"),
# #                                 "text": action_args.get("text"),
# #                                 "press_enter": action_args.get("press_enter", False)
# #                             })
# #                         else:
# #                             print(f"WARN: Skipping type_text_at with missing text arg: {action_args}")
# #                     elif action_name == "scroll_document":
# #                          actions_list.append({
# #                              "type": "SCROLL",
# #                              "direction": action_args.get("direction")
# #                          })
# #                     elif action_name == "wait_5_seconds":
# #                          actions_list.append({"type": "WAIT", "ms": 5000})
# #                     # Add more translations if needed
# #                  elif part.text:
# #                       print(f"  - Found Text Part: {part.text[:100]}...")

# #             if not actions_list and "click" in response.text.lower():
# #                  if "read more" in response.text.lower():
# #                       print("WARN: No function calls, attempting text-based fallback for 'Read more'")
# #                       actions_list.append({"type": "CLICK", "textContains": "Read more"})
# #                  elif "accept" in response.text.lower():
# #                        print("WARN: No function calls, attempting text-based fallback for 'Accept'")
# #                        actions_list.append({"type": "CLICK", "textContains": "Accept"})

# #         else:
# #             print(f"WARN: No valid candidate or parts found in G2.5CU response: {response}")
# #             try:
# #                 block_reason = response.prompt_feedback.block_reason
# #                 block_message = response.prompt_feedback.block_reason_message
# #                 raise GeminiError(f"G2.5CU Response blocked. Reason: {block_reason}. Message: {block_message}")
# #             except (AttributeError, IndexError):
# #                  raise GeminiError(f"Unexpected or empty G2.5CU response structure. Check logs.")


# #         print(f"LOG: Parsed actions list: {actions_list}")
# #         return actions_list

# #     except Exception as e:
# #         print(f"ERROR: Exception during Gemini 2.5 CU call or file upload/processing: {e}")
# #         raise GeminiError(f"Failed to call {MODEL_CU} or handle file: {type(e).__name__} - {e}")

# #     finally:
# #         if uploaded_file:
# #             try:
# #                 current_file_state = genai.get_file(uploaded_file.name).state.name
# #                 if current_file_state != "PROCESSING":
# #                     print(f"LOG: Deleting uploaded file: {uploaded_file.name} (State: {current_file_state})")
# #                     genai.delete_file(uploaded_file.name)
# #                 else:
# #                      print(f"WARN: Skipping deletion of file still processing: {uploaded_file.name}")
# #             except Exception as delete_err:
# #                 print(f"WARN: Failed to delete uploaded file {uploaded_file.name}: {delete_err}")

# # server/gemini_client.py


# import os
# import time
# from typing import List

# from google import genai
# from google.genai import types
# from google.genai.types import Content, Part

# # --- Config ---
# API_KEY = os.getenv("GEMINI_API_KEY")
# MODEL_MULTIMODAL = os.getenv("MODEL_MULTIMODAL", "gemini-1.5-pro-latest")
# MODEL_CU = os.getenv("MODEL_CU", "gemini-2.5-computer-use-preview-10-2025")
# TIMEOUT = int(os.getenv("REQUEST_TIMEOUT_SEC", "45"))

# client = genai.Client(api_key=API_KEY) if API_KEY else None


# class GeminiError(Exception):
#     pass


# # # --- Gemini 1.5 Pro (text+images) ---
# # def call_gemini_multimodal(payload: dict) -> str:
# #     """
# #     payload: {"system": str, "user": str, "images": List[str]}
# #     returns: HTML string
# #     """
# #     if not client:
# #         return (
# #             "<div><h2>Summary (Mock)</h2><ul><li>No API key set</li></ul>"
# #             f"<p>Images received: {len(payload.get('images', []))}</p></div>"
# #         )

# #     contents = [Content(role="user", parts=[Part(text=payload["user"])])]

# #     # Simple: append image URLs as text references
# #     imgs = payload.get("images", [])
# #     if imgs:
# #         refs = "\n".join([f"- Image {i+1}: {u}" for i, u in enumerate(imgs)])
# #         contents[0].parts.append(Part(text="Image References:\n" + refs))

# #     config = types.GenerateContentConfig(system_instruction=payload.get("system"))

# #     try:
# #         resp = client.models.generate_content(
# #             model=MODEL_MULTIMODAL,
# #             contents=contents,
# #             config=config,
# #             request_options={"timeout": TIMEOUT},
# #         )
# #         cand = resp.candidates[0]
# #         # first text part
# #         for p in cand.content.parts:
# #             if getattr(p, "text", None):
# #                 return p.text
# #         raise GeminiError("Empty response")
# #     except Exception as e:
# #         raise GeminiError(f"Failed to call {MODEL_MULTIMODAL}: {type(e).__name__}: {e}")


# # # --- Gemini 2.5 Computer Use (screenshot + tool) ---
# # def call_gemini_cu(prompt: str, screenshot_path: str) -> list:
# #     """
# #     Returns list of simple actions for the frontend.
# #     Requires google-genai SDK.
# #     """
# #     if not client:
# #         return [
# #             {"type": "CLICK", "textContains": "Mock (no key)"},
# #             {"type": "WAIT", "ms": 300},
# #         ]
# #     if not os.path.exists(screenshot_path):
# #         raise GeminiError(f"Screenshot not found: {screenshot_path}")

# #     with open(screenshot_path, "rb") as f:
# #         screenshot_bytes = f.read()

# #     config = types.GenerateContentConfig(
# #         tools=[
# #             types.Tool(
# #                 computer_use=types.ComputerUse(
# #                     environment=types.Environment.ENVIRONMENT_BROWSER
# #                     # optional: excluded_predefined_functions=["drag_and_drop"]
# #                 )
# #             )
# #         ]
# #     )

# #     contents = [
# #         Content(
# #             role="user",
# #             parts=[
# #                 Part(text=prompt),
# #                 Part.from_bytes(data=screenshot_bytes, mime_type="image/png"),
# #             ],
# #         )
# #     ]

# #     try:
# #         resp = client.models.generate_content(
# #             model=MODEL_CU,
# #             contents=contents,
# #             config=config,
# #             request_options={"timeout": TIMEOUT},
# #         )

# #         actions = []
# #         cand = resp.candidates[0]
# #         for part in cand.content.parts:
# #             fc = getattr(part, "function_call", None)
# #             if not fc:
# #                 continue
# #             name = fc.name
# #             args = dict(fc.args)

# #             if name == "click_at":
# #                 actions.append({"type": "CLICK_XY", "x": args.get("x"), "y": args.get("y")})
# #             elif name == "type_text_at":
# #                 actions.append(
# #                     {
# #                         "type": "TYPE_XY",
# #                         "x": args.get("x"),
# #                         "y": args.get("y"),
# #                         "text": args.get("text", ""),
# #                         "press_enter": args.get("press_enter", False),
# #                     }
# #                 )
# #             elif name == "scroll_document":
# #                 actions.append({"type": "SCROLL", "direction": args.get("direction", "down")})
# #             elif name == "wait_5_seconds":
# #                 actions.append({"type": "WAIT", "ms": 5000})
# #             # add other CU functions as needed

# #         return actions
# #     except Exception as e:
# #         raise GeminiError(f"Failed to call {MODEL_CU}: {type(e).__name__}: {e}")


# # --- Gemini 1.5 Pro (text+images) ---
# def call_gemini_multimodal(payload: dict) -> str:
#     if not client:
#         return ("<div><h2>Summary (Mock)</h2><ul><li>No API key set</li></ul>"
#                 f"<p>Images received: {len(payload.get('images', []))}</p></div>")

#     contents = [Content(role="user", parts=[Part(text=payload["user"])])]
#     imgs = payload.get("images", [])
#     if imgs:
#         refs = "\n".join([f"- Image {i+1}: {u}" for i, u in enumerate(imgs)])
#         contents[0].parts.append(Part(text="Image References:\n" + refs))

#     config = types.GenerateContentConfig(system_instruction=payload.get("system"))

#     try:
#         resp = client.models.generate_content(
#             model=MODEL_MULTIMODAL,
#             contents=contents,
#             config=config,
#         )
#         cand = resp.candidates[0]
#         for p in cand.content.parts:
#             if getattr(p, "text", None):
#                 return p.text
#         raise GeminiError("Empty response")
#     except Exception as e:
#         raise GeminiError(f"Failed to call {MODEL_MULTIMODAL}: {type(e).__name__}: {e}")


import os
from google import genai
from google.genai import types
from google.genai.types import Content, Part

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_MULTIMODAL = os.getenv("MODEL_MULTIMODAL", "gemini-1.5-pro-latest")

client = genai.Client(api_key=API_KEY) if API_KEY else None

class GeminiError(Exception):
    pass

def call_gemini_multimodal(payload: dict) -> str:
    """
    payload: {"system": str, "user": str, "images": list[str]}
    returns: HTML string
    """
    if not client:
        return ("<div><h2>Summary (Mock)</h2><ul><li>No API key set</li></ul>"
                f"<p>Images received: {len(payload.get('images', []))}</p></div>")

    contents = [Content(role="user", parts=[Part(text=payload["user"])])]

    imgs = payload.get("images", [])
    if imgs:
        refs = "\n".join([f"- Image {i+1}: {u}" for i, u in enumerate(imgs)])
        contents[0].parts.append(Part(text="Image References:\n" + refs))

    config = types.GenerateContentConfig(system_instruction=payload.get("system"))

    try:
        resp = client.models.generate_content(
            model=MODEL_MULTIMODAL,
            contents=contents,
            config=config,
        )
        cand = resp.candidates[0]
        for p in cand.content.parts:
            if getattr(p, "text", None):
                return p.text
        raise GeminiError("Empty response")
    except Exception as e:
        raise GeminiError(f"Failed to call {MODEL_MULTIMODAL}: {type(e).__name__}: {e}")
