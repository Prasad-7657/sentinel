import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as test_client:
        yield test_client


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "healthy"


def test_scan_endpoint(client):
    response = client.post(
        "/scan",
        json={
            "content": 'aws_key = "AKIAIOSFODNN7EXAMPLE"'
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "completed"
    assert data["count"] >= 1
    assert len(data["findings"]) >= 1


def test_scan_empty_content(client):
    response = client.post(
        "/scan",
        json={
            "content": ""
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert "error" in  data 


def test_scan_missing_content(client):
    response = client.post(
        "/scan",
        json={}
    )

    assert response.status_code == 400


def test_scan_invalid_json(client):
    response = client.post(
        "/scan",
        data="not-json",
        content_type="application/json"
    )

    assert response.status_code == 400
