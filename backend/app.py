from flask import Flask, jsonify, request
from flask_cors import CORS

from scanner.detector import detect_secrets

app = Flask(__name__)
CORS(app)


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

    return jsonify({
        "status": "completed",
        "findings": findings,
        "count": len(findings)
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
