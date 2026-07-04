import os
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime
from typing import List, Dict, Any
import google.generativeai as genai

# Setup Gemini API key if present
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

async def generate_sales_summary(conversation: List[Dict[str, str]], company_name: str) -> str:
    """
    Summarizes the conversation history into a 1-sentence sales summary under 20 words.
    Uses Gemini 1.5 Flash if GEMINI_API_KEY is present, otherwise falls back to a smart heuristic.
    """
    if not conversation:
        return "No conversation history available."
        
    conversation_text = "\n".join([f"{msg['sender'].upper()}: {msg['message']}" for msg in conversation])
    
    if os.environ.get("GEMINI_API_KEY"):
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                "You are an expert sales operations analyst. "
                "Analyze the following conversation and write a concise, one-sentence sales summary updating the lead profile in real-time. "
                "The summary MUST be strictly under 20 words.\n\n"
                f"Conversation:\n{conversation_text}\n\n"
                "Summary:"
            )
            # Run in a separate thread if needed, or call directly
            response = model.generate_content(prompt)
            summary = response.text.strip()
            # Clean up quotes if returned
            summary = summary.replace('"', '').replace("'", "")
            return summary
        except Exception as e:
            print(f"Gemini summarization failed, falling back to heuristics. Error: {e}")
            
    # Heuristics fallback
    # Check messages for keywords to build a customized summary
    full_text = " ".join([msg["message"].lower() for msg in conversation])
    
    if "sso" in full_text or "saml" in full_text or "security" in full_text:
        return f"Prospect at {company_name} is evaluating security features, specifically requesting SAML SSO configuration details."
    elif "cancel" in full_text or "terrible" in full_text or "crash" in full_text:
        return f"Urgent: client at {company_name} is experiencing technical issues and requested immediate human support escalation."
    elif "invoice" in full_text or "buy" in full_text or "pay" in full_text:
        return f"High-intent lead from {company_name} requested direct billing/onboarding checkout link to close the contract."
    elif "expensive" in full_text or "price" in full_text or "budget" in full_text or "cost" in full_text:
        return f"Lead at {company_name} is interested but raising pricing concerns, negotiating for discount options."
    elif "demo" in full_text or "meeting" in full_text or "call" in full_text:
        return f"Prospect from {company_name} is interested and coordinating a convenient time to schedule a live product demo."
    
    return f"Active conversation in progress with {company_name} regarding standard product features and integration capabilities."

def sync_to_crm(lead_id: str, lead_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates sync webhook payload with Salesforce/HubSpot CRM.
    Returns logged synchronization metrics.
    """
    provider = "HubSpot" if hash(lead_id) % 2 == 0 else "Salesforce"
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    synced_fields = [
        "lead_score", "sentiment", "conversion_probability", 
        "churn_risk", "pipeline_value", "ai_summary", "status"
    ]
    
    # Simulates outbound webhook payload
    payload = {
        "event": "lead.updated",
        "timestamp": timestamp,
        "provider": provider,
        "lead": {
            "external_id": lead_id,
            "email": lead_data.get("email"),
            "company": lead_data.get("company"),
            "owner_assigned": "Sales Route Queue",
            "crm_stage": lead_data.get("status"),
            "pipeline_value": lead_data.get("pipeline_value"),
            "custom_attributes": {
                "flowpilot_score": lead_data.get("lead_score"),
                "flowpilot_sentiment": lead_data.get("sentiment"),
                "flowpilot_conversion_rate": lead_data.get("conversion_probability"),
                "flowpilot_churn_risk": lead_data.get("churn_risk"),
                "flowpilot_ai_summary": lead_data.get("ai_summary")
            }
        }
    }
    
    # We will log the sync action to standard output for CLI visibility
    print(f"[CRM Sync] Outbound webhook triggered for lead {lead_id} to {provider} at {timestamp}")
    
    return {
        "status": "success",
        "synced_at": timestamp,
        "crm_provider": provider,
        "synced_fields": synced_fields,
        "webhook_payload": payload
    }
