REMEDIATION_GUIDANCE = {
    "aws_access_key": {
        "message": "Rotate the AWS access key immediately and remove it from the source code.",
        "steps": [
            "Disable or delete the exposed AWS access key.",
            "Create a new key with minimum required permissions.",
            "Store the key in environment variables or a secret manager.",
            "Check Git history and remove the exposed credential if necessary."
        ]
    },
    "github_token": {
        "message": "Revoke the exposed GitHub token and create a replacement token.",
        "steps": [
            "Revoke the exposed token from GitHub settings.",
            "Create a new token with minimum permissions.",
            "Store it in an environment variable or secret manager.",
            "Remove the token from Git history if it was committed."
        ]
    },
    "private_key": {
        "message": "Remove the private key from the source code and rotate it.",
        "steps": [
            "Revoke or replace the exposed private key.",
            "Store private keys outside the repository.",
            "Use a secure secret manager.",
            "Review repository history for previous exposure."
        ]
    },
    "generic_password": {
        "message": "Remove the hardcoded password and use secure configuration.",
        "steps": [
            "Change the exposed password immediately.",
            "Remove the password from the source code.",
            "Use environment variables or a secret manager.",
            "Check whether the password was committed to Git."
        ]
    }
}


def get_remediation(finding_type):
    return REMEDIATION_GUIDANCE.get(
        finding_type,
        {
            "message": "Review this finding and remove sensitive information.",
            "steps": [
                "Remove the sensitive value from source code.",
                "Rotate the exposed credential if applicable.",
                "Use a secure secret manager."
            ]
        }
    )
