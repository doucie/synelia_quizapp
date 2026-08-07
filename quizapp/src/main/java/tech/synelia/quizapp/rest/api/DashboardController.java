package tech.synelia.quizapp.rest.api;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.OptionalDouble;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.Answer;
import tech.synelia.quizapp.dao.entity.ApplicationQuizAttempt;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Decision;
import tech.synelia.quizapp.dao.entity.Evaluations;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.CandidateInterview;
import tech.synelia.quizapp.dao.entity.Departments;
import tech.synelia.quizapp.dao.entity.EntityPermission;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.FormQuestions;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.Question;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.entity.Specialities;
import tech.synelia.quizapp.dao.repository.AnswerRepository;
import tech.synelia.quizapp.dao.repository.ApplicationQuizAttemptRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.CandidateAnswerRepository;
import tech.synelia.quizapp.dao.repository.CandidateAskRepository;
import tech.synelia.quizapp.dao.repository.CandidateInterviewRepository;
import tech.synelia.quizapp.dao.repository.CandidateTokenRepository;
import tech.synelia.quizapp.dao.repository.DecisionRepository;
import tech.synelia.quizapp.dao.repository.DepartmentsRepository;
import tech.synelia.quizapp.dao.repository.EntityPermissionRepository;
import tech.synelia.quizapp.dao.repository.EvaluationsRepository;
import tech.synelia.quizapp.dao.repository.FormQuestionsRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;
import tech.synelia.quizapp.dao.repository.FormVersionRepository;
import tech.synelia.quizapp.dao.repository.InterviewParticipantRepository;
import tech.synelia.quizapp.dao.repository.InterviewsRepository;
import tech.synelia.quizapp.dao.repository.InvitationCodeRepository;
import tech.synelia.quizapp.dao.repository.NotificationsRepository;
import tech.synelia.quizapp.dao.repository.QuestionRepository;
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;
import tech.synelia.quizapp.dao.repository.SpecialitiesRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.dto.DependencyInfoDto;
import tech.synelia.quizapp.utils.dto.DependencyInfoDto.DeletedParent;
import tech.synelia.quizapp.utils.dto.DependencyInfoDto.DependencyGroup;

