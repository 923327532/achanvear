package achanvear.peru.hiring.domain.model;

import java.util.UUID;

public class HiringProcessId {
    private final String value;

    private HiringProcessId(String value) {
        this.value = value;
    }

    public static HiringProcessId newId() {
        return new HiringProcessId(UUID.randomUUID().toString());
    }

    public static HiringProcessId of(String value) {
        return new HiringProcessId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HiringProcessId that = (HiringProcessId) o;
        return value.equals(that.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }
}
