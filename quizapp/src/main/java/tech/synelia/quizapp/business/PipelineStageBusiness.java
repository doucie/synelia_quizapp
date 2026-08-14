package tech.synelia.quizapp.business;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageRepository;
import tech.synelia.quizapp.dao.repository.PipelineTemplateRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.Validate;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.PipelineStageDto;
import tech.synelia.quizapp.utils.dto.transformer.PipelineStageTransformer;
import tech.synelia.quizapp.utils.enums.StageType;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InternalErrorException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Log
@Component
public class PipelineStageBusiness implements IBasicBusiness<Request<PipelineStageDto>, Response<PipelineStageDto>> {

    @Autowired
    private PipelineStageRepository pipelineStageRepository;
    @Autowired
    private PipelineTemplateRepository pipelineTemplateRepository;
    @Autowired
    private ApplicationProgressRepository applicationProgressRepository;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private TechnicalError technicalError;
    @Autowired
    private ExceptionUtils exceptionUtils;
    @PersistenceContext
    private EntityManager em;

    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageDto> create(Request<PipelineStageDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create PipelineStage-----");
        List<PipelineStage> result = new ArrayList<>();

        for (PipelineStageDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("stageType", dto.getStageType());
            fieldsToVerify.put("stageLabel", dto.getStageLabel());
            fieldsToVerify.put("pipelineTemplateId", dto.getPipelineTemplateId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineTemplate template = pipelineTemplateRepository.findOne(dto.getPipelineTemplateId(), false);
            if (template == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template id -> " + dto.getPipelineTemplateId(), locale));
            }

            String normalizedStageType = normalizeStageType(dto.getStageType(), locale);
            validateFixedStageCreation(normalizedStageType, locale);
            dto.setStageType(normalizedStageType);
            dto.setConfigJson(validateAndNormalizeConfig(normalizedStageType, dto.getConfigJson(), locale));

            List<PipelineStage> actives = pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(template.getId());
            if (dto.getStageOrder() == null) {
                dto.setStageOrder((actives != null ? actives.size() : 0) + 1);
            }

            List<PipelineStageDto> targets = new ArrayList<>();
            boolean inserted = false;
            for (PipelineStage active : actives) {
                if (!inserted && active.getStageOrder() != null && active.getStageOrder() >= dto.getStageOrder()) {
                    targets.add(dto);
                    inserted = true;
                }
                targets.add(toTargetDto(active));
            }
            if (!inserted) {
                targets.add(dto);
            }

            result = applyTargetConfig(template, targets, request.getUser(), locale);
        }

        return buildResponse(result, locale);
    }

    @Override
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageDto> update(Request<PipelineStageDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update PipelineStage-----");
        List<PipelineStage> result = new ArrayList<>();

        for (PipelineStageDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineStage existing = pipelineStageRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage id -> " + dto.getId(), locale));
            }
            PipelineTemplate template = existing.getPipelineTemplate();
            if (template == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template -> " + dto.getId(), locale));
            }

            String requestedStageType = Utilities.notBlank(dto.getStageType())
                    ? dto.getStageType()
                    : existing.getStageType();
            String nextStageType = normalizeStageType(requestedStageType, locale);

            // Les bornes CANDIDATURE/DECISION sont fixes : impossible de les re-typer
            // ou d'en créer via un update direct d'API
            if (isFixedBoundaryStageType(nextStageType) != isFixedBoundaryStageType(existing.getStageType())) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                        "Les etapes CANDIDATURE et DECISION sont des bornes fixes : leur type ne peut pas etre modifie ni reassigne",
                        locale));
            }

            List<PipelineStage> actives = pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(template.getId());
            boolean found = false;
            for (PipelineStage active : actives) {
                if (active.getId().equals(existing.getId())) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                        "Cette etape est une ancienne revision (historique) : elle ne peut pas etre modifiee",
                        locale));
            }

            // Bornes : la position doit rester tête/queue (via l'ordre fourni)
            if (dto.getStageOrder() != null && isFixedBoundaryStageType(nextStageType)) {
                int position = indexOfStage(actives, existing.getId()) + 1;
                if (!dto.getStageOrder().equals(position)) {
                    String message = StageType.CANDIDATURE.getValue().equals(nextStageType)
                            ? "L'etape CANDIDATURE doit rester en tete du pipeline (stageOrder 1)"
                            : "L'etape DECISION doit rester en queue du pipeline (apres le stageOrder " + actives.size() + ")";
                    throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(message, locale));
                }
            }

            List<PipelineStageDto> targets = new ArrayList<>();
            for (PipelineStage active : actives) {
                PipelineStageDto target = toTargetDto(active);
                if (active.getId().equals(existing.getId())) {
                    applyDtoChanges(target, dto, locale);
                }
                targets.add(target);
            }

            result = applyTargetConfig(template, targets, request.getUser(), locale);
        }

        return buildResponse(result, locale);
    }

    @Override
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageDto> delete(Request<PipelineStageDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete PipelineStage-----");
        List<PipelineStage> result = new ArrayList<>();

        for (PipelineStageDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineStage existing = pipelineStageRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage -> " + dto.getId(), locale));
            }

            if (isFixedBoundaryStageType(existing.getStageType())) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                        "Les etapes CANDIDATURE et DECISION sont gerees automatiquement et ne peuvent pas etre supprimees",
                        locale));
            }

            PipelineTemplate template = existing.getPipelineTemplate();
            if (template == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template -> " + dto.getId(), locale));
            }

            List<PipelineStage> actives = pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(template.getId());
            List<PipelineStageDto> targets = new ArrayList<>();
            boolean found = false;
            for (PipelineStage active : actives) {
                if (active.getId().equals(existing.getId())) {
                    found = true;
                    continue;
                }
                targets.add(toTargetDto(active));
            }
            if (!found) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                        "Cette etape est une ancienne revision (historique) : elle ne peut pas etre supprimee",
                        locale));
            }

            result = applyTargetConfig(template, targets, request.getUser(), locale);
        }

        return buildResponse(result, locale);
    }

    @Override
    public Response<PipelineStageDto> getByCriteria(Request<PipelineStageDto> request, Locale locale) throws Exception {
        log.info("----begin get PipelineStage-----");
        normalizeStageCriteria(request, locale);
        Response<PipelineStageDto> response = new Response<>();
        List<PipelineStage> items = pipelineStageRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<PipelineStageDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? PipelineStageTransformer.INSTANCE.toLiteDtos(items)
                    : enrichIsLocked(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(pipelineStageRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("pipeline_stage", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get PipelineStage-----");
        return response;
    }

    // --- Méthodes métier spécifiques ---

    /**
     * Réordonner les étapes actives d'un template (le diff du moteur réactive les
     * révisions dans leur nouvel ordre).
     */
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageDto> reorderStages(Integer templateId, List<Integer> orderedStageIds, Integer userId, Locale locale) throws ParseException {
        log.info("----begin reorderStages PipelineStage-----");

        PipelineTemplate template = pipelineTemplateRepository.findOne(templateId, false);
        if (template == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template id -> " + templateId, locale));
        }

        List<PipelineStage> actives = pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(templateId);
        if (orderedStageIds == null || orderedStageIds.size() != actives.size()) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Le reordonnancement doit inclure toutes les etapes actives du pipeline",
                    locale));
        }

        Map<Integer, PipelineStage> activeById = new HashMap<>();
        for (PipelineStage s : actives) {
            activeById.put(s.getId(), s);
        }

        List<PipelineStageDto> targets = new ArrayList<>();
        for (Integer id : orderedStageIds) {
            PipelineStage s = activeById.get(id);
            if (s == null) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "Le reordonnancement contient une etape qui n'appartient pas a ce pipeline",
                        locale));
            }
            targets.add(toTargetDto(s));
        }

        if (!StageType.CANDIDATURE.getValue().equals(targets.get(0).getStageType())
                || !StageType.DECISION.getValue().equals(targets.get(targets.size() - 1).getStageType())) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Le pipeline doit conserver CANDIDATURE en premiere position et DECISION en derniere position",
                    locale));
        }

        List<PipelineStage> result = applyTargetConfig(template, targets, userId, locale);
        return buildResponse(result, locale);
    }

    /**
     * Enregistrement de la configuration cible du pipeline (versionnage fin) :
     * le front n'envoie que la liste ordonnée des étapes actives.
     */
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageDto> saveTemplateStages(Integer templateId, List<PipelineStageDto> stages, Integer userId, Locale locale) throws ParseException {
        log.info("----begin saveTemplateStages PipelineStage-----");

        PipelineTemplate template = pipelineTemplateRepository.findOne(templateId, false);
        if (template == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template id -> " + templateId, locale));
        }
        if (stages == null || stages.isEmpty()) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "La configuration cible ne peut pas etre vide (CANDIDATURE et DECISION doivent etre conservees)",
                    locale));
        }

        List<PipelineStage> result = applyTargetConfig(template, stages, userId, locale);
        return buildResponse(result, locale);
    }

    /**
     * Liste ordonnée des étapes actives d'un template (avec verrou dérivé par étape).
     */
    public Response<PipelineStageDto> getStagesForTemplate(Integer templateId, Boolean isSimpleLoading, Locale locale) throws ParseException {
        log.info("----begin getStagesForTemplate PipelineStage-----");
        Response<PipelineStageDto> response = new Response<>();

        List<PipelineStage> stages = pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(templateId);

        if (stages != null && !stages.isEmpty()) {
            List<PipelineStageDto> itemsDto = (Utilities.isTrue(isSimpleLoading))
                    ? PipelineStageTransformer.INSTANCE.toLiteDtos(stages)
                    : enrichIsLocked(stages);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount((long) stages.size());
        } else {
            response.setStatus(functionalError.DATA_EMPTY("pipeline_stage", locale));
            response.setHasError(false);
        }

        log.info("----end getStagesForTemplate PipelineStage-----");
        return response;
    }

    // --- Moteur de diff (versionnage fin des étapes, 440 Lot B) ---

    /**
     * Applique la configuration cible au template :
     * - park de toutes les révisions actives (is_active=false, active_slot -> NULL) ;
     * - pour chaque slot cible : réactivation de la révision existante (inchangée),
     *   modification sur place (étape libre), ou réactivation d'une révision inactive
     *   identique / création d'une nouvelle révision (étape verrouillée ou ajout) ;
     * - slot retiré : soft-delete si étape libre, désactivation (historique) si verrouillée.
     */
    private List<PipelineStage> applyTargetConfig(PipelineTemplate template, List<PipelineStageDto> targets, Integer userId, Locale locale) throws ParseException {
        Integer templateId = template.getId();
        List<PipelineStage> actives = pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(templateId);
        List<PipelineStage> inactiveRevisions = pipelineStageRepository.findInactiveRevisions(templateId);

        // Normalisation + validation de la config cible
        for (PipelineStageDto target : targets) {
            normalizeTarget(target, locale);
        }
        validateTargetStages(targets, locale);

        // Verrous dérivés : étapes réellement atteintes (usage non-PENDING)
        Set<Integer> usedStageIds = new HashSet<>();
        if (!actives.isEmpty()) {
            List<Integer> ids = new ArrayList<>();
            for (PipelineStage s : actives) {
                ids.add(s.getId());
            }
            usedStageIds.addAll(applicationProgressRepository.findUsedStageIds(ids));
        }

        Map<Integer, PipelineStage> activeById = new HashMap<>();
        for (PipelineStage s : actives) {
            activeById.put(s.getId(), s);
        }

        // La grille d'évaluation voyage avec la révision (Lot D) : si elle n'est pas
        // fournie pour une étape existante, on conserve la valeur courante.
        for (PipelineStageDto target : targets) {
            if (target.getId() != null && target.getEvaluationGridTemplateVersionId() == null) {
                PipelineStage current = activeById.get(target.getId());
                if (current != null) {
                    target.setEvaluationGridTemplateVersionId(current.getEvaluationGridTemplateVersionId());
                }
            }
        }

        List<PipelineStage> result = new ArrayList<>(actives);
        result.addAll(inactiveRevisions);

        Date now = Utilities.getCurrentDate();

        // 1. Park : toutes les révisions actives passent inactives (active_slot -> NULL)
        for (PipelineStage s : actives) {
            s.setIsActive(false);
            s.setUpdatedAt(now);
            s.setUpdatedBy(userId);
        }
        pipelineStageRepository.saveAll(actives);
        pipelineStageRepository.flush();

        // 2. Réactivation / modification / création par slot
        Set<Integer> referencedTargetIds = new HashSet<>();
        for (PipelineStageDto target : targets) {
            if (target.getId() != null) {
                referencedTargetIds.add(target.getId());
            }
        }

        int slot = 1;
        for (PipelineStageDto target : targets) {
            PipelineStage current = target.getId() != null ? activeById.get(target.getId()) : null;

            if (current == null) {
                // Nouvelle étape ou remplacement d'une étape verrouillée déplacée
                reactivateOrCreate(template, target, slot, inactiveRevisions, result, userId, now);
            } else if (usedStageIds.contains(current.getId()) && isConfigChanged(current, target, slot)) {
                // Étape verrouillée et modifiée/déplacée : l'actuelle reste en historique,
                // on active une révision inactive identique ou on en crée une nouvelle au slot
                reactivateOrCreate(template, target, slot, inactiveRevisions, result, userId, now);
            } else if (isConfigChanged(current, target, slot)) {
                // Étape libre : modification sur place
                applyChanges(current, target, slot, userId, now);
                current.setIsActive(true);
            } else {
                // Slot inchangé : on réactive telle quelle
                current.setIsActive(true);
                current.setStageOrder(slot);
                current.setUpdatedAt(now);
                current.setUpdatedBy(userId);
            }
            slot++;
        }

        // 3. Actives restantes non référencées -> retirées
        for (PipelineStage s : actives) {
            if (s.getId() != null && referencedTargetIds.contains(s.getId())) {
                continue;
            }
            if (!usedStageIds.contains(s.getId())) {
                s.setIsDeleted(true);
            }
            // verrouillée : reste is_active=false en historique
        }

        List<PipelineStage> saved = pipelineStageRepository.saveAll(result);
        return extractActives(saved);
    }

    private void validateTargetStages(List<PipelineStageDto> targets, Locale locale) {
        if (targets == null || targets.isEmpty()) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "La configuration cible ne peut pas etre vide (CANDIDATURE et DECISION doivent etre conservees)",
                    locale));
        }

        int candidatureCount = 0;
        int decisionCount = 0;
        int intermediateCount = 0;

        for (PipelineStageDto target : targets) {
            if (!Utilities.notBlank(target.getStageLabel())) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY("stageLabel", locale));
            }
            if (isFixedBoundaryStageType(target.getStageType())) {
                if (target.getId() == null) {
                    throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                            "Les etapes CANDIDATURE et DECISION sont gerees automatiquement et ne peuvent pas etre ajoutees manuellement",
                            locale));
                }
                if (StageType.CANDIDATURE.getValue().equals(target.getStageType())) {
                    candidatureCount++;
                } else {
                    decisionCount++;
                }
            } else {
                intermediateCount++;
            }
        }

        if (candidatureCount != 1) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "CANDIDATURE doit etre presente une seule fois", locale));
        }
        if (decisionCount < 1) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "ajoutez au minimum une etape DECISION", locale));
        }
        if (intermediateCount < 1) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "ajoutez au moins une etape intermediaire entre CANDIDATURE et DECISION", locale));
        }

        if (!StageType.CANDIDATURE.getValue().equals(targets.get(0).getStageType())) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "CANDIDATURE doit rester en premiere position", locale));
        }
        if (!StageType.DECISION.getValue().equals(targets.get(targets.size() - 1).getStageType())) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "DECISION doit rester en derniere position", locale));
        }
    }

    private void normalizeTarget(PipelineStageDto target, Locale locale) {
        String stageType = normalizeStageType(target.getStageType(), locale);
        target.setStageType(stageType);
        target.setConfigJson(validateAndNormalizeConfig(stageType, target.getConfigJson(), locale));
        if (target.getIsRequired() == null) target.setIsRequired(true);
        if (target.getIsEliminatory() == null) target.setIsEliminatory(false);
        if (isFixedBoundaryStageType(stageType)) {
            target.setIsRequired(true);
            target.setIsEliminatory(false);
        }
        if (StageType.PRESELECTION.getValue().equals(stageType)) {
            target.setIsEliminatory(true);
        }
    }

    private void reactivateOrCreate(PipelineTemplate template, PipelineStageDto target, int slot,
            List<PipelineStage> inactiveRevisions, List<PipelineStage> result, Integer userId, Date now) {
        PipelineStage identical = findIdenticalInactiveRevision(inactiveRevisions, target, slot);
        if (identical != null) {
            identical.setIsActive(true);
            identical.setStageOrder(slot);
            identical.setUpdatedAt(now);
            identical.setUpdatedBy(userId);
            return;
        }

        PipelineStage created = new PipelineStage();
        created.setPipelineTemplate(template);
        created.setStageType(target.getStageType());
        created.setStageLabel(target.getStageLabel());
        created.setStageOrder(slot);
        created.setIsRequired(target.getIsRequired());
        created.setIsEliminatory(target.getIsEliminatory());
        created.setConfigJson(target.getConfigJson());
        created.setEvaluationGridTemplateVersionId(target.getEvaluationGridTemplateVersionId());
        created.setIsActive(true);
        created.setIsDeleted(false);
        created.setCreatedAt(now);
        created.setCreatedBy(userId);
        created.setUpdatedAt(now);
        created.setUpdatedBy(userId);
        result.add(created);
    }

    private PipelineStage findIdenticalInactiveRevision(List<PipelineStage> inactiveRevisions, PipelineStageDto target, int slot) {
        int preferredIdx = -1;
        int fallbackIdx = -1;
        for (int i = 0; i < inactiveRevisions.size(); i++) {
            PipelineStage rev = inactiveRevisions.get(i);
            if (!isIdenticalConfig(rev, target)) {
                continue;
            }
            if (rev.getStageOrder() != null && rev.getStageOrder() == slot) {
                preferredIdx = i;
                break;
            }
            if (fallbackIdx == -1) {
                fallbackIdx = i;
            }
        }
        int idx = preferredIdx != -1 ? preferredIdx : fallbackIdx;
        if (idx == -1) {
            return null;
        }
        PipelineStage match = inactiveRevisions.get(idx);
        inactiveRevisions.remove(idx);
        return match;
    }

    private boolean isIdenticalConfig(PipelineStage rev, PipelineStageDto target) {
        return Objects.equals(rev.getStageType(), target.getStageType())
                && Objects.equals(rev.getStageLabel(), target.getStageLabel())
                && Objects.equals(rev.getIsRequired(), target.getIsRequired())
                && Objects.equals(rev.getIsEliminatory(), target.getIsEliminatory())
                && Objects.equals(rev.getConfigJson(), target.getConfigJson())
                && Objects.equals(rev.getEvaluationGridTemplateVersionId(), target.getEvaluationGridTemplateVersionId());
    }

    private boolean isConfigChanged(PipelineStage current, PipelineStageDto target, int slot) {
        return !Objects.equals(current.getStageOrder(), slot)
                || !Objects.equals(current.getStageType(), target.getStageType())
                || !Objects.equals(current.getStageLabel(), target.getStageLabel())
                || !Objects.equals(current.getIsRequired(), target.getIsRequired())
                || !Objects.equals(current.getIsEliminatory(), target.getIsEliminatory())
                || !Objects.equals(current.getConfigJson(), target.getConfigJson())
                || !Objects.equals(current.getEvaluationGridTemplateVersionId(), target.getEvaluationGridTemplateVersionId());
    }

    private void applyChanges(PipelineStage stage, PipelineStageDto target, int slot, Integer userId, Date now) {
        stage.setStageType(target.getStageType());
        stage.setStageLabel(target.getStageLabel());
        stage.setStageOrder(slot);
        stage.setIsRequired(target.getIsRequired());
        stage.setIsEliminatory(target.getIsEliminatory());
        stage.setConfigJson(target.getConfigJson());
        stage.setEvaluationGridTemplateVersionId(target.getEvaluationGridTemplateVersionId());
        stage.setUpdatedAt(now);
        stage.setUpdatedBy(userId);
    }

    private void applyDtoChanges(PipelineStageDto target, PipelineStageDto dto, Locale locale) {
        if (Utilities.notBlank(dto.getStageType())) {
            target.setStageType(normalizeStageType(dto.getStageType(), locale));
        }
        if (Utilities.shouldUpdate(dto.getStageLabel())) {
            target.setStageLabel(dto.getStageLabel());
        }
        if (dto.getStageOrder() != null) {
            target.setStageOrder(dto.getStageOrder());
        }
        if (dto.getIsRequired() != null) {
            target.setIsRequired(dto.getIsRequired());
        }
        if (dto.getIsEliminatory() != null) {
            target.setIsEliminatory(dto.getIsEliminatory());
        }
        if (Utilities.shouldUpdate(dto.getConfigJson())) {
            target.setConfigJson(dto.getConfigJson());
        }
        if (dto.getEvaluationGridTemplateVersionId() != null) {
            target.setEvaluationGridTemplateVersionId(dto.getEvaluationGridTemplateVersionId());
        }
    }

    private List<PipelineStage> extractActives(List<PipelineStage> stages) {
        List<PipelineStage> actives = new ArrayList<>();
        for (PipelineStage s : stages) {
            if (Boolean.TRUE.equals(s.getIsActive()) && !Boolean.TRUE.equals(s.getIsDeleted())) {
                actives.add(s);
            }
        }
        actives.sort(Comparator.comparing(PipelineStage::getStageOrder));
        return actives;
    }

    private List<PipelineStageDto> enrichIsLocked(List<PipelineStage> stages) throws ParseException {
        List<PipelineStageDto> dtos = PipelineStageTransformer.INSTANCE.toDtos(stages);
        Set<Integer> used = new HashSet<>();
        if (stages != null && !stages.isEmpty()) {
            List<Integer> ids = new ArrayList<>();
            for (PipelineStage s : stages) {
                ids.add(s.getId());
            }
            used.addAll(applicationProgressRepository.findUsedStageIds(ids));
        }
        for (PipelineStageDto dto : dtos) {
            dto.setIsLocked(dto.getId() != null && used.contains(dto.getId()));
        }
        return dtos;
    }

    private Response<PipelineStageDto> buildResponse(List<PipelineStage> stages, Locale locale) throws ParseException {
        Response<PipelineStageDto> response = new Response<>();
        List<PipelineStageDto> itemsDto = enrichIsLocked(stages);
        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(itemsDto);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);
        response.setCount((long) stages.size());
        return response;
    }

    private PipelineStageDto toTargetDto(PipelineStage stage) {
        PipelineStageDto dto = new PipelineStageDto();
        dto.setId(stage.getId());
        dto.setStageType(stage.getStageType());
        dto.setStageLabel(stage.getStageLabel());
        dto.setStageOrder(stage.getStageOrder());
        dto.setIsRequired(stage.getIsRequired());
        dto.setIsEliminatory(stage.getIsEliminatory());
        dto.setConfigJson(stage.getConfigJson());
        dto.setEvaluationGridTemplateVersionId(stage.getEvaluationGridTemplateVersionId());
        return dto;
    }

    private int indexOfStage(List<PipelineStage> stages, Integer id) {
        for (int i = 0; i < stages.size(); i++) {
            if (stages.get(i).getId().equals(id)) {
                return i;
            }
        }
        return -1;
    }

    private String normalizeStageType(String stageType, Locale locale) {
        if (!Utilities.notBlank(stageType)) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("stageType", locale));
        }

        try {
            StageType normalizedType = StageType.fromValue(stageType);
            return normalizedType.getValue();
        } catch (IllegalArgumentException exception) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Type d'etape invalide: " + stageType,
                    locale));
        }
    }

    private void validateFixedStageCreation(String stageType, Locale locale) {
        if (isFixedBoundaryStageType(stageType)) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Les etapes CANDIDATURE et DECISION sont creees automatiquement et ne peuvent pas etre ajoutees manuellement",
                    locale));
        }
    }

    private boolean isFixedBoundaryStageType(String stageType) {
        return StageType.CANDIDATURE.getValue().equals(stageType)
                || StageType.DECISION.getValue().equals(stageType);
    }

    private String validateAndNormalizeConfig(String stageType, String configJson, Locale locale) {
        JsonNode config = null;

        if (configJson != null) {
            try {
                config = objectMapper.readTree(configJson);
            } catch (Exception exception) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json invalide: JSON mal forme",
                        locale));
            }

            if (config == null || !config.isObject()) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json invalide: un objet JSON est attendu",
                        locale));
            }

            validateCommonConfig(config, locale);
        }

        if (config == null) {
            return null;
        }

        if (isFixedBoundaryStageType(stageType) && config instanceof ObjectNode objectConfig) {
            objectConfig.remove("allowSkip");
        }

        try {
            return objectMapper.writeValueAsString(config);
        } catch (JsonProcessingException exception) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "config_json invalide: impossible de normaliser la configuration",
                    locale));
        }
    }

    private void normalizeStageCriteria(Request<PipelineStageDto> request, Locale locale) {
        PipelineStageDto dto = request != null ? request.getData() : null;
        if (dto == null || !Utilities.notBlank(dto.getStageType())) {
            return;
        }

        dto.setStageType(normalizeStageType(dto.getStageType(), locale));
    }

    private void validateCommonConfig(JsonNode config, Locale locale) {
        if (config.has("allowSkip") && !config.get("allowSkip").isBoolean()) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "config_json.allowSkip doit etre un booleen",
                    locale));
        }

        if (config.has("passingScore")) {
            JsonNode passingScore = config.get("passingScore");
            if (!passingScore.isNumber()) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json.passingScore doit etre un nombre",
                        locale));
            }
            double value = passingScore.asDouble();
            if (value < 0d || value > 100d) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json.passingScore doit etre compris entre 0 et 100",
                        locale));
            }
        }

        if (config.has("inactivityTimeoutMinutes")) {
            JsonNode inactivityTimeout = config.get("inactivityTimeoutMinutes");
            if (!inactivityTimeout.isNumber()) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json.inactivityTimeoutMinutes doit etre un nombre",
                        locale));
            }

            int value = inactivityTimeout.asInt();
            if (value < 0 || value > 1440) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json.inactivityTimeoutMinutes doit etre compris entre 0 et 1440",
                        locale));
            }
        }
    }
}
