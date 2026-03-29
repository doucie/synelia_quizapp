package tech.synelia.quizapp.utils.enums;

/**
 * Type de réponse.
 *
 * Règles :
 * - FIXED : réponse prédéfinie (choix à cocher), utilisée avec SINGLE_CHOICE / MULTIPLE_CHOICE / TRUE_FALSE
 * - FREE  : réponse libre saisie par le candidat, utilisée avec TEXT
 */
public enum AnswerType {
    FIXED("FIXED"),
    FREE("FREE");

    private final String value;

    AnswerType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
