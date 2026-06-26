import json
import os
import logging
import requests
from urllib3.exceptions import InsecureRequestWarning

# Suppress unverified HTTPS warnings in terminal when local proxies intercept traffic
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

from flask import Blueprint, request, Response

sms_bp = Blueprint("sms", __name__)

def _dispatch_at_sms(username: str, api_key: str, recipient: str, text_payload: str):
    """
    Dispatches outbound SMS payloads via Africa's Talking.
    Includes explicit debugging to trace API responses.
    """
    if username.lower() == "sandbox":
        url = "https://api.sandbox.africastalking.com/version1/messaging"
    else:
        url = "https://api.africastalking.com/version1/messaging"
        
    payload = {
        "username": username,
        "to": recipient,
        "message": text_payload
    }
    headers = {
        "apiKey": api_key,
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    print(f"\n📡 [OUTBOUND REQUEST] Attempting delivery to Africa's Talking Sandbox...")
    print(f"   🔹 Target URL: {url}")
    print(f"   🔹 Recipient:  {recipient}")
    print(f"   🔹 Payload Len: {len(text_payload)} characters")
    
    try:
        # Step 1: Attempt standard secure handshake
        resp = requests.post(url, data=payload, headers=headers, timeout=10)
        return resp
    except requests.exceptions.SSLError as ssl_err:
        print(f"   ⚠️ [NETWORK WARNING] Local SSL Handshake intercepted. Engaging automated bypass loop...")
        # Step 2: Fallback bypass for strict local proxy/firewall environments
        resp = requests.post(url, data=payload, headers=headers, timeout=10, verify=False)
        return resp
    except Exception as e:
        print(f"   ❌ [CRITICAL TRANSPORT ERROR] Transport layer failed completely: {e}")
        return None


@sms_bp.route("/sms", methods=["POST"])
def sms_callback():
    # 1. Parse incoming parameters from the AT Simulator
    sender = request.values.get("from", "")
    text_input = request.values.get("text", "").strip().upper()
    
    print("\n" + "═"*70)
    print(f"📥 [INBOUND SMS WEBHOOK TRIGGERED]")
    print(f"   📱 From Simulator Phone: {sender}")
    print(f"   🔑 Parsed Input Token:   '{text_input}'")
    print("═"*70)
    
    # 2. Open outbox database
    json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sms_outbox.json"))
    
    outbox_data = {}
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                outbox_data = json.load(f)
            print(f"   📂 Database: Successfully read 'sms_outbox.json' ({len(outbox_data)} total tokens indexed)")
        except Exception as e:
            print(f"   ❌ Database: Failed to read 'sms_outbox.json': {e}")
            
    # 3. Process database record lookup
    if text_input in outbox_data:
        record = outbox_data[text_input]
        advice_content = record.get("advice", "No content linked with this sequence.")
        
        print(f"   ✅ Match Found! Status: [Already Retrieved = {record.get('retrieved')}]")
        print(f"   📝 Cached Advice String:\n   ----------------------------------------------------------------")
        print(f"   {advice_content}")
        print(f"   ----------------------------------------------------------------")
        
        # Mark token as fetched in persistent memory
        record["retrieved"] = True
        try:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(outbox_data, f, indent=4)
            print(f"   💾 Database: Updated token '{text_input}' status to 'retrieved=True'")
        except Exception as e:
            print(f"   ❌ Database: Could not write updated flags back to disk: {e}")

        # 4. Trigger Outbound Dispatch Pipeline
        api_key = os.getenv("AT_API_KEY")
        username = os.getenv("AT_USERNAME", "sandbox")
        
        if api_key and api_key != "None":
            resp = _dispatch_at_sms(username, api_key, sender, advice_content)
            
            print("\n🏁 [OUTBOUND DISPATCH RESULTS]")
            if resp is not None:
                print(f"   🔹 HTTP Status Code: {resp.status_code}")
                print(f"   🔹 Raw AT Response:  {resp.text}")
                
                if resp.status_code in [200, 201]:
                    print(f"   🎉 SUCCESS: Africa's Talking accepted the message for delivery!")
                else:
                    print(f"   ❌ REJECTION: AT servers refused to queue the message. Check your Sandbox API Key configurations.")
            else:
                print("   ❌ ROUTING FAILED: No response could be fetched from Africa's Talking.")
        else:
            print("   ❌ CONFIG ERROR: Clear or unassigned AT_API_KEY detected inside environment setup.")
            
    else:
        print(f"   ❌ VALIDATION FAILURE: Token key '{text_input}' does not exist inside 'sms_outbox.json' database.")
        print(f"   💡 Current valid options in your JSON file include: {list(outbox_data.keys())}")

    print("═"*70 + "\n")
    return Response("OK", status=200, mimetype="text/plain")