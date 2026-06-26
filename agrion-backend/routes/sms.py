import os
import logging
import requests
from urllib3.exceptions import InsecureRequestWarning
from flask import Blueprint, request, Response
from services.sms_store import save_sms_token
# Import the official Neo4j driver package
from neo4j import GraphDatabase

# Suppress unverified HTTPS warnings in terminal when local proxies intercept traffic
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

sms_bp = Blueprint("sms", __name__)

def get_neo4j_driver():
    """Establishes an on-demand connection to your cloud Neo4j instance."""
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    username = os.getenv("NEO4J_USERNAME", "neo4j")
    password = os.getenv("NEO4J_PASSWORD")
    return GraphDatabase.driver(uri, auth=(username, password))


def _dispatch_at_sms(username: str, api_key: str, recipient: str, text_payload: str):
    """Dispatches outbound SMS payloads via Africa's Talking with local proxy safety handles."""
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
    
    try:
        return requests.post(url, data=payload, headers=headers, timeout=10)
    except requests.exceptions.SSLError:
        # Fallback bypass loop for secure local inspection proxies
        return requests.post(url, data=payload, headers=headers, timeout=10, verify=False)
    except Exception as e:
        print(f"   ❌ [TRANSPORT ERROR] Failed routing to AT servers: {e}")
        return None


@sms_bp.route("/sms", methods=["POST"])
def sms_callback():
    sender = request.values.get("from", "")
    text_input = request.values.get("text", "").strip().upper()
    
    print("\n" + "═"*70)
    print(f"📥 [LIVE GRAPH WEBHOOK TRIGGERED]")
    print(f"   📱 From Phone: {sender}")
    print(f"   🔑 Input Token: '{text_input}'")
    print("═"*70)
    
    # 1. Open Database Transaction Channel
    try:
        driver = get_neo4j_driver()
    except Exception as e:
        print(f"   ❌ [NEO4J CONNECTION ERROR] Driver instantiation failed: {e}")
        return Response("DB Error", status=500, mimetype="text/plain")

    advice_content = None
    already_retrieved = False

    # 2. Match and Update Token State inside Neo4j in a single thread-safe query
    query = """
    MATCH (t:SMSOutbox {token: $token})
    WITH t, t.advice AS advice, t.retrieved AS retrieved
    SET t.retrieved = true, t.updatedAt = datetime()
    RETURN advice, retrieved
    """
    
    with driver.session() as session:
        try:
            result = session.run(query, token=text_input)
            record = result.single()
            if record:
                advice_content = record["advice"]
                already_retrieved = record["retrieved"]
        except Exception as e:
            print(f"   ❌ [CYPHER EXECUTION CRASH] Query failed against Graph Instance: {e}")
        finally:
            driver.close()

    # 3. Evaluate Results Found in Graph Nodes
    if advice_content:
        print(f"   🌳 Graph Query Match: Found node successfully!")
        print(f"   🔹 Prior Status: [Already Retrieved = {already_retrieved}]")
        print(f"   📝 Loaded Graph Advice:\n   ----------------------------------------------------------------")
        print(f"   {advice_content}")
        print(f"   ----------------------------------------------------------------")
        
        # 4. Fire Outbound Delivery Pipeline
        api_key = os.getenv("AT_API_KEY")
        username = os.getenv("AT_USERNAME", "sandbox")
        
        if api_key and api_key != "None":
            resp = _dispatch_at_sms(username, api_key, sender, advice_content)
            
            print("\n🏁 [OUTBOUND DELIVERY RESULTS]")
            if resp is not None:
                print(f"   🔹 HTTP Status Code: {resp.status_code}")
                print(f"   🔹 Raw AT Response:  {resp.text}")
                if resp.status_code in [200, 201]:
                    print(f"   🎉 SUCCESS: Cloud message successfully pushed to destination device!")
                else:
                    print(f"   ❌ REJECTION: Outbound connection rejected by Africa's Talking.")
            else:
                print("   ❌ ROUTING FAILURE: Server dropped connection upstream.")
        else:
            print("   ❌ CONFIG ERROR: Clear or unassigned AT_API_KEY detected.")
    else:
        print(f"   ❌ GRAPH VALIDATION FAILURE: Token node matching '{text_input}' does not exist inside Neo4j.")

    print("═"*70 + "\n")
    return Response("OK", status=200, mimetype="text/plain")