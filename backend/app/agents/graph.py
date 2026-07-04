import os
from dotenv import load_dotenv
load_dotenv()
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
import google.generativeai as genai
from app.lead_scoring.scorer import analyze_message_and_score

# Setup Gemini API key
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class AgentState(TypedDict):
    lead_id: str
    name: str
    company: str
    message: str
    history: List[Dict[str, str]]
    lead_score: int
    sentiment: str
    conversion_probability: float
    churn_risk: str
    response: str
    api_key_configured: bool

# Heuristic objections fallback copy
HEURISTIC_REPLIES = {
    "sso": (
        "Our enterprise plan includes comprehensive SAML 2.0 Single Sign-On (SSO) support "
        "compatible with Okta, Azure AD, and Ping Identity. We also provide full security compliance "
        "documentation and SOC 2 Type II validation. Would you like to connect with our security "
        "engineer to review your requirements?"
    ),
    "price": (
        "I completely understand that budget is an important consideration. To help you evaluate the "
        "ROI of FlowPilot AI, we can offer a customized pilot package or a 15% discount for your "
        "first three months. Alternatively, we have a flexible startup tier. Would you be open to a "
        "quick chat to find a model that fits your budget?"
    ),
    "demo": (
        "I'd love to walk you through our platform in a live demo! You can book a convenient slot "
        "directly on our sales calendar at calendar.flowpilot.ai/demo, or let me know a few times "
        "that work for you next week."
    ),
    "cancel": (
        "I'm so sorry to hear you're having trouble and wanting to cancel. I've paused my automated "
        "replies and escalated this to our senior support team. A representative will contact you at "
        "your email address within the hour to resolve any issues. Thank you for your patience."
    ),
    "general": (
        "Thanks for reaching out! FlowPilot AI is designed to help your sales team automate follow-ups, "
        "handle objections, and recover lost pipeline. I'd love to help answer any questions or help "
        "you set up your trial. What specific features are you looking to test?"
    )
}

def analyze_sentiment_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 1: Evaluates client message and classifies sentiment.
    """
    analysis = analyze_message_and_score(
        message=state["message"],
        current_score=state["lead_score"],
        current_sentiment=state["sentiment"]
    )
    return {
        "sentiment": analysis["sentiment"],
        "lead_score": analysis["lead_score"]
    }

def calculate_lead_score_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 2: Recalculates metrics (conversion rate, churn risk).
    """
    analysis = analyze_message_and_score(
        message=state["message"],
        current_score=state["lead_score"],
        current_sentiment=state["sentiment"]
    )
    return {
        "conversion_probability": analysis["conversion_probability"],
        "churn_risk": analysis["churn_risk"]
    }

def generate_response_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 3: Generates reply using Gemini or Heuristic Fallbacks.
    """
    text = state["message"].lower()
    api_key_configured = os.environ.get("GEMINI_API_KEY") is not None
    
    # Check if replies are paused due to frustration escalation
    # If so, return support routing notice
    if state["sentiment"] == "Frustrated":
        return {
            "response": HEURISTIC_REPLIES["cancel"],
            "api_key_configured": api_key_configured
        }
        
    if api_key_configured:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            # Format chat log history for context
            history_lines = []
            for msg in state["history"][-6:]:  # past 6 turns
                history_lines.append(f"{msg['sender'].upper()}: {msg['message']}")
            history_text = "\n".join(history_lines)
            
            prompt = (
                "You are FlowPilot SDR, a helpful AI assistant for sales automation and objection handling. "
                f"You are talking to {state['name']} from {state['company']}. "
                "Review the conversation history and answer the latest client message. "
                "Keep responses professional, empathetic, friendly, and under 80 words. "
                "Always steer the conversation towards booking a demo or resolving their objection.\n\n"
                f"History:\n{history_text}\n"
                f"Client Message: {state['message']}\n\n"
                "Response:"
            )
            
            response = model.generate_content(prompt)
            return {
                "response": response.text.strip(),
                "api_key_configured": True
            }
        except Exception as e:
            print(f"Gemini response generation failed, falling back to heuristics: {e}")
            
    # Heuristics offline fallback router
    response_text = HEURISTIC_REPLIES["general"]
    if "sso" in text or "saml" in text or "security" in text or "compliance" in text:
        response_text = HEURISTIC_REPLIES["sso"]
    elif "cancel" in text or "terrible" in text or "crash" in text:
        response_text = HEURISTIC_REPLIES["cancel"]
    elif "expensive" in text or "price" in text or "budget" in text or "cost" in text or "discount" in text:
        response_text = HEURISTIC_REPLIES["price"]
    elif "demo" in text or "meeting" in text or "call" in text or "schedule" in text:
        response_text = HEURISTIC_REPLIES["demo"]
        
    return {
        "response": response_text,
        "api_key_configured": api_key_configured
    }

# Assemble LangGraph Workflow StateMachine
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("analyze_sentiment", analyze_sentiment_node)
workflow.add_node("calculate_lead_score", calculate_lead_score_node)
workflow.add_node("generate_response", generate_response_node)

# Add Edges
workflow.set_entry_point("analyze_sentiment")
workflow.add_edge("analyze_sentiment", "calculate_lead_score")
workflow.add_edge("calculate_lead_score", "generate_response")
workflow.add_edge("generate_response", END)

# Compile Graph
graph_agent = workflow.compile()

async def run_langgraph_agent(
    lead_id: str,
    name: str,
    company: str,
    message: str,
    history: List[Dict[str, str]],
    lead_score: int,
    sentiment: str
) -> Dict[str, Any]:
    """
    Invokes the state machine graph async with input parameters.
    """
    initial_state = {
        "lead_id": lead_id,
        "name": name,
        "company": company,
        "message": message,
        "history": history,
        "lead_score": lead_score,
        "sentiment": sentiment,
        "conversion_probability": 0.5,
        "churn_risk": "Low",
        "response": "",
        "api_key_configured": False
    }
    
    # Run graph execution
    result = await graph_agent.ainvoke(initial_state)
    return result
