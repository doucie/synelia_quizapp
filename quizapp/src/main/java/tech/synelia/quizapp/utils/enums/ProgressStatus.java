package tech.synelia.quizapp.utils.enums;

public enum ProgressStatus {
    PENDING("PENDING"),
    IN_PROGRESS("IN_PROGRESS"),
    PASSED("PASSED"),
    FAILED("FAILED"),
    SKIPPED("SKIPPED");

    private final String value;

    ProgressStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ProgressStatus fromValue(String value) {
        for (ProgressStatus status : ProgressStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid progress status: " + value);
    }
}
