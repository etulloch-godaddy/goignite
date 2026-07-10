## Setup Environment:

```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

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