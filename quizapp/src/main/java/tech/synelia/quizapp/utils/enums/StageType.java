package tech.synelia.quizapp.utils.enums;

public enum StageType {
    CANDIDATURE("CANDIDATURE"),
    QUIZ("QUIZ"),
    PRESELECTION("PRESELECTION"),
    INTERVIEW("INTERVIEW"),
    TECHNICAL_TEST("TECHNICAL_TEST"),
    EVALUATION("EVALUATION"),
    DECISION("DECISION"),
    CUSTOM("CUSTOM");

    private final String value;

    StageType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static StageType fromValue(String value) {
        for (StageType type : StageType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid stage type: " + value);
    }
}
