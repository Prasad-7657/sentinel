import re

from scanner.patterns import SECRET_PATTERNS
from scanner.entropy import calculate_entropy
from scanner.severity import calculate_severity


def detect_secrets(content):
    findings = []

    for line_number, line in enumerate(content.splitlines(), start=1):
        for pattern_name, pattern_data in SECRET_PATTERNS.items():
            pattern = pattern_data["pattern"]

            for match in re.finditer(pattern, line):
                secret_value = match.group(0)

                findings.append({
                    "type": pattern_name,
                    "description": pattern_data["description"],
                    "line": line_number,
                    "match": secret_value,
                    "entropy": calculate_entropy(secret_value),
                    "severity": calculate_severity(pattern_data["severity"])
                })

    return findings
