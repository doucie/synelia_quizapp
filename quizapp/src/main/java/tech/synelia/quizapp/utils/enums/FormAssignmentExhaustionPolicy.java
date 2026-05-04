package tech.synelia.quizapp.utils.enums;

public enum FormAssignmentExhaustionPolicy {
    BLOCK("BLOCK"),
    RESET("RESET"),
    LOOP("LOOP");

    private final String value;

    FormAssignmentExhaustionPolicy(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static FormAssignmentExhaustionPolicy fromValue(String value) {
        for (FormAssignmentExhaustionPolicy policy : FormAssignmentExhaustionPolicy.values()) {
            if (policy.value.equalsIgnoreCase(value)) {
                return policy;
            }
        }
        throw new IllegalArgumentException("Invalid form assignment exhaustion policy: " + value);
    }
}