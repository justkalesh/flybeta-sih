import os
import json
from google.genai import types
from pydantic import BaseModel, Field

# Reuse the shared Gemini client (with key rotation) from api.ai_services
from api.ai_services import client


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
            model='gemini-3.5-flash-lite',
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

