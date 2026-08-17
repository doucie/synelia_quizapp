package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.enums.QuestionType;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

@Log
@Component
public class FormVersionForkService {

    @Autowired
    private FormVersionRepository formVersionRepository;
    @Autowired
    private FormQuestionsRepository formQuestionsRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private AnswerRepository answerRepository;
    @Autowired
    private FormBusiness formBusiness;
    @Autowired
    private FunctionalError functionalError;

    /**
     * Fork a locked form_version:
     * 1. Creates a new form_version (version_number + 1, unlocked, unpublished)
     * 2. Copies all form_questions links to the new version (same questions re-linked)
     * 3. Returns the new form_version (not yet saved to caller — caller must persist metadata if needed)
     */
    public FormVersion createForkedVersion(FormVersion sourceVersion, Integer userId, Locale locale) {
        // 1. Create new form_version
        FormVersion newVersion = new FormVersion();
        newVersion.setForm(sourceVersion.getForm());
        newVersion.setVersionNumber(sourceVersion.getVersionNumber() + 1);
        validateVersionNumberUniqueness(newVersion.getForm(), newVersion.getVersionNumber(), null, locale);
        newVersion.setIsPublished(false);
        newVersion.setIsLocked(false);
        newVersion.setRandomQuestions(sourceVersion.getRandomQuestions());
        newVersion.setIsDeleted(false);
        newVersion.setCreatedAt(Utilities.getCurrentDate());
        newVersion.setCreatedBy(userId);
        newVersion = formVersionRepository.save(newVersion);

        // 2. Copy all form_questions links
        List<FormQuestions> sourceLinks = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(
                sourceVersion.getId(), false);
        if (sourceLinks != null && !sourceLinks.isEmpty()) {
            List<FormQuestions> newLinks = new ArrayList<FormQuestions>();
            for (FormQuestions srcFq : sourceLinks) {
                FormQuestions newFq = new FormQuestions();
                newFq.setFormVersion(newVersion);
                newFq.setQuestion(srcFq.getQuestion());
                newFq.setQuestionOrder(srcFq.getQuestionOrder());
                newFq.setChronoOverride(srcFq.getChronoOverride());
                newFq.setIsDeleted(false);
                newFq.setCreatedAt(Utilities.getCurrentDate());
                newFq.setCreatedBy(userId);
                newLinks.add(newFq);
            }
            formQuestionsRepository.saveAll(newLinks);
        }

        return newVersion;
    }

    /**
     * Publish a form version: unpublish all other versions of the same form, then publish this one.
     * Validates that the version can be published (has questions, valid answers, etc.).
     */
    public void autoPublish(FormVersion formVersion, Integer userId, Locale locale) {
        if (formVersion.getForm() == null || formVersion.getForm().getId() == null) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "La version doit etre rattachee a un formulaire avant publication.", locale));
        }

        validateFormVersionCanBePublished(formVersion, locale);

        List<FormVersion> otherVersions = formVersionRepository.findByFormIdAndIsPublished(
                formVersion.getForm().getId(), true, false);
        for (FormVersion other : otherVersions) {
            if (!Objects.equals(other.getId(), formVersion.getId())) {
                other.setIsPublished(false);
                other.setUpdatedAt(Utilities.getCurrentDate());
                other.setUpdatedBy(userId);
                formVersionRepository.save(other);
            }
        }
        formVersion.setIsPublished(true);
    }

    private void validateVersionNumberUniqueness(Form form, Integer versionNumber, Integer currentId, Locale locale) {
        if (form == null || form.getId() == null || versionNumber == null) {
            return;
        }

        List<FormVersion> conflicts = formVersionRepository.findByFormIdAndVersionNumber(form.getId(), versionNumber);
        if (conflicts == null) {
            return;
        }

        for (FormVersion conflict : conflicts) {
            if (conflict != null && !Objects.equals(conflict.getId(), currentId)) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "Le numero de version " + versionNumber + " existe deja pour ce formulaire.", locale));
            }
        }
    }

    private void validateFormVersionCanBePublished(FormVersion formVersion, Locale locale) {
        if (formVersion == null || formVersion.getId() == null) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "La version doit etre enregistree et completee avant publication.", locale));
        }

        formBusiness.validateFormVersionTiming(formVersion, locale);

        List<FormQuestions> formQuestions = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
        if (formQuestions == null || formQuestions.isEmpty()) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Publication impossible: la version doit contenir au moins une question active.", locale));
        }

        for (FormQuestions formQuestion : formQuestions) {
            Question question = formQuestion.getQuestion();
            if (question == null || Boolean.TRUE.equals(question.getIsDeleted())) {
                continue;
            }

            String questionType = StringUtils.trimToEmpty(question.getQuestionType());
            if (QuestionType.TEXT.getValue().equals(questionType)) {
                continue;
            }

            List<Answer> answers = answerRepository.findByQuestionId(question.getId(), false);
            int correctAnswersCount = 0;
            for (Answer answer : answers) {
                if (answer != null && !Boolean.TRUE.equals(answer.getIsDeleted()) && Boolean.TRUE.equals(answer.getIsCorrect())) {
                    correctAnswersCount++;
                }
            }

            String questionLabel = StringUtils.defaultIfBlank(question.getQuestionRef(), question.getQuestionText());
            if ((QuestionType.SINGLE_CHOICE.getValue().equals(questionType)
                    || QuestionType.TRUE_FALSE.getValue().equals(questionType))
                    && correctAnswersCount != 1) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "Publication impossible: la question '" + questionLabel + "' doit avoir exactement une bonne reponse.", locale));
            }
            if (QuestionType.MULTIPLE_CHOICE.getValue().equals(questionType) && correctAnswersCount < 1) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "Publication impossible: la question '" + questionLabel + "' doit avoir au moins une bonne reponse.", locale));
            }
            if (!QuestionType.SINGLE_CHOICE.getValue().equals(questionType)
                    && !QuestionType.TRUE_FALSE.getValue().equals(questionType)
                    && !QuestionType.MULTIPLE_CHOICE.getValue().equals(questionType)
                    && correctAnswersCount < 1) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "Publication impossible: la question '" + questionLabel + "' n'a pas de bonne reponse exploitable.", locale));
            }
        }
    }
}
