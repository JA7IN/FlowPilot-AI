import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.memory import store
from app.lead_scoring import scorer
from app.crm import sync
from app.workflows import engine
from app.agents import graph

app = FastAPI(title="FlowPilot AI Backend API", version="1.0.0")

# CORS middleware config for frontend on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class MessageRequest(BaseModel):
    lead_id: str
    message: str

class WorkflowTriggerRequest(BaseModel):
    lead_id: str
    workflow_id: str

class LeadCreateRequest(BaseModel):
    name: str
    email: str
    company: str
    pipeline_value: float

@app.get("/api/leads")
async def get_leads_api():
    return store.get_leads()

@app.get("/api/leads/{lead_id}")
async def get_lead_api(lead_id: str):
    lead = store.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@app.post("/api/leads")
async def create_lead_api(req: LeadCreateRequest):
    new_id = f"lead-{len(store.get_leads()) + 1}"
    now_str = datetime.utcnow().isoformat() + "Z"
    
    new_lead = {
        "id": new_id,
        "name": req.name,
        "email": req.email,
        "company": req.company,
        "status": "new",
        "lead_score": 50,
        "sentiment": "Neutral",
        "conversion_probability": 0.50,
        "churn_risk": "Low",
        "pipeline_value": req.pipeline_value,
        "last_message_at": now_str,
        "crm_synced": False,
        "ai_summary": "Newly created lead. No conversation history yet.",
        "ai_reply_paused": False,
        "conversation": []
    }
    
    store.save_lead(new_lead)
    return new_lead

