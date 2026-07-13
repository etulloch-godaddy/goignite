## Setup Environment:

```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Configure API Key

Copy the example env file and add your CaaS SSO JWT token:

```
cp .env.example .env
```

Then open `.env` and set:

```
CAAS_SSO_JWT=sso-jwt <your-token>
```

## Run the API

```
source .venv/bin/activate
1
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
Get your own GoDaddy API Key here:
```
https://sso.godaddy.com/login/progressive?app=developer&realm=idp&referrer=sso&path=%2Fkeys&status=0
``` 

## To start the API:
```
cd backend
source .venv/bin/activate
fastapi dev
```

## Onboarding data flow:
```
POST  /api/users/create-new-user
GET   /api/users/{user_id}/onboarding-data
PATCH /api/users/{user_id}/onboarding-data
```

`PATCH` upserts `payload.data` into the same onboarding dictionary returned by `GET`.
