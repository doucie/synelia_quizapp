package tech.synelia.quizapp.utils.enums;

public enum DecisionMode {
    STANDARD("STANDARD"),
    CANCEL("CANCEL"),
    OVERRIDE("OVERRIDE"),
    ROLLBACK("ROLLBACK");

    private final String value;

    DecisionMode(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static DecisionMode fromValue(String value) {
        for (DecisionMode mode : DecisionMode.values()) {
            if (mode.value.equalsIgnoreCase(value)) {
                return mode;
            }
        }
        throw new IllegalArgumentException("Invalid decision mode: " + value);
    }
}
