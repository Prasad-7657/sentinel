# Sentinel
Sentinel is a secrets and credential exposure detection platform that scans source code and uploaded files for accidentally exposed secrets.


## Features
- Scan source code directly from the dashboard
- Upload and scan supported text files
- Detect AWS access keys
- Detect GitHub tokens
- Detect Google API keys
- Detect Discord bot tokens
- Detect private keys
- Detect hardcoded passwords
- Assign severity levels
- Provide remediation guidance
- Display scan history
- REST API built with Flask
- Automated backend tests using pytest

## Technology Stack
### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Python
- Flask
- Flask-CORS
- Regular expressions
- Pytest

## Project Structure

sentinel/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── scanner/
│       ├── context.py
│       ├── detector.py
│       ├── entropy.py
│       ├── patterns.py
│       ├── remediation.py
│       ├── severity.py
│       └── validator.py
├── frontend/
│   ├── css/
│   ├── Html/
│   └── javascript/
├── tests/
│   ├── test_api.py
│   └── test_detector.py
└── README.md
 

#Installation
git clone https://github.com/Prasad-7657/sentinel.git
cd sentinel


#Create and activate the virtual environment:
python3 -m venv backend/.venv
source backend/.venv/bin/activate


#Install dependencies:
pip install -r backend/requirements.txt
pip install pytest


#Running Sentinel
Start the backend:
python3 backend/app.py

In another terminal, start the frontend:
cd frontend
python3 -m http.server 8000


#open mainpage
http://127.0.0.1:8000/Html/Mainpage.html


#Running Tests
From the project root:
pytest -v


#Security Note
Only use fake sample credentials while testing Sentinel.
If a real secret is detected:
Revoke or rotate it immediately.
Remove it from the source code.
Check repository history.
Move secrets into environment variables or a secure secrets manager.
Review logs for possible unauthorized use.


#Project Status
Sentinel is a functional hackathon MVP with a Flask scanning API,
 browser dashboard, multiple secret-detection patterns, remediation guidance,
 and automated tests.