@app.post("/api/chat")
async def chat_api(req: MessageRequest, background_tasks: BackgroundTasks):
    lead = store.get_lead(req.lead_id)
    if not lead:
        # If lead is not found (e.g. sandbox testing for non-existent lead), create mock
        lead = {
            "id": req.lead_id,
            "name": "Sandbox Lead",
            "email": "sandbox@example.com",
            "company": "Sandbox Inc.",
            "status": "new",
            "lead_score": 50,
            "sentiment": "Neutral",
            "conversion_probability": 0.50,
            "churn_risk": "Low",
            "pipeline_value": 10000.0,
            "last_message_at": datetime.utcnow().isoformat() + "Z",
            "crm_synced": False,
            "ai_summary": "",
            "ai_reply_paused": False,
            "conversation": []
        }
        
    now_str = datetime.utcnow().isoformat() + "Z"
    
    # 1. Append client message
    client_msg = {
        "sender": "client",
        "message": req.message,
        "timestamp": now_str
    }
    lead["conversation"].append(client_msg)
    lead["last_message_at"] = now_str
    
    # 2. Check if AI replies are paused
    if lead.get("ai_reply_paused", False):
        # Even if paused, we must save client message
        store.save_lead(lead)
        # Scan for workflows (e.g. if the user says something frustrated again)
        # If it triggers frustrated, update sentiment/score, but don't send AI reply
        analysis = scorer.analyze_message_and_score(
            req.message, 
            lead.get("lead_score", 50), 
            lead.get("sentiment", "Neutral")
        )
        lead["sentiment"] = analysis["sentiment"]
        lead["lead_score"] = analysis["lead_score"]
        lead["conversion_probability"] = analysis["conversion_probability"]
        lead["churn_risk"] = analysis["churn_risk"]
        store.save_lead(lead)
        
        # Trigger workflows
        engine.check_and_trigger_frustration_workflow(lead)
        engine.check_and_trigger_hot_lead_workflow(lead)
        
        return {
            "lead": lead,
            "response": "Automated AI replying is paused for this lead. Support team has been alerted.",
            "replied": False
        }
        
    # 3. Invoke LangGraph decision machine
    graph_res = await graph.run_langgraph_agent(
        lead_id=lead["id"],
        name=lead["name"],
        company=lead["company"],
        message=req.message,
        history=lead["conversation"][:-1],  # history excluding the latest user message
        lead_score=lead.get("lead_score", 50),
        sentiment=lead.get("sentiment", "Neutral")
    )
    
    # 4. Extract results
    ai_reply_text = graph_res.get("response", "Thanks for reaching out! Let me check on that.")
    lead["sentiment"] = graph_res.get("sentiment", "Neutral")
    lead["lead_score"] = graph_res.get("lead_score", 50)
    lead["conversion_probability"] = graph_res.get("conversion_probability", 0.5)
    lead["churn_risk"] = graph_res.get("churn_risk", "Low")
    
    # 5. Append AI response
    ai_msg = {
        "sender": "ai",
        "message": ai_reply_text,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    lead["conversation"].append(ai_msg)
    
    # 6. Generate Sales Summary (async / background task or direct)
    # Direct is fine for demo reliability
    summary = await sync.generate_sales_summary(lead["conversation"], lead["company"])
    lead["ai_summary"] = summary
    
    # Save lead state
    store.save_lead(lead)
    
    # 7. Check automation rules / workflows (wf-2, wf-3)
    # If the user message makes them frustrated, this will pause the loop
    engine.check_and_trigger_frustration_workflow(lead)
    engine.check_and_trigger_hot_lead_workflow(lead)
    
    # Retrieve updated lead in case workflows changed status or paused replying
    updated_lead = store.get_lead(lead["id"]) or lead
    
    # 8. Outbound Webhook Sync to CRM
    # Trigger CRM sync mock and log it
    sync_result = sync.sync_to_crm(updated_lead["id"], updated_lead)
    updated_lead["crm_synced"] = (sync_result["status"] == "success")
    store.save_lead(updated_lead)
    
    return {
        "lead": updated_lead,
        "response": ai_reply_text,
        "replied": True,
        "crm_sync": sync_result
    }

@app.get("/api/analytics")
async def get_analytics_api():
    return metrics.calculate_dashboard_metrics()

# Import metrics inside helper endpoint or resolve cycle
from app.analytics import metrics

@app.get("/api/audit-logs")
async def get_audit_logs_api():
    return store.get_audit_logs()

@app.post("/api/workflows/trigger")
async def trigger_workflow_api(req: WorkflowTriggerRequest):
    lead = store.get_lead(req.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if req.workflow_id == "wf-1":
        # Force run inactive re-engagement workflow
        lead["_force_trigger_wf1"] = True
        success = engine.run_workflow_inactive_reengagement(lead)
        # Clear temporary flag
        lead = store.get_lead(req.lead_id)
        if "_force_trigger_wf1" in lead:
            del lead["_force_trigger_wf1"]
            store.save_lead(lead)
            
        if success:
            return {"status": "success", "detail": "Workflow wf-1 inactive re-engagement triggered."}
        else:
            return {"status": "skipped", "detail": "Workflow wf-1 already run or not eligible."}
            
    elif req.workflow_id == "wf-2":
        success = engine.check_and_trigger_hot_lead_workflow(lead)
        if success:
            return {"status": "success", "detail": "Workflow wf-2 hot lead route triggered."}
        else:
            return {"status": "skipped", "detail": "Workflow wf-2 already run or lead score below 80."}
            
    elif req.workflow_id == "wf-3":
        # Force trigger frustration escalation
        lead["sentiment"] = "Frustrated"
        store.save_lead(lead)
        success = engine.check_and_trigger_frustration_workflow(lead)
        if success:
            return {"status": "success", "detail": "Workflow wf-3 frustration escalation triggered."}
        else:
            return {"status": "skipped", "detail": "Workflow wf-3 already run."}
            
    raise HTTPException(status_code=400, detail="Invalid workflow ID")

@app.post("/api/leads/{lead_id}/resume")
async def resume_lead_api(lead_id: str):
    lead = store.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    lead["ai_reply_paused"] = False
    if lead["status"] == "escalated":
        lead["status"] = "nurturing"
    store.save_lead(lead)
    
    # Log the action
    store.add_audit_log(
        workflow_id="manual-resume",
        lead_id=lead_id,
        description=f"Manual action: Resumed autonomous AI replying loop for lead {lead.get('name')} and changed status to nurturing."
    )
    
    return {"status": "success", "lead": lead}

@app.post("/api/reset")
async def reset_database_api():
    store.reset_db()
    return {"status": "success", "detail": "Database reset to baseline seeds."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
