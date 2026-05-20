package tech.synelia.quizapp.utils.enums;

public enum InterviewStatus {
    PENDING("PENDING"),
    SCHEDULED("SCHEDULED"),
    STARTED("STARTED"),
    OVER("OVER"),
    POSTPONED("POSTPONED"),
    ARCHIVED("ARCHIVED");

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