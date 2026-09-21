package achanvear.peru.interview.domain.service;

import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class InterviewSlotManager {

    private static final int MAX_CONCURRENT_INTERVIEWS = 10;
    private final AtomicInteger activeSlots = new AtomicInteger(0);
    private final Set<String> occupiedSlots = ConcurrentHashMap.newKeySet();

    public Optional<Integer> acquireSlot(String interviewId) {
        if (activeSlots.get() >= MAX_CONCURRENT_INTERVIEWS) {
            return Optional.empty();
        }

        if (occupiedSlots.add(interviewId)) {
            return Optional.of(activeSlots.incrementAndGet());
        }
        
        return Optional.empty();
    }

    public void releaseSlot(String interviewId) {
        if (occupiedSlots.remove(interviewId)) {
            activeSlots.decrementAndGet();
        }
    }

    public int availableSlots() {
        return MAX_CONCURRENT_INTERVIEWS - activeSlots.get();
    }

    public boolean isSlotAvailable(String interviewId) {
        return !occupiedSlots.contains(interviewId);
    }
}
