from datetime import datetime, timedelta

@app.post("/schedule-interview/{session_id}")
async def schedule_interview(session_id: str, preferred_slot: int):  # 0,1,2
    slots = [
        datetime.now() + timedelta(hours=2),   # 10am
        datetime.now() + timedelta(hours=6),   # 2pm  
        datetime.now() + timedelta(hours=10)   # 6pm
    ]
    
    scheduled_time = slots[preferred_slot]
    
    # Guarda en Redis
    await redis_client.setex(f"schedule:{session_id}", 86400, scheduled_time.isoformat())
    
    return {"scheduled_for": scheduled_time.isoformat()}