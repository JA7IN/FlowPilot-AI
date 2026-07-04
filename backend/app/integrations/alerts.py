import os
from datetime import datetime
from typing import Dict, Any

def send_slack_notification(webhook_url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates sending a webhook request to Slack.
    Logs standard diagnostic information.
    """
    timestamp = datetime.utcnow().isoformat() + "Z"
    # Print simulated console alert in a visually noticeable format for CLI logs
    print("\n" + "="*50)
    print(f"[SLACK INTEGRATION ALERT] Sent to URL: {webhook_url}")
    print(f"Timestamp: {timestamp}")
    print(f"Text: {payload.get('text')}")
    if "attachments" in payload:
        print("Details:")
        for k, v in payload["attachments"][0].items():
            if k == "fields":
                for f in v:
                    print(f"  - {f['title']}: {f['value']}")
            else:
                print(f"  - {k}: {v}")
    print("="*50 + "\n")
    
    return {
        "status": "delivered",
        "timestamp": timestamp,
        "slack_webhook": webhook_url,
        "payload_sent": payload
    }

def trigger_hot_lead_alert(lead: Dict[str, Any]) -> Dict[str, Any]:
    """
    wf-2: Hot Lead Route & Alert
    Triggers Slack alert for sales when lead score >= 80
    """
    webhook_url = os.environ.get("SLACK_SALES_WEBHOOK", "https://hooks.slack.com/services/T000/B000/sales-alerts")
    
    payload = {
        "text": f"🔥 *Hot Lead Routed*: {lead.get('name')} from *{lead.get('company')}* reached score {lead.get('lead_score')}.",
        "attachments": [
            {
                "color": "#ff4d4f",
                "fields": [
                    {"title": "Lead Name", "value": lead.get("name"), "short": True},
                    {"title": "Company", "value": lead.get("company"), "short": True},
                    {"title": "Lead Score", "value": str(lead.get("lead_score")), "short": True},
                    {"title": "Pipeline Value", "value": f"${lead.get('pipeline_value'):,.2f}", "short": True},
                    {"title": "Conversion Rate", "value": f"{int(lead.get('conversion_probability') * 100)}%", "short": True},
                    {"title": "Last Message", "value": lead.get("conversation")[-1]["message"] if lead.get("conversation") else "None", "short": False}
                ]
            }
        ]
    }
    
    return send_slack_notification(webhook_url, payload)

def trigger_frustration_escalation_alert(lead: Dict[str, Any]) -> Dict[str, Any]:
    """
    wf-3: Frustrated Escalation Node
    Triggers support channel notification when sentiment is Frustrated
    """
    webhook_url = os.environ.get("SLACK_SUPPORT_WEBHOOK", "https://hooks.slack.com/services/T000/B000/support-escalations")
    
    payload = {
        "text": f"🚨 *Urgent Customer Escalation*: {lead.get('name')} from *{lead.get('company')}* sentiment classified as 'Frustrated'.",
        "attachments": [
            {
                "color": "#faad14",
                "fields": [
                    {"title": "Lead Name", "value": lead.get("name"), "short": True},
                    {"title": "Company", "value": lead.get("company"), "short": True},
                    {"title": "Email", "value": lead.get("email"), "short": True},
                    {"title": "Pipeline Value", "value": f"${lead.get('pipeline_value'):,.2f}", "short": True},
                    {"title": "AI Replying Status", "value": "PAUSED", "short": True},
                    {"title": "Last Message Content", "value": lead.get("conversation")[-1]["message"] if lead.get("conversation") else "None", "short": False}
                ]
            }
        ]
    }
    
    return send_slack_notification(webhook_url, payload)
