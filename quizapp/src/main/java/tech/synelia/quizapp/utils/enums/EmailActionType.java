package tech.synelia.quizapp.utils.enums;

/**
 * Types d'action email reconnus par le système.
 * Chaque valeur porte son actionType (name()) et le templateKey associé.
 * Source de vérité unique entre le backend et le frontend.
 */
public enum EmailActionType {

    APPLICATION_VERIFICATION("application_verification"),
    PASSWORD_RESET("password_reset"),
    INVITATION_CODE("invitation_code"),
    CANDIDATE_ASK_RESULT("candidate_ask_result"),
    PRE_SCREEN_DECISION("pre_screen_decision"),
    FINAL_DECISION("final_decision"),
    INTERVIEW_INVITE("interview_convocation"),
    QUIZ_INVITE("quiz_invitation"),
    WELCOME("welcome_email");

    private final String templateKey;

    EmailActionType(String templateKey) {
        this.templateKey = templateKey;
    }

    public String getTemplateKey() {
        return templateKey;
    }
}