/**
 * Controller for dashboard aggregated data.
 * Replaces 21+ individual getByCriteria calls with a single endpoint.
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value = "/api/dashboard")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'RECRUITER')")
public class DashboardController {

    private final UserRepository userRepository;
    private final ApplicationsRepository applicationsRepository;
    private final ApplicationQuizAttemptRepository applicationQuizAttemptRepository;
    private final InterviewsRepository interviewsRepository;
    private final EvaluationsRepository evaluationsRepository;
    private final CampaignsRepository campaignsRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final DepartmentsRepository departmentsRepository;
    private final SpecialitiesRepository specialitiesRepository;
    private final SourceTokenRepository sourceTokenRepository;
    private final EntityPermissionRepository entityPermissionRepository;
    private final CandidateAnswerRepository candidateAnswerRepository;
    private final CandidateAskRepository candidateAskRepository;
    private final CandidateInterviewRepository candidateInterviewRepository;
    private final CandidateTokenRepository candidateTokenRepository;
    private final InterviewParticipantRepository interviewParticipantRepository;
    private final DecisionRepository decisionRepository;
    private final NotificationsRepository notificationsRepository;
    private final CampaignFormRepository campaignFormRepository;
    private final FormRepository formRepository;
    private final FormVersionRepository formVersionRepository;
    private final FormQuestionsRepository formQuestionsRepository;
    private final InvitationCodeRepository invitationCodeRepository;

    public DashboardController(
            UserRepository userRepository,
            ApplicationsRepository applicationsRepository,
            ApplicationQuizAttemptRepository applicationQuizAttemptRepository,
            InterviewsRepository interviewsRepository,
            EvaluationsRepository evaluationsRepository,
            CampaignsRepository campaignsRepository,
            QuestionRepository questionRepository,
            AnswerRepository answerRepository,
            DepartmentsRepository departmentsRepository,
            SpecialitiesRepository specialitiesRepository,
            SourceTokenRepository sourceTokenRepository,
            EntityPermissionRepository entityPermissionRepository,
            CandidateAnswerRepository candidateAnswerRepository,
            CandidateAskRepository candidateAskRepository,
            CandidateInterviewRepository candidateInterviewRepository,
            CandidateTokenRepository candidateTokenRepository,
            InterviewParticipantRepository interviewParticipantRepository,
            DecisionRepository decisionRepository,
            NotificationsRepository notificationsRepository,
            CampaignFormRepository campaignFormRepository,
            FormRepository formRepository,
            FormVersionRepository formVersionRepository,
            FormQuestionsRepository formQuestionsRepository,
            InvitationCodeRepository invitationCodeRepository
    ) {
        this.userRepository = userRepository;
        this.applicationsRepository = applicationsRepository;
        this.applicationQuizAttemptRepository = applicationQuizAttemptRepository;
        this.interviewsRepository = interviewsRepository;
        this.evaluationsRepository = evaluationsRepository;
        this.campaignsRepository = campaignsRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.departmentsRepository = departmentsRepository;
        this.specialitiesRepository = specialitiesRepository;
        this.sourceTokenRepository = sourceTokenRepository;
        this.entityPermissionRepository = entityPermissionRepository;
        this.candidateAnswerRepository = candidateAnswerRepository;
        this.candidateAskRepository = candidateAskRepository;
        this.candidateInterviewRepository = candidateInterviewRepository;
        this.candidateTokenRepository = candidateTokenRepository;
        this.interviewParticipantRepository = interviewParticipantRepository;
        this.decisionRepository = decisionRepository;
        this.notificationsRepository = notificationsRepository;
        this.campaignFormRepository = campaignFormRepository;
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
        counts.put("entity-permissions", entityPermissionRepository.count());
        counts.put("candidate-answers", candidateAnswerRepository.count());
        counts.put("candidate-ask", candidateAskRepository.count());
        counts.put("candidate-interview", candidateInterviewRepository.count());
        counts.put("candidate-token", candidateTokenRepository.count());
        counts.put("interview-participant", interviewParticipantRepository.count());
        counts.put("decisions", decisionRepository.count());
        counts.put("notifications", notificationsRepository.count());
        counts.put("forms", formRepository.count());
        counts.put("form-versions", formVersionRepository.count());
        counts.put("form-questions", formQuestionsRepository.count());
        counts.put("invitation-codes", invitationCodeRepository.count());
        return counts;
    }

    // -----------------------------------------------------------------------
    // OVERVIEW STATS (aggregated charts for /dashboard/overview)
    // -----------------------------------------------------------------------

    @GetMapping("/overview-stats")
    public Map<String, Object> getOverviewStats() {
        Map<String, Object> result = new LinkedHashMap<>();

        List<Applications> apps = applicationsRepository.findAll().stream()
                .filter(a -> !Boolean.TRUE.equals(a.getIsDeleted()))
                .collect(Collectors.toList());
        List<Interviews> interviews = interviewsRepository.findAll().stream()
                .filter(i -> !Boolean.TRUE.equals(i.getIsDeleted()))
                .collect(Collectors.toList());
        List<Evaluations> evaluations = evaluationsRepository.findAll().stream()
                .filter(e -> !Boolean.TRUE.equals(e.getIsDeleted()))
                .collect(Collectors.toList());
        List<Decision> decisions = decisionRepository.findAll().stream()
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .collect(Collectors.toList());

        // -- KPIs with month-over-month delta --
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.DAY_OF_MONTH, 1);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startOfMonth = cal.getTime();
        cal.add(Calendar.MONTH, -1);
        Date startOfPrevMonth = cal.getTime();

        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("applications", buildKpi(apps, Applications::getCreatedAt, startOfPrevMonth, startOfMonth));
        kpis.put("interviews", buildKpi(interviews, Interviews::getCreatedAt, startOfPrevMonth, startOfMonth));
        kpis.put("evaluations", buildKpi(evaluations, Evaluations::getCreatedAt, startOfPrevMonth, startOfMonth));
        kpis.put("decisions", buildKpi(decisions, Decision::getCreatedAt, startOfPrevMonth, startOfMonth));
        result.put("kpis", kpis);

        // -- Status distribution (derived from runtime mirrors) --
        Map<String, Long> statusDist = apps.stream()
                .collect(Collectors.groupingBy(
                        this::resolveStatusDistributionKey,
                        LinkedHashMap::new,
                        Collectors.counting()));
        result.put("statusDistribution", toEntryList(statusDist));

        // -- Quiz status distribution (latest non-deleted attempt per application) --
        Map<Integer, ApplicationQuizAttempt> latestQuizAttemptByApp = applicationQuizAttemptRepository.findAll().stream()
                .filter(a -> !Boolean.TRUE.equals(a.getIsDeleted())
                        && a.getApplications() != null
                        && a.getApplications().getId() != null)
                .collect(Collectors.toMap(
                        a -> a.getApplications().getId(),
                        Function.identity(),
                        (a, b) -> a.getId() > b.getId() ? a : b,
                        LinkedHashMap::new));
        Map<String, Long> quizDist = apps.stream()
                .map(a -> latestQuizAttemptByApp.get(a.getId()))
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        a -> a.getQuizStatus() != null ? a.getQuizStatus() : "UNKNOWN",
                        LinkedHashMap::new,
                        Collectors.counting()));
        result.put("quizDistribution", toEntryList(quizDist));

        // -- 30-day trend on applications --
        Calendar today = Calendar.getInstance();
        today.set(Calendar.HOUR_OF_DAY, 0);
        today.set(Calendar.MINUTE, 0);
        today.set(Calendar.SECOND, 0);
        today.set(Calendar.MILLISECOND, 0);
        SimpleDateFormat keyFmt = new SimpleDateFormat("yyyy-MM-dd");
        Map<String, Long> trendMap = new LinkedHashMap<>();
        Calendar trendCal = (Calendar) today.clone();
        trendCal.add(Calendar.DAY_OF_YEAR, -29);
        Date trendStart = trendCal.getTime();
        for (int i = 0; i < 30; i++) {
            trendMap.put(keyFmt.format(trendCal.getTime()), 0L);
            trendCal.add(Calendar.DAY_OF_YEAR, 1);
        }
        apps.stream()
                .filter(a -> a.getCreatedAt() != null && !a.getCreatedAt().before(trendStart))
                .forEach(a -> {
                    String key = keyFmt.format(a.getCreatedAt());
                    trendMap.computeIfPresent(key, (k, v) -> v + 1);
                });
        List<Map<String, Object>> trend = trendMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> p = new LinkedHashMap<>();
                    p.put("date", e.getKey());
                    p.put("count", e.getValue());
                    return p;
                })
                .collect(Collectors.toList());
        result.put("applicationsTrend", trend);

        // -- Decisions breakdown (excluding cancelled) --
        Map<String, Long> decDist = decisions.stream()
                .filter(d -> !"CANCEL".equals(d.getDecisionMode()))
                .collect(Collectors.groupingBy(
                        d -> d.getDecisionType() != null ? d.getDecisionType() : "UNKNOWN",
                        LinkedHashMap::new,
                        Collectors.counting()));
        result.put("decisionsBreakdown", toEntryList(decDist));

        // -- Conversion funnel (derived from runtime mirrors) --
        long submitted = apps.size();
        long preselected = apps.stream().filter(a -> isAnyStatus(a.getCurrentFinalDecisionType(), "FINAL_AC")
                || isAnyStatus(a.getCurrentPreselectionDecisionType(), "PRE_SCREEN")
                || isAnyStatus(a.getCurrentPipelineStageType(), "INTERVIEW", "EVALUATION", "DECISION")).count();
        long interviewed = apps.stream().filter(a -> isAnyStatus(a.getCurrentFinalDecisionType(), "FINAL_AC")
                || isAnyStatus(a.getCurrentPipelineStageType(), "INTERVIEW", "EVALUATION")).count();
        long decided = apps.stream().filter(a -> isAnyStatus(a.getCurrentFinalDecisionType(), "FINAL_AC")).count();
        long accepted = apps.stream().filter(a -> isAnyStatus(a.getCurrentFinalDecisionType(), "FINAL_AC")).count();
        Map<String, Long> funnel = new LinkedHashMap<>();
        funnel.put("submitted", submitted);
        funnel.put("preselected", preselected);
        funnel.put("interviewed", interviewed);
        funnel.put("decided", decided);
        funnel.put("accepted", accepted);
        result.put("conversionFunnel", funnel);

        // -- Top campaigns by applications count --
        Map<String, Long> campaignCount = apps.stream()
                .filter(a -> a.getSourceToken() != null && a.getSourceToken().getCampaigns() != null)
                .collect(Collectors.groupingBy(
                        a -> {
                            String t = a.getSourceToken().getCampaigns().getCampaignTitle();
                            return (t != null && !t.isBlank()) ? t : "(sans titre)";
                        },
                        Collectors.counting()));
        List<Map<String, Object>> topCampaigns = campaignCount.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("title", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
        result.put("topCampaigns", topCampaigns);

        // -- Average quiz score (completed only, aggregated score) --
        OptionalDouble avg = apps.stream()
                .filter(a -> a.getAggregatedQuizScorePercent() != null
                        && isCompletedAttempt(latestQuizAttemptByApp.get(a.getId())))
                .mapToDouble(Applications::getAggregatedQuizScorePercent)
                .average();
        long quizCompleted = apps.stream()
                .map(a -> latestQuizAttemptByApp.get(a.getId()))
                .filter(Objects::nonNull)
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getQuizStatus()))
                .count();
        result.put("avgQuizScorePercent", avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : null);
        result.put("quizCompletedCount", quizCompleted);

        // -- Quiz score buckets (for completed quizzes) --
        int[] buckets = new int[5]; // 0-20, 20-40, 40-60, 60-80, 80-100
        apps.stream()
                .filter(a -> a.getAggregatedQuizScorePercent() != null
                        && isCompletedAttempt(latestQuizAttemptByApp.get(a.getId())))
                .forEach(a -> {
                    int score = a.getAggregatedQuizScorePercent().intValue();
                    int idx = Math.min(4, Math.max(0, score / 20));
                    buckets[idx]++;
                });
        String[] bucketLabels = { "0-20%", "20-40%", "40-60%", "60-80%", "80-100%" };
        List<Map<String, Object>> scoreBuckets = new ArrayList<>();
        for (int i = 0; i < buckets.length; i++) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("key", bucketLabels[i]);
            m.put("count", (long) buckets[i]);
            scoreBuckets.add(m);
        }
        result.put("quizScoreBuckets", scoreBuckets);

        return result;
    }

    private <T> Map<String, Object> buildKpi(List<T> items, Function<T, Date> getCreatedAt,
                                              Date startOfPrevMonth, Date startOfMonth) {
        long total = items.size();
        long current = items.stream().filter(i -> {
            Date d = getCreatedAt.apply(i);
            return d != null && !d.before(startOfMonth);
        }).count();
        long previous = items.stream().filter(i -> {
            Date d = getCreatedAt.apply(i);
            return d != null && !d.before(startOfPrevMonth) && d.before(startOfMonth);
        }).count();
        Double delta;
        if (previous > 0) {
            delta = ((double) (current - previous)) / previous * 100.0;
            delta = Math.round(delta * 10.0) / 10.0;
        } else if (current > 0) {
            delta = null; // signal "new" (no previous baseline)
        } else {
            delta = 0.0;
        }
        Map<String, Object> kpi = new LinkedHashMap<>();
        kpi.put("total", total);
        kpi.put("currentMonth", current);
        kpi.put("previousMonth", previous);
        kpi.put("deltaPercent", delta);
        return kpi;
    }

    private List<Map<String, Object>> toEntryList(Map<String, Long> map) {
        return map.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("key", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
    }

    private boolean isCompletedAttempt(ApplicationQuizAttempt attempt) {
        return attempt != null && "COMPLETED".equalsIgnoreCase(attempt.getQuizStatus());
    }

    private boolean isAnyStatus(String status, String... prefixes) {
        if (status == null) return false;
        for (String p : prefixes) {
            if (status.startsWith(p)) return true;
        }
        return false;
    }

    private String resolveStatusDistributionKey(Applications app) {
        if (app == null) {
            return "UNKNOWN";
        }
        String finalType = trimUpper(app.getCurrentFinalDecisionType());
        if (finalType.length() > 0) {
            return finalType;
        }
        String preType = trimUpper(app.getCurrentPreselectionDecisionType());
        if (preType.length() > 0) {
            return preType;
        }
        String stageType = trimUpper(app.getCurrentPipelineStageType());
        if ("INTERVIEW".equals(stageType) || "EVALUATION".equals(stageType)) {
            return "INTERVIEWING";
        }
        String progress = trimUpper(app.getCurrentPipelineProgressStatus());
        if (progress.length() == 0 || "PENDING".equals(progress)) {
            return "PENDING";
        }
        return "SUBMITTED";
    }

    private String trimUpper(String value) {
        return value != null ? value.trim().toUpperCase() : "";
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
                addDep(deps, "entity-permissions", "Permissions campagne", getActiveCampaignPermissionsForUser(id), false);
                addDep(deps, "interview-participant", "Permissions entretien", interviewParticipantRepository.findByUserId(id, false), false);
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
                addDep(deps, "forms", "Formulaires", campaignFormRepository.findActiveFormsByCampaignId(id), false);
                addDep(deps, "source-tokens", "Tokens source", sourceTokenRepository.findByCampaignId(id, false), false);
                addDep(deps, "entity-permissions", "Permissions campagne", getActiveCampaignPermissionsForCampaign(id), false);
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
                addDep(deps, "candidate-answers", "Réponses candidat", candidateAnswerRepository.findByApplicationQuizAttemptApplicationsId(id, false), true);
                addDep(deps, "candidate-ask", "Questions candidat", candidateAskRepository.findByApplicationId(id, false), true);
                addDep(deps, "candidate-token", "Tokens candidat", candidateTokenRepository.findByApplicationId(id, false), true);
                addDep(deps, "candidate-interview", "Entretiens candidat", candidateInterviewRepository.findByApplicationId(id, false), true);
                addDep(deps, "decisions", "Décisions", decisionRepository.findByApplicationId(id, false), false);
                break;
            case "interviews":
                addDep(deps, "candidate-interview", "Entretiens candidat", candidateInterviewRepository.findByInterviewId(id, false), true);
                addDep(deps, "interview-participant", "Permissions entretien", interviewParticipantRepository.findByInterviewId(id, false), false);
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
                if (entity != null) {
                    Map<Integer, DeletedParent> deletedCampaignParents = new LinkedHashMap<>();
                    for (CampaignForm link : campaignFormRepository.findByFormId(id)) {
                        if (link.getCampaigns() == null) {
                            continue;
                        }

                        Campaigns parent = campaignsRepository.findOne(link.getCampaigns().getId(), true);
                        if (parent != null) {
                            deletedCampaignParents.putIfAbsent(
                                    parent.getId(),
                                    new DeletedParent("campaigns", "Campagne", parent.getId(), parent.getCampaignTitle()));
                        }
                    }
                    deletedParents.addAll(deletedCampaignParents.values());
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

    private List<EntityPermission> getActiveCampaignPermissionsForUser(Integer userId) {
        return filterActiveCampaignPermissions(entityPermissionRepository.findByUserId(userId));
    }

    private List<EntityPermission> getActiveCampaignPermissionsForCampaign(Integer campaignId) {
        return filterActiveCampaignPermissions(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", campaignId));
    }

    private List<EntityPermission> filterActiveCampaignPermissions(List<EntityPermission> permissions) {
        List<EntityPermission> activePermissions = new ArrayList<>();
        if (permissions == null) {
            return activePermissions;
        }

        for (EntityPermission permission : permissions) {
            if (permission == null) {
                continue;
            }
            if (!"CAMPAIGN".equalsIgnoreCase(permission.getEntityType())) {
                continue;
            }
            if (Boolean.TRUE.equals(permission.getIsDeleted())) {
                continue;
            }
            activePermissions.add(permission);
        }

        return activePermissions;
    }
}
