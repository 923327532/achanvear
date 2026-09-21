from fastapi import WebSocket
import json
from anti_cheat_monitor import AntiCheatMonitor

async def lockdown_editor_ws(websocket: WebSocket, session_id: str):
    """
    Monaco Editor + Anti-IA (no copy-paste)
    """
    monitor = AntiCheatMonitor(session_id)
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "paste_detected":
                result = monitor.report_violation("paste", data["details"])
                await websocket.send_json(result)
                
            elif data["type"] == "tab_change":
                result = monitor.report_violation("tab_change", data["details"])
                if result.get("aborted"):
                    await websocket.close(code=4001, reason="Aborted: too many violations")
                    break
                    
    except Exception:
        pass
