import google.generativeai as genai
import google.generativeai.types as genai_types

class GeminiClient:
    def __init__(self, api_key):
        if not api_key:
            raise ValueError("API_KEY is not provided to GeminiClient.")
        genai.configure(api_key=api_key)

        # Using 'gemini-2.5-flash' based on your provided list
        self.model_name = 'gemini-2.5-flash'
        try:
            self.model = genai.GenerativeModel(self.model_name)
            self.vision_model = self.model # Unified model for multimodal capabilities
            print(f"Successfully initialized Gemini model: {self.model_name} for both text and vision.")
        except Exception as e:
            print(f"Error initializing Gemini model with '{self.model_name}': {e}")
            raise RuntimeError(f"Failed to initialize Gemini model '{self.model_name}'. Please verify your API key and ensure it has access to this specific model.") from e


    def _safe_generate_content(self, model, prompt_or_parts):
        """Helper to safely call generate_content and extract text."""
        if model is None:
            print("Warning: Attempted to call generate_content on a non-initialized model.")
            return None
        try:
            response = model.generate_content(prompt_or_parts)
            if hasattr(response, 'parts') and response.parts:
                full_text = ""
                for part in response.parts:
                    if hasattr(part, 'text'):
                        full_text += part.text
                return full_text
            elif hasattr(response, 'text'):
                return response.text
            else:
                print(f"Gemini API response has no 'text' or 'parts' attribute suitable for extraction. Raw response: {response}")
                return None
        except genai_types.BlockedPromptException as e:
            print(f"Gemini API: Prompt blocked for safety reasons: {e.response.prompt_feedback}")
            return None
        except genai_types.StopCandidateException as e:
            print(f"Gemini API: Candidate stopped: {e.response.candidates[0].finish_reason}")
            return None
        except Exception as e:
            print(f"Gemini API call failed: {e}")
            if hasattr(e, 'response'):
                print(f"Gemini API Error Response Details: {e.response}")
            return None

    # --- MODIFIED: `prompt` is now the fully formatted prompt ---
    def generate_text_response(self, prompt, original_text_content=None):
        # The prompt is already formatted in app.py with {text_content}
        return self._safe_generate_content(self.model, prompt)

    def generate_image_description(self, prompt, image_data):
        # prompt here will include the combined instructions for description + accessibility
        return self._safe_generate_content(self.vision_model, [prompt, image_data])

    # --- MODIFIED: `prompt` is now the fully formatted prompt ---
    def summarize_pdf_content(self, prompt, original_pdf_text=None):
        # The prompt is already formatted in app.py with {text_content}
        return self._safe_generate_content(self.model, prompt)