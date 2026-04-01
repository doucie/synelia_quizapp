package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;
import tech.synelia.quizapp.utils.dto.DependencyInfoDto;
import tech.synelia.quizapp.utils.dto.DependencyInfoDto.DependencyGroup;
import tech.synelia.quizapp.utils.dto.DependencyInfoDto.DeletedParent;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for dashboard aggregated data.
 * Replaces 21+ individual getByCriteria calls with a single endpoint.
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value = "/api/dashboard")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER', 'RECRUITER')")
public class DashboardController {

    private final UserRepository userRepository;
    private final ApplicationsRepository applicationsRepository;
    private final InterviewsRepository interviewsRepository;
    private final EvaluationsRepository evaluationsRepository;
    private final CampaignsRepository campaignsRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final DepartmentsRepository departmentsRepository;
    private final SpecialitiesRepository specialitiesRepository;
    private final SourceTokenRepository sourceTokenRepository;
    private final CampaignCrudRepository campaignCrudRepository;
    private final CandidateAnswerRepository candidateAnswerRepository;
    private final CandidateAskRepository candidateAskRepository;
    private final CandidateInterviewRepository candidateInterviewRepository;
    private final CandidateTokenRepository candidateTokenRepository;
    private final InterviewCrudRepository interviewCrudRepository;
    private final DecisionRepository decisionRepository;
    private final NotificationsRepository notificationsRepository;
    private final FormRepository formRepository;
    private final FormVersionRepository formVersionRepository;
    private final FormQuestionsRepository formQuestionsRepository;
    private final InvitationCodeRepository invitationCodeRepository;

    public DashboardController(
            UserRepository userRepository,
            ApplicationsRepository applicationsRepository,
            InterviewsRepository interviewsRepository,
            EvaluationsRepository evaluationsRepository,
            CampaignsRepository campaignsRepository,
            QuestionRepository questionRepository,
            AnswerRepository answerRepository,
            DepartmentsRepository departmentsRepository,
            SpecialitiesRepository specialitiesRepository,
            SourceTokenRepository sourceTokenRepository,
            CampaignCrudRepository campaignCrudRepository,
            CandidateAnswerRepository candidateAnswerRepository,
            CandidateAskRepository candidateAskRepository,
            CandidateInterviewRepository candidateInterviewRepository,
            CandidateTokenRepository candidateTokenRepository,
            InterviewCrudRepository interviewCrudRepository,
            DecisionRepository decisionRepository,
            NotificationsRepository notificationsRepository,
            FormRepository formRepository,
            FormVersionRepository formVersionRepository,
            FormQuestionsRepository formQuestionsRepository,
            InvitationCodeRepository invitationCodeRepository
    ) {
        this.userRepository = userRepository;
        this.applicationsRepository = applicationsRepository;
        this.interviewsRepository = interviewsRepository;
        this.evaluationsRepository = evaluationsRepository;
        this.campaignsRepository = campaignsRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.departmentsRepository = departmentsRepository;
        this.specialitiesRepository = specialitiesRepository;
        this.sourceTokenRepository = sourceTokenRepository;
        this.campaignCrudRepository = campaignCrudRepository;
        this.candidateAnswerRepository = candidateAnswerRepository;
        this.candidateAskRepository = candidateAskRepository;
        this.candidateInterviewRepository = candidateInterviewRepository;
        this.candidateTokenRepository = candidateTokenRepository;
        this.interviewCrudRepository = interviewCrudRepository;
        this.decisionRepository = decisionRepository;
        this.notificationsRepository = notificationsRepository;
        this.formRepository = formRepository;
        this.formVersionRepository = formVersionRepository;
        this.formQuestionsRepository = formQuestionsRepository;
        this.invitationCodeRepository = invitationCodeRepository;
    }

