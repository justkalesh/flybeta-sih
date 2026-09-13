import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# ── Route429 Proxy Configuration (shared with api/ai_services.py) ────────
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'route429-managed')
ROUTE429_BASE_URL = os.environ.get(
    'ROUTE429_BASE_URL',
    'https://route429.parth-ie-kalash.workers.dev/p/flybeta-sih'
)
ROUTE429_PROXY_SECRET = os.environ.get('ROUTE429_PROXY_SECRET', '')

_http_options = {'base_url': ROUTE429_BASE_URL}
if ROUTE429_PROXY_SECRET:
    _http_options['headers'] = {'X-Proxy-Secret': ROUTE429_PROXY_SECRET}

try:
    client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=_http_options,
    )
except Exception as e:
    print(f"[Route429] Failed to initialize Gemini client (evaluator): {e}")
    client = None


# ── Structured Output Schema ─────────────────────────────────────────────

class CapstoneEvaluation(BaseModel):
    score: int = Field(description="Score from 0 to 100")
    passed: bool = Field(description="Whether the submission passes")
    feedback: str = Field(description="Markdown formatted review")


def evaluate_code(domain_name, code_content):
    """
    Evaluates capstone code using Google Gemini via Route429 proxy.
    """
    if not client:
        return {
            "score": 0,
            "passed": False,
            "feedback": "AI evaluator is not available (Route429 client not initialized)."
        }

    prompt = (
        f"You are an expert tech instructor grading a Level 10 Capstone project "
        f"for the {domain_name} track. Review the following code. Determine if they "
        f"pass (needs a basic working implementation).\n\nCode:\n\n{code_content}"
    )

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are an expert code reviewer evaluating a capstone project. "
                    "Be encouraging but educational in your feedback."
                ),
                response_mime_type="application/json",
                response_schema=CapstoneEvaluation,
                temperature=0.3,
            ),
        )

        parsed_result = json.loads(response.text)
        return {
            "score": parsed_result.get("score", 0),
            "passed": parsed_result.get("passed", False),
            "feedback": parsed_result.get("feedback", "No feedback provided.")
        }
    except Exception as e:
        return {
            "score": 0,
            "passed": False,
            "feedback": f"An error occurred during AI evaluation: {str(e)}"
        }

