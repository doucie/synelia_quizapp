package tech.synelia.quizapp.utils.enums;

/**
 * Enum representing the status of a quiz in an application
 */
public enum QuizStatus {
    /**
     * Quiz has not been started yet (initial state after email verification)
     */
    PENDING("PENDING"),
    
    /**
     * Quiz has been started but not completed
     */
    STARTED("STARTED"),
    
    /**
     * Quiz has been completed
     */
    COMPLETED("COMPLETED");

    private final String value;

    QuizStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    /**
     * Get QuizStatus from string value
     * @param value the string value
     * @return the corresponding QuizStatus
     * @throws IllegalArgumentException if value is invalid
     */
    public static QuizStatus fromValue(String value) {
        for (QuizStatus status : QuizStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid quiz status: " + value);
    }
}
