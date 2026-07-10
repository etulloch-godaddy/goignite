## Setup Environment

```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Configure API Key

Copy the example env file and add your Anthropic API key:

```
cp .env.example .env
```

Then open `.env` and set:

```
ANTHROPIC_API_KEY=sk-ant-...your key here...
```

Get a key at https://console.anthropic.com

## Run the API

```
source .venv/bin/activate
uvicorn app.main:app --reload
```

Server runs at http://localhost:8000

## Endpoints

| Method | Path              | Description                  |
|--------|-------------------|------------------------------|
| GET    | /health           | Health check                 |
| POST   | /api/users/onboard| Onboard a new creator        |
| GET    | /api/users/{id}   | Get a user profile           |
| POST   | /api/chat         | Chat with the Q&A bot        |

### POST /api/chat

```json
{
  "message": "How do I start a small business?",
  "session_id": "any-unique-string"
}
```

## Chat UI

Open `chat_ui.html` directly in your browser to chat with the bot.
The server must be running first.
