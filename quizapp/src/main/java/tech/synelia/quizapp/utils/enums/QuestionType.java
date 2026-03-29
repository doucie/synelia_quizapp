package tech.synelia.quizapp.utils.enums;

/**
 * Type de question dans un quiz.
 *
 * Règles :
 * - SINGLE_CHOICE  : exactement 1 bonne réponse parmi les réponses
 * - MULTIPLE_CHOICE : 1 ou plusieurs bonnes réponses
 * - TRUE_FALSE      : exactement 2 réponses (Vrai / Faux), 1 correcte
 * - TEXT            : pas de réponse prédéfinie, réponse libre du candidat
 */
public enum QuestionType {
    SINGLE_CHOICE("SINGLE_CHOICE"),
    MULTIPLE_CHOICE("MULTIPLE_CHOICE"),
    TRUE_FALSE("TRUE_FALSE"),
    TEXT("TEXT");

    private final String value;

    QuestionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
