"""
Smoke tests that exercise the full request flow WITHOUT needing real
Neo4j or Featherless credentials -- every service degrades gracefully,
so these prove the wiring is correct before you plug in real keys.

Run with: python tests/test_smoke.py
(or `pytest tests/` if pytest is installed)
"""
import os
import sys

# Append parent directory to sys.path so 'app' can be imported cleanly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import load_dotenv and execute it before importing app
from dotenv import load_dotenv
load_dotenv() 

from app import app

def test_health():
    client = app.test_client()
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"

def test_ussd_welcome_menu():
    client = app.test_client()
    resp = client.post(
        "/ussd",
        data={"sessionId": "abc", "serviceCode": "*384*55#", "phoneNumber": "+2348012345678", "text": ""},
    )
    assert resp.status_code == 200
    assert b"Welcome to Agrion" in resp.data
    assert resp.data.startswith(b"CON")

def test_ussd_crop_menu():
    client = app.test_client()
    resp = client.post(
        "/ussd",
        data={"sessionId": "abc", "serviceCode": "*384*55#", "phoneNumber": "+2348012345678", "text": "1"},
    )
    assert b"Maize" in resp.data

def test_ussd_full_flow_returns_end_with_advice():
    client = app.test_client()
    resp = client.post(
        "/ussd",
        data={
            "sessionId": "abc",
            "serviceCode": "*384*55#",
            "phoneNumber": "+2348012345678",
            "text": "1*1*yellow leaves on my maize",
        },
    )
    assert resp.status_code == 200
    assert resp.data.startswith(b"END ")
    assert len(resp.data) > len(b"END ")

def test_sms_flow():
    client = app.test_client()
    resp = client.post(
        "/sms",
        data={"from": "+2348012345678", "text": "My tomato leaves have brown spots"},
    )
    assert resp.status_code == 200
    body = resp.get_json()
    assert "reply_text" in body

def test_web_consent_then_advice_flow():
    client = app.test_client()

    consent_resp = client.post("/api/consent", json={"phone": "+2348000000000", "granted": True})
    assert consent_resp.status_code == 200
    assert consent_resp.get_json()["consent"] is True

    advice_resp = client.post(
        "/api/advice",
        json={"phone": "+2348000000000", "crop": "maize", "question": "My maize leaves are turning yellow"},
    )
    assert advice_resp.status_code == 200
    body = advice_resp.get_json()
    assert "answer" in body and body["answer"]

def test_web_advice_requires_question():
    client = app.test_client()
    resp = client.post("/api/advice", json={"phone": "+2348000000000"})
    assert resp.status_code == 400


if __name__ == "__main__":
    tests = [v for k, v in list(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"PASS: {t.__name__}")
    print(f"\nAll {len(tests)} smoke tests passed.")