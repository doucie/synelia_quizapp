package tech.synelia.quizapp.utils.enums;

public enum EvaluationStatus {
    DRAFT("DRAFT"),
    SUBMITTED("SUBMITTED"),
    VALIDATED("VALIDATED"),
    CANCELLED("CANCELLED");

    private final String value;

    EvaluationStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static EvaluationStatus fromValue(String value) {
        for (EvaluationStatus status : EvaluationStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid evaluation status: " + value);
    }
}
