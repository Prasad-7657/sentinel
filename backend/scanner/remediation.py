REMEDIATION = {
    "aws_access_key": (
        "Revoke or rotate the AWS access key immediately. "
        "Review CloudTrail logs and use least-privilege permissions."
    ),

    "github_token": (
        "Revoke the GitHub token from GitHub settings and create a new token "
        "with only the required permissions."
    ),

    "private_key": (
        "Replace the exposed private key, remove it from the repository, "
        "and check whether the related public key needs to be replaced."
    ),

    "generic_password": (
        "Change the password immediately and move the secret into an "
        "environment variable or secure secrets manager."
    ),

    "google_api_key": (
        "Revoke or rotate the Google API key in Google Cloud Console. "
        "Restrict it by API, application, and allowed IP addresses where possible."
    ),

    "discord_token": (
        "Reset the Discord bot token in the Discord Developer Portal. "
        "Update the application securely and never commit the new token."
    ),
}


def get_remediation(secret_type):
    return REMEDIATION.get(
        secret_type,
        "Remove the exposed secret and rotate it immediately."
    )
