package tech.synelia.quizapp.utils.enums;

import java.util.Locale;

/**
 * Type de réponse.
 *
 * Règles :
 * - TEXT  : réponse textuelle classique
 * - IMAGE : réponse représentée par une image
 * - CODE  : réponse représentée par un extrait de code
 */
public enum AnswerType {
    TEXT("TEXT"),
    IMAGE("IMAGE"),
    CODE("CODE");

    private final String value;

    AnswerType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static String normalize(String rawValue) {
        if (rawValue == null) {
            return null;
        }

        String candidate = rawValue.trim();
        if (candidate.isEmpty()) {
            return null;
        }

        String upperValue = candidate.toUpperCase(Locale.ROOT);
        if ("FIXED".equals(upperValue) || "FREE".equals(upperValue)) {
            return TEXT.getValue();
        }

        for (AnswerType answerType : values()) {
            if (answerType.getValue().equals(upperValue)) {
                return answerType.getValue();
            }
        }

        return null;
    }
}
