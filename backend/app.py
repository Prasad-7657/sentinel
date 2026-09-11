from flask import Flask, jsonify, request
from flask_cors import CORS

from scanner.detector import detect_secrets
from scanner.remediation import get_remediation

app = Flask(__name__)
CORS(app)

ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".java",
    ".c",
    ".cpp",
    ".html",
    ".css",
    ".json",
    ".yaml",
    ".yml",
    ".env",
    ".txt",
    ".xml",
    ".ini",
    ".conf"
}


def add_remediation(findings):
    for finding in findings:
        finding["remediation"] = get_remediation(
            finding["type"]
        )

    return findings


@app.route("/")
def home():
    return jsonify({
        "project": "Sentinel",
        "status": "running",
        "message": "Secrets and Credential Exposure Detection Platform"
    })


@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })


@app.route("/scan", methods=["POST"])
def scan():
    data = request.get_json(silent=True) or {}
    content = data.get("content", "")

    if not isinstance(content, str):
        return jsonify({
            "error": "content must be a string"
        }), 400

    if not content.strip():
        return jsonify({
            "error": "content cannot be empty"
        }), 400

    findings = detect_secrets(content)
    findings = add_remediation(findings)

    return jsonify({
        "status": "completed",
        "findings": findings,
        "count": len(findings)
    })


@app.route("/scan-file", methods=["POST"])
def scan_file():
    if "file" not in request.files:
        return jsonify({
            "error": "No file uploaded"
        }), 400

    uploaded_file = request.files["file"]

    if not uploaded_file.filename:
        return jsonify({
            "error": "Filename cannot be empty"
        }), 400

    filename = uploaded_file.filename.lower()

    if not any(filename.endswith(extension)
               for extension in ALLOWED_EXTENSIONS):
        return jsonify({
            "error": "File type is not supported"
        }), 400

    try:
        content = uploaded_file.read().decode("utf-8")
    except UnicodeDecodeError:
        return jsonify({
            "error": "File must be a UTF-8 text file"
        }), 400

    if not content.strip():
        return jsonify({
            "error": "Uploaded file is empty"
        }), 400

    findings = detect_secrets(content)
    findings = add_remediation(findings)

    return jsonify({
        "status": "completed",
        "filename": uploaded_file.filename,
        "findings": findings,
        "count": len(findings)
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
