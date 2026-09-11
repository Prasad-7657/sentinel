SEVERITY_ORDER = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}


def calculate_severity(severity):
    if severity in SEVERITY_ORDER:
        return severity

    return "medium"
