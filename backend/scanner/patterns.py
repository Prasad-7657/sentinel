SECRET_PATTERNS = {
    "aws_access_key": {
        "pattern": r"\bAKIA[0-9A-Z]{16}\b",
        "description": "Possible AWS access key",
        "severity": "high",
    },
    "github_token": {
        "pattern": r"\bgh[pousr]_[A-Za-z0-9_]{20,}\b",
        "description": "Possible GitHub token",
        "severity": "critical",
    },
    "private_key": {
        "pattern": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
        "description": "Private key detected",
        "severity": "critical",
    },
    "generic_password": {
        "pattern": r"(?i)\bpassword\s*[:=]\s*[\"'][^\"']+[\"']",
        "description": "Possible hardcoded password",
        "severity": "high",
    },
} 