package tech.synelia.quizapp.utils.enums;

public enum InterviewStatus {
    SCHEDULED("SCHEDULED"),
    IN_PROGRESS("IN_PROGRESS"),
    AWAITING_EVALUATION("AWAITING_EVALUATION"),
    AWAITING_VALIDATION("AWAITING_VALIDATION"),
    CLOSED("CLOSED"),
    CANCELLED("CANCELLED");

    private final String value;

    InterviewStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static InterviewStatus fromValue(String value) {
        for (InterviewStatus status : InterviewStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid interview status: " + value);
    }
}
