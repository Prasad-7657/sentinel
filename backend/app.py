from flask import Flask, jsonify
from flask_cors import CORS

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


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

