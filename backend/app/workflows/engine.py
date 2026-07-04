from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.memory import store
from app.integrations import alerts

def run_workflow_inactive_reengagement(lead: Dict[str, Any]) -> bool:
    """
    wf-1: Inactive Re-engagement
    Triggers automatically if the lead has been inactive for > 48 hours.
    """
    now = datetime.utcnow()
    last_msg_str = lead.get("last_message_at")
    
    # Parse timestamp
    try:
        last_msg_at = datetime.fromisoformat(last_msg_str.replace("Z", ""))
    except Exception:
        last_msg_at = now
        
    is_inactive = (now - last_msg_at) > timedelta(hours=48)
    
    # We can also manually trigger it for demo purposes from the frontend
    # If it has already been recovered by wf-1, don't repeat
    # Let's check audit logs to see if wf-1 was already run for this lead
    logs = store.get_audit_logs()
    already_run = any(log["workflow_id"] == "wf-1" and log["lead_id"] == lead["id"] for log in logs)
    
    if (is_inactive or lead.get("_force_trigger_wf1")) and not already_run:
        lead["status"] = "recovered"
        lead["sentiment"] = "Satisfaction"
        lead["conversion_probability"] = 0.85  # Boost conversion rate
        lead["lead_score"] = min(100, lead.get("lead_score", 50) + 15)
        
        # Append the discount code email message
        discount_message = {
            "sender": "ai",
            "message": f"Hi {lead.get('name')}, we noticed you haven't completed onboarding yet. To help you get started with FlowPilot AI, here is a special early-bird 15% discount code: FLOW15! Let us know if you have any questions.",
            "timestamp": now.isoformat() + "Z"
        }
        lead["conversation"].append(discount_message)
        lead["last_message_at"] = now.isoformat() + "Z"
        lead["ai_summary"] = "Automatically re-engaged with a 15% discount code after 48 hours of inactivity."
        
        # Save updated lead
        store.save_lead(lead)
        
        # Add to audit logs
        store.add_audit_log(
            workflow_id="wf-1",
            lead_id=lead["id"],
            description=f"Inactive Re-engagement: Lead {lead.get('name')} was silent for over 48 hours. Updated status to 'recovered', sentiment to 'Satisfaction', and sent a 15% discount offer."
        )
        return True
        
    return False

def check_and_trigger_hot_lead_workflow(lead: Dict[str, Any]) -> bool:
    """
    wf-2: Hot Lead Route & Alert
    Triggers when lead score >= 80.
    """
    if lead.get("lead_score", 0) >= 80:
        logs = store.get_audit_logs()
        already_run = any(log["workflow_id"] == "wf-2" and log["lead_id"] == lead["id"] for log in logs)
        
        if not already_run:
            # Trigger Slack alert
            alerts.trigger_hot_lead_alert(lead)
            
            # Add to audit logs
            store.add_audit_log(
                workflow_id="wf-2",
                lead_id=lead["id"],
                description=f"Hot Lead Route: Lead {lead.get('name')} from {lead.get('company')} reached a score of {lead.get('lead_score')}. Dispatched Slack alert to channel #sales-alerts."
            )
            return True
    return False

def check_and_trigger_frustration_workflow(lead: Dict[str, Any]) -> bool:
    """
    wf-3: Frustration Escalation
    Triggers when sentiment is Frustrated.
    """
    if lead.get("sentiment") == "Frustrated":
        # Check if already escalated
        logs = store.get_audit_logs()
        already_run = any(log["workflow_id"] == "wf-3" and log["lead_id"] == lead["id"] for log in logs)
        
        if not already_run or lead.get("ai_reply_paused") is False:
            # Pause AI loop
            lead["ai_reply_paused"] = True
            lead["status"] = "escalated"
            store.save_lead(lead)
            
            # Trigger Slack escalation
            alerts.trigger_frustration_escalation_alert(lead)
            
            # Add to audit logs
            store.add_audit_log(
                workflow_id="wf-3",
                lead_id=lead["id"],
                description=f"Frustration Escalation: Lead {lead.get('name')} sentiment classified as 'Frustrated'. Paused autonomous replying loop and routed support ticket."
            )
            return True
    return False

def scan_and_run_all_workflows() -> Dict[str, int]:
    """
    Scans all leads in the storage and triggers workflows (like inactive re-engagement).
    """
    leads = store.get_leads()
    triggered_wf1 = 0
    triggered_wf2 = 0
    triggered_wf3 = 0
    
    for l in leads:
        # Run inactivity workflow
        if run_workflow_inactive_reengagement(l):
            triggered_wf1 += 1
        
        # Run hot lead check
        if check_and_trigger_hot_lead_workflow(l):
            triggered_wf2 += 1
            
        # Run frustration check
        if check_and_trigger_frustration_workflow(l):
            triggered_wf3 += 1
            
    return {
        "inactive_reengaged": triggered_wf1,
        "hot_leads_routed": triggered_wf2,
        "frustrated_escalated": triggered_wf3
    }
