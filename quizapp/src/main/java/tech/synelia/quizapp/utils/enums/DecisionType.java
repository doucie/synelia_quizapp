package tech.synelia.quizapp.utils.enums;

public enum DecisionType {
    PRE_SCREEN_ACCEPTED("PRE_SCREEN_ACCEPTED", true, true, "SUBMITTED"),
    PRE_SCREEN_REJECTED("PRE_SCREEN_REJECTED", true, false, "SUBMITTED"),
    FINAL_ACCEPTED("FINAL_ACCEPTED", false, true, "PRE_SCREEN_ACCEPTED"),
    FINAL_REJECTED("FINAL_REJECTED", false, false, "PRE_SCREEN_ACCEPTED");

    private final String value;
    private final boolean preScreen;
    private final boolean accepted;
    private final String cancelledFallbackStatus;

    DecisionType(String value, boolean preScreen, boolean accepted, String cancelledFallbackStatus) {
        this.value = value;
        this.preScreen = preScreen;
        this.accepted = accepted;
        this.cancelledFallbackStatus = cancelledFallbackStatus;
    }

    public String getValue() {
        return value;
    }

    public boolean isPreScreen() {
        return preScreen;
    }

    public boolean isFinal() {
        return !preScreen;
    }

    public boolean isAccepted() {
        return accepted;
    }

    public String getPipelineStageType() {
        return preScreen ? "PRESELECTION" : "DECISION";
    }

    public String getCancelledFallbackStatus() {
        return cancelledFallbackStatus;
    }

    public static DecisionType fromValue(String value) {
        for (DecisionType type : DecisionType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid decision type: " + value);
    }
}