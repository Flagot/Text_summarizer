"""
Summarization routes
"""
from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas import SummarizeRequest, SummarizeResponse
from app.auth import verify_token

router = APIRouter(
    prefix="/api/summarize",
    tags=["summarization"]
)


@router.post("/", response_model=SummarizeResponse)
async def summarize_text(
    request: SummarizeRequest,
    token_data: dict = Depends(verify_token)
):
    """Summarize the provided text"""
    text = request.text.strip()
    
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )
    
    # TODO: Implement actual summarization logic (e.g., using transformers, OpenAI, etc.)
    # For now, return a placeholder summary
    summary = f"This is a placeholder summary of your text. Original text length: {len(text)} characters."
    
    return SummarizeResponse(
        summary=summary,
        original_length=len(text),
        summary_length=len(summary)
    )
