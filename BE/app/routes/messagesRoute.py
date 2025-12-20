from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import message_collection
from app.schemas import Message
from app.utils import message_helper

router = APIRouter(
    prefix="/messages",
    tags=["messages"]
)

@router.post("/", response_model=dict)
async def create_message(message: Message):
    message_dict = message.dict(by_alias=True)
    new_message = await message_collection.insert_one(message_dict)
    created_message = await message_collection.find_one({"_id": new_message.inserted_id})
    return message_helper(created_message)

@router.get("/{id}", response_model=dict)
async def get_message(id: str):
    message = await message_collection.find_one({"_id": ObjectId(id)})
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return message_helper(message)

@router.get("/history/{history_id}", response_model=list)
async def get_messages_by_history(history_id: str):
    messages_cursor = message_collection.find({"history_id": history_id})
    messages = []
    async for message in messages_cursor:
        messages.append(message_helper(message))
    return messages
