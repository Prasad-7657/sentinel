import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scanner.detector import detect_secrets


def test_detects_aws_key():
    content = "aws_key = AKIAIOSFODNN7EXAMPLE"

    findings = detect_secrets(content)

    assert len(findings) >= 1
    assert findings[0]["type"] == "aws_access_key"


def test_detects_password():
    content = 'password = "demo-password"'

    findings = detect_secrets(content)

    assert len(findings) >= 1
    assert findings[0]["type"] == "generic_password"


def test_clean_content_has_no_findings():
    content = "print('Hello Sentinel')"

    findings = detect_secrets(content)

    assert findings == []
