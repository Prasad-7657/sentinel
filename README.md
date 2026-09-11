# Sentinel

Sentinel is a secrets and credential exposure detection platform that scans source code and uploaded files for accidentally exposed secrets.

## Features

- Detects AWS access keys
- Detects GitHub tokens
- Detects private keys
- Detects hardcoded passwords
- Calculates secret entropy
- Assigns severity levels
- Provides remediation guidance
- Scans pasted source code
- Scans uploaded files
- Simple web dashboard

## Project Structure
.
├── backend
│   ├── app.py
│   ├── __pycache__
│   │   └── app.cpython-312.pyc
│   ├── requirements.txt
│   ├── scanner
│   │   ├── context.py
│   │   ├── detector.py
│   │   ├── entropy.py
│   │   ├── __init__.py
│   │   ├── patterns.py
│   │   ├── __pycache__
│   │   │   ├── detector.cpython-312.pyc
│   │   │   ├── entropy.cpython-312.pyc
│   │   │   ├── __init__.cpython-312.pyc
│   │   │   ├── patterns.cpython-312.pyc
│   │   │   ├── remediation.cpython-312.pyc
│   │   │   └── severity.cpython-312.pyc
│   │   ├── remediation.py
│   │   ├── severity.py
│   │   └── validator.py
│   ├── tests
│   └── uploads
├── docs
│   ├── architecture.md
│   └── threat-model.md
├── frontend
│   ├── css
│   │   ├── dashboard.css
│   │   └── Mainpage.css
│   ├── Html
│   │   ├── capabilities.html
│   │   ├── dashboard.html
│   │   ├── documentation.html
│   │   └── Mainpage.html
│   └── javascript
│       └── app.js
├── README.md

# Requirements

Python 3

Flask

Flask-CORS

# Future Improvements

SQLite scan history

User authentication

PostgreSQL support

More secret detection patterns

Git repository scanning

Exportable scan reports

Deployment with Docker
