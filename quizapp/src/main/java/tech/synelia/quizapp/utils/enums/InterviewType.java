package tech.synelia.quizapp.utils.enums;

public enum InterviewType {
    IN_PERSON("IN_PERSON"),
    ONLINE("ONLINE");

    private final String value;

    InterviewType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static InterviewType fromValue(String value) {
        for (InterviewType type : InterviewType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid interview type: " + value);
    }
}