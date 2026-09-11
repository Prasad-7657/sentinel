from backend.scanner.detector import detect_secrets


def test_aws_key_detection():
    content = 'aws_key = "AKIAIOSFODNN7EXAMPLE"'

    findings = detect_secrets(content)

    assert len(findings) >= 1
    assert findings[0]["type"] == "aws_access_key"
    assert findings[0]["severity"] == "high"


def test_password_detection():
    content = 'password = "demo-password"'

    findings = detect_secrets(content)

    assert len(findings) >= 1
    assert findings[0]["type"] == "generic_password"


def test_private_key_detection():
    content = """-----BEGIN RSA PRIVATE KEY-----
fake-private-key-content
-----END RSA PRIVATE KEY-----"""

    findings = detect_secrets(content)

    assert len(findings) >= 1
    assert findings[0]["type"] == "private_key"
    assert findings[0]["severity"] == "critical"


def test_line_number_detection():
    content = """first line
second line
aws_key = "AKIAIOSFODNN7EXAMPLE"
fourth line"""

    findings = detect_secrets(content)

    assert len(findings) >= 1
    assert findings[0]["line"] == 3


def test_clean_content_has_no_findings():
    content = "print('Hello Sentinel')"

    findings = detect_secrets(content)

    assert findings == []
