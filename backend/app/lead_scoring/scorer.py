import re
from typing import Dict, Any

def analyze_message_and_score(message: str, current_score: int = 50, current_sentiment: str = "Neutral") -> Dict[str, Any]:
    text = message.lower()
    
    # 1. Classify Sentiment based on keyword heuristic
    sentiment = current_sentiment
    
    frustrated_keywords = ["terrible", "cancel", "fail", "crashed", "crashes", "worst", "unacceptable", "refund", "frustrated", "bad", "hate"]
    urgent_keywords = ["urgent", "immediately", "asap", "invoice", "payment", "buy", "onboarding", "onboard", "now"]
    excited_keywords = ["excited", "perfect", "great", "love", "awesome", "perfectly", "happy", "interested", "yes"]
    hesitant_keywords = ["expensive", "cost", "budget", "price", "pricing", "discount", "cheap", "compare", "trial"]
    
    if any(kw in text for kw in frustrated_keywords):
        sentiment = "Frustrated"
    elif any(kw in text for kw in urgent_keywords):
        sentiment = "Urgent"
    elif any(kw in text for kw in excited_keywords):
        sentiment = "Excited"
    elif any(kw in text for kw in hesitant_keywords):
        sentiment = "Hesitant"
    else:
        # If the message is substantial, we could update or default to Neutral, but let's keep it Neutral if no clear match
        if len(text.strip()) > 0:
            sentiment = "Neutral"

    # 2. Adjust Lead Score dynamically
    score_change = 0
    
    # SSO/SAML/Security triggers (+10)
    sso_keywords = ["sso", "saml", "security", "auth", "login", "compliance", "secure"]
    if any(kw in text for kw in sso_keywords):
        score_change += 10
        
    # Buy/Onboarding/Invoice triggers (+15)
    buy_keywords = ["buy", "onboard", "invoice", "payment", "checkout", "subscribe", "purchase"]
    if any(kw in text for kw in buy_keywords):
        score_change += 15
        
    # Demo/Meeting/Call triggers (+8)
    demo_keywords = ["demo", "meeting", "call", "schedule", "zoom", "calendar", "meet", "book"]
    if any(kw in text for kw in demo_keywords):
        score_change += 8
        
    # Expensive/Cost/Budget triggers (-5)
    cost_keywords = ["expensive", "cost", "budget", "price", "pricing", "discount", "cheap"]
    if any(kw in text for kw in cost_keywords):
        score_change -= 5
        
    # Cancel/Frustrated/Terrible triggers (-15)
    cancel_keywords = ["cancel", "frustrated", "terrible", "crash", "crashed", "worst", "refund", "stop"]
    if any(kw in text for kw in cancel_keywords):
        score_change -= 15

    new_score = current_score + score_change
    new_score = max(0, min(100, new_score))

    # 3. Calculate Conversion Probability
    # Conversion probability average base = score / 100
    base_prob = new_score / 100.0
    
    # Multipliers:
    # Urgent: 1.15
    # Excited: 1.10
    # Hesitant: 0.85
    # Frustrated: 0.50
    # Neutral/other: 1.00
    multiplier = 1.00
    if sentiment == "Urgent":
        multiplier = 1.15
    elif sentiment == "Excited":
        multiplier = 1.10
    elif sentiment == "Hesitant":
        multiplier = 0.85
    elif sentiment == "Frustrated":
        multiplier = 0.50
        
    conversion_prob = base_prob * multiplier
    conversion_prob = max(0.05, min(0.99, conversion_prob))
    # Round to two decimal places
    conversion_prob = round(conversion_prob, 2)

    # 4. Churn Risk Profiler
    # High: set if sentiment is Frustrated
    # Medium: if lead score < 40, or sentiment is Hesitant
    # Low: standard
    if sentiment == "Frustrated":
        churn_risk = "High"
    elif new_score < 40 or sentiment == "Hesitant":
        churn_risk = "Medium"
    else:
        churn_risk = "Low"

    return {
        "sentiment": sentiment,
        "lead_score": new_score,
        "conversion_probability": conversion_prob,
        "churn_risk": churn_risk
    }
