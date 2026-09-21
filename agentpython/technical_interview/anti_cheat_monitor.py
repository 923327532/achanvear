from collections import defaultdict
import time

class AntiCheatMonitor:
    MAX_VIOLATIONS = 3
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.violations = defaultdict(list)
        self.start_time = time.time()
    
    def report_violation(self, violation_type: str, details: dict):
        timestamp = time.time()
        self.violations[violation_type].append({
            "timestamp": timestamp,
            "details": details
        })
        
        total_violations = sum(len(v) for v in self.violations.values())
        
        if total_violations > self.MAX_VIOLATIONS:
            return {"aborted": True, "reason": "MAX_VIOLATIONS", "total": total_violations}
        
        return {"warning": True, "total": total_violations, "type": violation_type}
    
    def get_report(self):
        duration = time.time() - self.start_time
        return {
            "session_id": self.session_id,
            "total_violations": sum(len(v) for v in self.violations.values()),
            "violations_by_type": dict(self.violations),
            "session_duration": duration,
            "aborted": sum(len(v) for v in self.violations.values()) > self.MAX_VIOLATIONS
        }
    
