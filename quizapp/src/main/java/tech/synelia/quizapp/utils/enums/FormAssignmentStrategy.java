package tech.synelia.quizapp.utils.enums;

public enum FormAssignmentStrategy {
    RANDOM("RANDOM"),
    RANDOM_NO_REPEAT("RANDOM_NO_REPEAT"),
    SOURCE_TOKEN("SOURCE_TOKEN"),
    SEQUENTIAL("SEQUENTIAL");

    private final String value;

    FormAssignmentStrategy(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static FormAssignmentStrategy fromValue(String value) {
        for (FormAssignmentStrategy strategy : FormAssignmentStrategy.values()) {
            if (strategy.value.equalsIgnoreCase(value)) {
                return strategy;
            }
        }
        throw new IllegalArgumentException("Invalid form assignment strategy: " + value);
    }
}