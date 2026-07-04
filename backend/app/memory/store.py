import os
import json
from datetime import datetime, timedelta
import threading
from typing import Dict, List, Any, Optional

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")
lock = threading.Lock()

# Seed dynamic baseline timestamps to ensure mock leads look fresh
now = datetime.utcnow()
def format_time(dt: datetime) -> str:
    return dt.isoformat() + "Z"

DEFAULT_LEADS = [
    {
        "id": "lead-1",
        "name": "Sarah Jenkins",
        "email": "sarah.jenkins@sentrysec.io",
        "company": "SentrySec",
        "status": "nurturing",
        "lead_score": 85,
        "sentiment": "Excited",
        "conversion_probability": 0.94,
        "churn_risk": "Low",
        "pipeline_value": 18500.0,
        "last_message_at": format_time(now - timedelta(hours=2)),
        "crm_synced": True,
        "ai_summary": "Prospect is highly interested in SAML SSO configuration and scheduling a team onboarding session.",
        "ai_reply_paused": False,
        "conversation": [
            {
                "sender": "client",
                "message": "Hi, we are looking for a pipeline recovery platform. Do you support SAML SSO for enterprise?",
                "timestamp": format_time(now - timedelta(hours=4))
            },
            {
                "sender": "ai",
                "message": "Hello Sarah! Yes, we support full SAML SSO integration for enterprise teams to ensure secure authentication. I can help set this up for your team. Would you like to schedule a quick demo?",
                "timestamp": format_time(now - timedelta(hours=3))
            },
            {
                "sender": "client",
                "message": "Yes, please. That sounds perfect. Let's schedule it for Monday morning.",
                "timestamp": format_time(now - timedelta(hours=2))
            }
        ]
    },
    {
        "id": "lead-2",
        "name": "Michael Chen",
        "email": "m.chen@apexsystems.com",
        "company": "Apex Systems",
        "status": "nurturing",
        "lead_score": 38,
        "sentiment": "Hesitant",
        "conversion_probability": 0.32,
        "churn_risk": "Medium",
        "pipeline_value": 7200.0,
        "last_message_at": format_time(now - timedelta(hours=6)),
        "crm_synced": True,
        "ai_summary": "Prospect raised pricing concerns and asked for startup discounts or cheaper tiers.",
        "ai_reply_paused": False,
        "conversation": [
            {
                "sender": "client",
                "message": "Hello, is there any discount for early-stage startups? The current cost is a bit expensive for our current budget.",
                "timestamp": format_time(now - timedelta(hours=6))
            }
        ]
    },
    {
        "id": "lead-3",
        "name": "David Miller",
        "email": "d.miller@stripe-labs.com",
        "company": "Stripe Labs",
        "status": "new",
        "lead_score": 92,
        "sentiment": "Urgent",
        "conversion_probability": 0.98,
        "churn_risk": "Low",
        "pipeline_value": 35000.0,
        "last_message_at": format_time(now - timedelta(minutes=15)),
        "crm_synced": True,
        "ai_summary": "Lead is urgent to buy, asking for onboarding invoices and quick contract sign-off.",
        "ai_reply_paused": False,
        "conversation": [
            {
                "sender": "client",
                "message": "We need to get started immediately. Can you send over the invoice and the direct link to complete onboarding?",
                "timestamp": format_time(now - timedelta(minutes=15))
            }
        ]
    },
    {
        "id": "lead-4",
        "name": "Emily Watson",
        "email": "emily.watson@cloudscale.net",
        "company": "CloudScale",
        "status": "escalated",
        "lead_score": 20,
        "sentiment": "Frustrated",
        "conversion_probability": 0.10,
        "churn_risk": "High",
        "pipeline_value": 12500.0,
        "last_message_at": format_time(now - timedelta(hours=1)),
        "crm_synced": False,
        "ai_summary": "Client is extremely frustrated with setup errors and requested manual support escalation.",
        "ai_reply_paused": True,
        "conversation": [
            {
                "sender": "client",
                "message": "This integration is terrible! It keeps crashing during the auth step. I want to cancel my trial immediately, or get me a real human!",
                "timestamp": format_time(now - timedelta(hours=1))
            }
        ]
    },
    {
        "id": "lead-5",
        "name": "Robert Downey",
        "email": "robert@ironcorp.dev",
        "company": "IronCorp",
        "status": "nurturing",
        "lead_score": 55,
        "sentiment": "Neutral",
        "conversion_probability": 0.55,
        "churn_risk": "Low",
        "pipeline_value": 15000.0,
        "last_message_at": format_time(now - timedelta(days=3)),
        "crm_synced": True,
        "ai_summary": "Inactive lead. Last conversation was a query about standard developer API rate limits.",
        "ai_reply_paused": False,
        "conversation": [
            {
                "sender": "client",
                "message": "What are the standard developer API rate limits for the pipeline metrics endpoint?",
                "timestamp": format_time(now - timedelta(days=3))
            }
        ]
    }
]

DEFAULT_AUDIT_LOGS = [
    {
        "id": "log-1",
        "timestamp": format_time(now - timedelta(hours=1)),
        "workflow_id": "wf-3",
        "lead_id": "lead-4",
        "description": "Frustration Escalation: Lead Emily Watson triggered 'Frustrated' sentiment. Paused AI replies, dispatched Slack alert, and queued support ticket."
    },
    {
        "id": "log-2",
        "timestamp": format_time(now - timedelta(minutes=15)),
        "workflow_id": "wf-2",
        "lead_id": "lead-3",
        "description": "Hot Lead Route: David Miller reached score of 92. Alerted Slack channel #sales-alerts and assigned owner."
    }
]

def load_data() -> Dict[str, Any]:
    with lock:
        if not os.path.exists(DATA_FILE):
            data = {"leads": DEFAULT_LEADS, "audit_logs": DEFAULT_AUDIT_LOGS}
            save_data(data)
            return data
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {"leads": DEFAULT_LEADS, "audit_logs": DEFAULT_AUDIT_LOGS}

def save_data(data: Dict[str, Any]) -> None:
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Error saving database data: {e}")

def get_leads() -> List[Dict[str, Any]]:
    return load_data()["leads"]

def get_lead(lead_id: str) -> Optional[Dict[str, Any]]:
    leads = get_leads()
    for l in leads:
        if l["id"] == lead_id:
            return l
    return None

def save_lead(lead: Dict[str, Any]) -> None:
    data = load_data()
    leads = data["leads"]
    updated = False
    for i, l in enumerate(leads):
        if l["id"] == lead["id"]:
            leads[i] = lead
            updated = True
            break
    if not updated:
        leads.append(lead)
    data["leads"] = leads
    with lock:
        save_data(data)

def get_audit_logs() -> List[Dict[str, Any]]:
    return load_data()["audit_logs"]

def add_audit_log(workflow_id: str, lead_id: str, description: str) -> Dict[str, Any]:
    data = load_data()
    log_entry = {
        "id": f"log-{len(data['audit_logs']) + 1}",
        "timestamp": format_time(datetime.utcnow()),
        "workflow_id": workflow_id,
        "lead_id": lead_id,
        "description": description
    }
    data["audit_logs"].insert(0, log_entry)  # newest first
    with lock:
        save_data(data)
    return log_entry

def reset_db() -> None:
    data = {"leads": DEFAULT_LEADS, "audit_logs": DEFAULT_AUDIT_LOGS}
    with lock:
        save_data(data)
