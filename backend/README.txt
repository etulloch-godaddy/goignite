## Setup Environment:

```
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
source .venv/bin/activate
fastapi dev
```