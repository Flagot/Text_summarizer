# Text Summarizer Backend API

FastAPI backend for the Text Summarizer application with MongoDB integration.

## Features

- User authentication (register/login) with JWT tokens
- Text summarization endpoints
- Message history management
- Chat history storage and retrieval
- MongoDB database integration

## Setup

### Prerequisites

- Python 3.8+
- MongoDB (local or cloud instance)

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:

```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=text_summarizer
SECRET_KEY=your-secret-key-here
```

### Running the Server

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python main.py
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`
Alternative docs (ReDoc): `http://localhost:8000/redoc`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Summarization

- `POST /api/summarize` - Summarize text (requires authentication)

### Messages

- `POST /api/messages` - Save a message (requires authentication)
- `GET /api/messages` - Get user's messages (requires authentication)

### History

- `POST /api/history` - Save chat history (requires authentication)
- `GET /api/history` - Get user's chat history (requires authentication)
- `DELETE /api/history/{history_id}` - Delete a chat history (requires authentication)

### User

- `GET /api/user/profile` - Get current user profile (requires authentication)

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### Users Collection

```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "hashed_string",
  "created_at": "datetime"
}
```

### Messages Collection

```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "role": "user|assistant",
  "content": "string",
  "timestamp": "datetime"
}
```

### History Collection

```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "messages": [{ "role": "string", "content": "string" }],
  "created_at": "datetime"
}
```

## Notes

- The summarization endpoint currently returns a placeholder. You'll need to integrate with an actual summarization service (e.g., OpenAI, Hugging Face transformers, etc.)
- Make sure to change the `SECRET_KEY` in production
- CORS is configured for `http://localhost:5173` and `http://localhost:3000`. Update if needed.
