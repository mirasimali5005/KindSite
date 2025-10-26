import requests
import json

BASE_URL = "http://localhost:5001"

def show(resp):
    print("Status:", resp.status_code)
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)
    print()

if __name__ == "__main__":
    print("\n🚀 Testing Gemini Flask Backend\n")
    
    try:
        # Test 1: Health check
        print("=" * 50)
        print("Test 1: Health Check")
        print("=" * 50)
        show(requests.get(f"{BASE_URL}/health"))
        
        # Test 2: Accessibility transformation (uses prompts.build_multimodal_prompt)
        print("=" * 50)
        print("Test 2: Generate Accessible HTML (ADHD Profile)")
        print("=" * 50)
        payload = {
            "profile": "ADHD",
            "text": "Climate change refers to long-term shifts in temperatures and weather patterns. Since the 1800s, human activities, especially burning coal, oil, and gas, have been the main driver, trapping heat in the atmosphere.",
            "origin": "Science Article"
        }
        show(requests.post(f"{BASE_URL}/generate", json=payload))
        
        # Test 3: Simple Q&A (plain prompt passthrough)
        print("=" * 50)
        print("Test 3: Simple Question (LeetCode)")
        print("=" * 50)
        show(requests.post(f"{BASE_URL}/generate-simple", json={
            "prompt": "Give a concise Python solution for LeetCode 1 (Two Sum)."
        }))
        
        # Test 4: Dyslexia profile
        print("=" * 50)
        print("Test 4: Generate Accessible HTML (Dyslexia Profile)")
        print("=" * 50)
        payload = {
            "profile": "DYSLEXIA",
            "text": "Artificial intelligence is transforming industries by enabling machines to learn from data, recognize patterns, and make decisions with minimal human intervention.",
            "origin": "Tech Blog"
        }
        show(requests.post(f"{BASE_URL}/generate", json=payload))
        
        print("✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the server.")
        print("Make sure the Flask server is running on http://localhost:5001")
        print("Run: python app.py")
    except Exception as e:
        print(f"❌ Error: {str(e)}")