    /**
     * Returns the count of all entity types in a single request.
     * Keys match the frontend entity names used in entities.ts.
     */
    @GetMapping("/counts")
    public Map<String, Long> getEntityCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("users", userRepository.count());
        counts.put("applications", applicationsRepository.count());
        counts.put("interviews", interviewsRepository.count());
        counts.put("evaluations", evaluationsRepository.count());
        counts.put("campaigns", campaignsRepository.count());
        counts.put("questions", questionRepository.count());
        counts.put("answers", answerRepository.count());
        counts.put("departments", departmentsRepository.count());
        counts.put("specialities", specialitiesRepository.count());
        counts.put("tokens", sourceTokenRepository.count());
        counts.put("campaign-crud", campaignCrudRepository.count());
        counts.put("candidate-answers", candidateAnswerRepository.count());
        counts.put("candidate-ask", candidateAskRepository.count());
        counts.put("candidate-interview", candidateInterviewRepository.count());
        counts.put("candidate-token", candidateTokenRepository.count());
        counts.put("interview-crud", interviewCrudRepository.count());
        counts.put("decisions", decisionRepository.count());
        counts.put("notifications", notificationsRepository.count());
        counts.put("forms", formRepository.count());
        counts.put("form-versions", formVersionRepository.count());
        counts.put("form-questions", formQuestionsRepository.count());
        counts.put("invitation-codes", invitationCodeRepository.count());
        return counts;
    }

    // -----------------------------------------------------------------------
    // CHECK DEPENDENCIES (before delete)
    // -----------------------------------------------------------------------

    @GetMapping("/check-dependencies/{entityType}/{id}")
    public DependencyInfoDto checkDependencies(
            @PathVariable String entityType,
            @PathVariable Integer id) {

        DependencyInfoDto info = new DependencyInfoDto();
        info.setEntityType(entityType);
        info.setEntityId(id);
        List<DependencyGroup> deps = new ArrayList<>();
        boolean hasCritical = false;

        switch (entityType) {
            case "users":
                addDep(deps, "campaigns", "Campagnes (créateur)", campaignsRepository.findByCreatorId(id, false), false);
                addDep(deps, "campaign-crud", "Permissions campagne", campaignCrudRepository.findByUserId(id, false), false);
                addDep(deps, "interview-crud", "Permissions entretien", interviewCrudRepository.findByUserId(id, false), false);
                addDep(deps, "decisions", "Décisions", decisionRepository.findByUserId(id, false), false);
                addDep(deps, "notifications", "Notifications", notificationsRepository.findByUserId(id, false), false);
                break;
            case "departments":
                addDep(deps, "specialities", "Spécialités", specialitiesRepository.findByDepartmentId(id, false), false);
                break;
            case "specialities":
                addDep(deps, "questions", "Questions", questionRepository.findBySpecialityId(id, false), false);
                addDep(deps, "campaigns", "Campagnes", campaignsRepository.findBySpecialityId(id, false), false);
                break;
            case "questions":
                addDep(deps, "answers", "Réponses", answerRepository.findByQuestionId(id, false), false);
                addDep(deps, "form-questions", "Questions de formulaire", formQuestionsRepository.findByQuestionId(id, false), false);
                addDep(deps, "candidate-answers", "Réponses candidat", candidateAnswerRepository.findByQuestionId(id, false), true);
                break;
            case "answers":
                addDep(deps, "candidate-answers", "Réponses candidat", candidateAnswerRepository.findByAnswerId(id, false), true);
                break;
            case "campaigns":
                addDep(deps, "forms", "Formulaires", formRepository.findByCampaignId(id, false), false);
                addDep(deps, "source-tokens", "Tokens source", sourceTokenRepository.findByCampaignId(id, false), false);
                addDep(deps, "campaign-crud", "Permissions campagne", campaignCrudRepository.findByCampaignId(id, false), false);
                addDep(deps, "interviews", "Entretiens", interviewsRepository.findByCampaignId(id, false), false);
                break;
            case "forms":
                addDep(deps, "form-versions", "Versions de formulaire", formVersionRepository.findByFormId(id, false), false);
                break;
            case "form-versions":
                addDep(deps, "form-questions", "Questions de formulaire", formQuestionsRepository.findByFormVersionId(id, false), false);
                addDep(deps, "applications", "Candidatures", applicationsRepository.findByFormVersionId(id, false), true);
                break;
            case "source-tokens":
                addDep(deps, "applications", "Candidatures", applicationsRepository.findBySourceTokenId(id, false), true);
                break;
            case "applications":
                addDep(deps, "candidate-answers", "Réponses candidat", candidateAnswerRepository.findByApplicationId(id, false), true);
                addDep(deps, "candidate-ask", "Questions candidat", candidateAskRepository.findByApplicationId(id, false), true);
                addDep(deps, "candidate-token", "Tokens candidat", candidateTokenRepository.findByApplicationId(id, false), true);
                addDep(deps, "candidate-interview", "Entretiens candidat", candidateInterviewRepository.findByApplicationId(id, false), true);
                addDep(deps, "decisions", "Décisions", decisionRepository.findByApplicationId(id, false), false);
                break;
            case "interviews":
                addDep(deps, "candidate-interview", "Entretiens candidat", candidateInterviewRepository.findByInterviewId(id, false), true);
                addDep(deps, "interview-crud", "Permissions entretien", interviewCrudRepository.findByInterviewId(id, false), false);
                break;
            case "candidate-interview":
                addDep(deps, "evaluations", "Évaluations", evaluationsRepository.findByCandidateInterviewId(id, false), false);
                break;
            default:
                // Entities with no children: evaluations, decisions, notifications, candidate-answers,
                // candidate-ask, candidate-token, form-questions, campaign-crud, interview-crud
                break;
        }

        // Filter out groups with count == 0
        List<DependencyGroup> nonEmpty = new ArrayList<>();
        int total = 0;
        for (DependencyGroup dep : deps) {
            if (dep.getCount() > 0) {
                nonEmpty.add(dep);
                total += dep.getCount();
                if (dep.isCritical()) hasCritical = true;
            }
        }

        info.setDependencies(nonEmpty);
        info.setTotalDependencies(total);
        info.setLevel(total == 0 ? "NORMAL" : (hasCritical ? "CRITICAL" : "WARNING"));
        return info;
    }

    // -----------------------------------------------------------------------
    // CHECK PARENT (before restore)
    // -----------------------------------------------------------------------

    @GetMapping("/check-parent/{entityType}/{id}")
    public DependencyInfoDto checkParent(
            @PathVariable String entityType,
            @PathVariable Integer id) {

        DependencyInfoDto info = new DependencyInfoDto();
        info.setEntityType(entityType);
        info.setEntityId(id);
        info.setLevel("NORMAL");
        List<DeletedParent> deletedParents = new ArrayList<>();

        switch (entityType) {
            case "specialities": {
                Specialities entity = specialitiesRepository.findOne(id, true);
                if (entity != null && entity.getDepartments() != null) {
                    Departments parent = departmentsRepository.findOne(entity.getDepartments().getId(), true);
                    if (parent != null) {
                        deletedParents.add(new DeletedParent("departments", "Département", parent.getId(), parent.getDepartmentName()));
                    }
                }
                break;
            }
            case "questions": {
                Question entity = questionRepository.findOne(id, true);
                if (entity != null && entity.getSpecialities() != null) {
                    Specialities parent = specialitiesRepository.findOne(entity.getSpecialities().getId(), true);
                    if (parent != null) {
                        deletedParents.add(new DeletedParent("specialities", "Spécialité", parent.getId(), parent.getSpecialityName()));
                    }
                }
                break;
            }
            case "answers": {
                Answer entity = answerRepository.findOne(id, true);
                if (entity != null && entity.getQuestion() != null) {
                    Question parent = questionRepository.findOne(entity.getQuestion().getId(), true);
                    if (parent != null) {
                        deletedParents.add(new DeletedParent("questions", "Question", parent.getId(), parent.getQuestionText()));
                    }
                }
                break;
            }
            case "forms": {
                Form entity = formRepository.findOne(id, true);
                if (entity != null && entity.getCampaigns() != null) {
                    Campaigns parent = campaignsRepository.findOne(entity.getCampaigns().getId(), true);
                    if (parent != null) {
                        deletedParents.add(new DeletedParent("campaigns", "Campagne", parent.getId(), parent.getCampaignTitle()));
                    }
                }
                break;
            }
            case "form-versions": {
                FormVersion entity = formVersionRepository.findOne(id, true);
                if (entity != null && entity.getForm() != null) {
                    Form parent = formRepository.findOne(entity.getForm().getId(), true);
                    if (parent != null) {
                        deletedParents.add(new DeletedParent("forms", "Formulaire", parent.getId(), parent.getFormName()));
                    }
                }
                break;
            }
            case "form-questions": {
                FormQuestions entity = formQuestionsRepository.findOne(id, true);
                if (entity != null && entity.getFormVersion() != null) {
                    FormVersion parent = formVersionRepository.findOne(entity.getFormVersion().getId(), true);
                    if (parent != null) {
                        deletedParents.add(new DeletedParent("form-versions", "Version de formulaire", parent.getId(), "v" + parent.getVersionNumber()));
                    }
                }
                break;
            }
            case "source-tokens": {
                SourceToken entity = sourceTokenRepository.findOne(id, true);
                if (entity != null && entity.getCampaigns() != null) {
                    Campaigns parent = campaignsRepository.findOne(entity.getCampaigns().getId(), true);
                    if (parent != null) {
                        deletedParents.add(new DeletedParent("campaigns", "Campagne", parent.getId(), parent.getCampaignTitle()));
                    }
                }
                break;
            }
            case "candidate-interview": {
                CandidateInterview entity = candidateInterviewRepository.findOne(id, true);
                if (entity != null && entity.getInterviews() != null) {
                    Interviews parent = interviewsRepository.findOne(entity.getInterviews().getId(), true);
                    if (parent != null) {
                        deletedParents.add(new DeletedParent("interviews", "Entretien", parent.getId(), "#" + parent.getId()));
                    }
                }
                break;
            }
            default:
                break;
        }

        info.setDeletedParents(deletedParents);
        if (!deletedParents.isEmpty()) {
            info.setLevel("WARNING");
        }
        return info;
    }

    // -----------------------------------------------------------------------
    // HELPER
    // -----------------------------------------------------------------------

    private void addDep(List<DependencyGroup> deps, String entityType, String label, List<?> items, boolean critical) {
        int count = (items != null) ? items.size() : 0;
        deps.add(new DependencyGroup(entityType, label, count, critical));
    }
}
