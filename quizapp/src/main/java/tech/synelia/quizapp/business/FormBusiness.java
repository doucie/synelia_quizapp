package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
 * BUSINESS for table "form"
 */
@Log
@Component
public class FormBusiness implements IBasicBusiness<Request<FormDto>, Response<FormDto>> {

	private Response<FormDto> response;
	@Autowired
	private FormRepository formRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private FormVersionRepository formVersionRepository;
	@Autowired
	private FormQuestionsRepository formQuestionsRepository;
	@Autowired
	private QuestionRepository questionRepository;
	@Autowired
	private AnswerRepository answerRepository;
	@Autowired
	private CampaignFormRepository campaignFormRepository;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private TechnicalError technicalError;
	@Autowired
	private ExceptionUtils exceptionUtils;
	@PersistenceContext
	private EntityManager em;

	private SimpleDateFormat dateFormat;
	private SimpleDateFormat dateTimeFormat;

	public FormBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}

	@Override
	@Transactional
	public Response<FormDto> create(Request<FormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin create Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("formName", dto.getFormName());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}
			rejectFilterCampaignIdOnMutation(dto, locale);

			Form entityToSave = FormTransformer.INSTANCE.toEntity(dto);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			if (entityToSave.getIsActive() == null) {
				entityToSave.setIsActive(true);
			}
			applyTimingInheritance(entityToSave);
			validateFormTimingConfiguration(entityToSave, locale);
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Form> itemsSaved = formRepository.saveAll((Iterable<Form>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("form", locale));
			}
			createInitialDraftVersions(itemsSaved, request.getUser());
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHttpCode(HttpStatus.CREATED.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setHasError(false);
		}
		log.info("----end create Form-----");
		return response;
	}

	private void createInitialDraftVersions(List<Form> savedForms, Integer actorUserId) {
		List<FormVersion> initialVersions = new ArrayList<FormVersion>();
		for (Form savedForm : savedForms) {
			if (savedForm == null || savedForm.getId() == null) {
				continue;
			}

			List<FormVersion> existingVersions = formVersionRepository.findByFormId(savedForm.getId(), false);
			if (existingVersions != null && !existingVersions.isEmpty()) {
				continue;
			}

			FormVersion initialVersion = new FormVersion();
			initialVersion.setForm(savedForm);
			initialVersion.setVersionNumber(1);
			initialVersion.setIsPublished(false);
			initialVersion.setIsLocked(false);
			initialVersion.setIsDeleted(false);
			initialVersion.setCreatedAt(Utilities.getCurrentDate());
			initialVersion.setCreatedBy(actorUserId);
			initialVersions.add(initialVersion);
		}

		if (!initialVersions.isEmpty()) {
			formVersionRepository.saveAll(initialVersions);
		}
	}

	private void detachCampaignFormLinks(List<Form> forms, Integer actorUserId) {
		if (forms == null || forms.isEmpty()) {
			return;
		}

		List<CampaignForm> linksToSave = new ArrayList<CampaignForm>();
		Date now = Utilities.getCurrentDate();
		Set<Integer> processedFormIds = new HashSet<Integer>();
		for (Form form : forms) {
			if (form == null || form.getId() == null || !processedFormIds.add(form.getId())) {
				continue;
			}

			List<CampaignForm> existingLinks = campaignFormRepository.findByFormId(form.getId());
			if (existingLinks == null) {
				existingLinks = Collections.emptyList();
			}

			for (CampaignForm existingLink : existingLinks) {
				if (existingLink == null || Boolean.TRUE.equals(existingLink.getIsDeleted())) {
					continue;
				}
				existingLink.setIsDeleted(true);
				existingLink.setUpdatedAt(now);
				existingLink.setUpdatedBy(actorUserId);
				linksToSave.add(existingLink);
			}
		}

		if (!linksToSave.isEmpty()) {
			campaignFormRepository.saveAll(linksToSave);
		}
	}

	private String buildCampaignFormSearchString(Campaigns campaign, Form form) {
		if (campaign == null && form == null) {
			return null;
		}

		List<String> tokens = new ArrayList<String>();
		if (campaign != null) {
			if (campaign.getId() != null) {
				tokens.add(String.valueOf(campaign.getId()));
			}
			if (StringUtils.isNotBlank(campaign.getCampaignTitle())) {
				tokens.add(campaign.getCampaignTitle());
			}
		}
		if (form != null) {
			if (form.getId() != null) {
				tokens.add(String.valueOf(form.getId()));
			}
			if (StringUtils.isNotBlank(form.getFormName())) {
				tokens.add(form.getFormName());
			}
			if (StringUtils.isNotBlank(form.getFormDesc())) {
				tokens.add(form.getFormDesc());
			}
		}
		return tokens.isEmpty() ? null : StringUtils.normalizeSpace(String.join(" ", tokens));
	}

	@Override
	public Response<FormDto> update(Request<FormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin update Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}
			rejectFilterCampaignIdOnMutation(dto, locale);

			Form entityToSave = formRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + dto.getId(), locale));
			}

			rejectEffectiveTimingMutationOnLockedHistory(dto, entityToSave, locale);
			if (Utilities.shouldUpdate(dto.getFormName())) {
				entityToSave.setFormName(dto.getFormName());
			}
			if (Utilities.shouldUpdate(dto.getFormDesc())) {
				entityToSave.setFormDesc(dto.getFormDesc());
			}
			if (dto.getIsActive() != null) {
				entityToSave.setIsActive(dto.getIsActive());
			}
			if (dto.getIsTimed() != null) {
				entityToSave.setIsTimed(dto.getIsTimed());
			}
			applyTimingInheritance(entityToSave);
			validateFormTimingConfiguration(entityToSave, locale);
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Form> itemsSaved = formRepository.saveAll((Iterable<Form>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("form", locale));
			}
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end update Form-----");
		return response;
	}

	@Override
	public Response<FormDto> delete(Request<FormDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Form existingEntity = formRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form -> " + dto.getId(), locale));
			}

			// Check if data is used by formVersion
			List<FormVersion> listOfFormVersion = formVersionRepository.findByFormId(existingEntity.getId(), false);
			if (listOfFormVersion != null && !listOfFormVersion.isEmpty()) {
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfFormVersion.size() + ")", locale));
			}

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			formRepository.saveAll((Iterable<Form>) items);
			detachCampaignFormLinks(items, request.getUser());
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete Form-----");
		return response;
	}

	@Override
	public Response<FormDto> getByCriteria(Request<FormDto> request, Locale locale) throws Exception {
		log.info("----begin get Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = formRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(items) : FormTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(formRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("form", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get Form-----");
		return response;
	}

	public Response<FormDto> getAllByCriteria(Request<FormDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = formRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(items) : FormTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(formRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("form", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL Form-----");
		return response;
	}

	@Transactional(rollbackFor = {RuntimeException.class, Exception.class})
	public Response<FormDto> custom(Request<FormDto> request, Locale locale) throws Exception {
		log.info("----begin custom FormBusiness-----");
		Response<FormDto> response = new Response<FormDto>();

		if (request.getDatas() == null || request.getDatas().isEmpty()) {
			response.setHasError(true);
			response.setStatus(functionalError.DATA_EMPTY("form", locale));
			return response;
		}

		FormDto dto = request.getDatas().get(0);
		if ("syncCampaignLinks".equalsIgnoreCase(StringUtils.trimToEmpty(dto.getAction()))) {
			response = syncCampaignLinks(dto, request.getUser(), locale);
		} else if ("duplicateForCampaign".equalsIgnoreCase(StringUtils.trimToEmpty(dto.getAction()))) {
			response = duplicateForCampaign(dto, request.getUser(), request.getIsSimpleLoading(), locale);
		} else {
			response.setHasError(true);
			response.setStatus(functionalError.DATA_NOT_EXIST("action -> " + dto.getAction(), locale));
		}
		return response;
	}

	private Response<FormDto> duplicateForCampaign(FormDto dto, Integer actorUserId, Boolean isSimpleLoading, Locale locale) throws Exception {
		Integer targetCampaignId = resolveTargetCampaignId(dto);
		Map<String, java.lang.Object> fieldsToVerify = new HashMap<>();
		fieldsToVerify.put("id", dto.getId());
		fieldsToVerify.put("targetCampaignId", targetCampaignId);
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
		}

		Form sourceForm = formRepository.findOne(dto.getId(), false);
		if (sourceForm == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + dto.getId(), locale));
		}

		Campaigns targetCampaign = campaignsRepository.findOne(targetCampaignId, false);
		if (targetCampaign == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + targetCampaignId, locale));
		}

		Form duplicatedForm = buildDuplicatedForm(sourceForm, targetCampaign, dto.getFormName(), actorUserId);
		duplicatedForm = formRepository.save(duplicatedForm);
		createDuplicatedDraftVersion(sourceForm, duplicatedForm, actorUserId);
		synchronizeCampaignFormLinksForCampaign(targetCampaign, Collections.singletonList(duplicatedForm), actorUserId);

		FormDto duplicatedDto = Utilities.isTrue(isSimpleLoading)
				? FormTransformer.INSTANCE.toLiteDto(duplicatedForm)
				: FormTransformer.INSTANCE.toDto(duplicatedForm);
		duplicatedDto = getFullInfos(duplicatedDto, 1, isSimpleLoading, locale);

		Response<FormDto> customResponse = new Response<>();
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		customResponse.setItems(Collections.singletonList(duplicatedDto));
		customResponse.setHasError(false);
		customResponse.setHttpCode(HttpStatus.CREATED.value());
		customResponse.setStatus(status);
		customResponse.setCount(1L);
		return customResponse;
	}

	private Form buildDuplicatedForm(Form sourceForm, Campaigns targetCampaign, String requestedName, Integer actorUserId) throws JsonProcessingException {
		Form duplicatedForm = new Form();
		duplicatedForm.setFormName(buildDuplicatedFormName(sourceForm, targetCampaign, requestedName));
		duplicatedForm.setFormDesc(sourceForm.getFormDesc());
		duplicatedForm.setIsActive(sourceForm.getIsActive() != null ? sourceForm.getIsActive() : true);
		duplicatedForm.setIsTimed(sourceForm.getIsTimed() != null ? sourceForm.getIsTimed() : false);
		duplicatedForm.setIsDeleted(false);
		duplicatedForm.setCreatedAt(Utilities.getCurrentDate());
		duplicatedForm.setCreatedBy(actorUserId);
		duplicatedForm.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(duplicatedForm)));
		return duplicatedForm;
	}

	private String buildDuplicatedFormName(Form sourceForm, Campaigns targetCampaign, String requestedName) {
		if (StringUtils.isNotBlank(requestedName)) {
			return requestedName.trim();
		}

		String baseName = sourceForm != null && StringUtils.isNotBlank(sourceForm.getFormName())
				? sourceForm.getFormName().trim()
				: "Formulaire";
		String campaignName = targetCampaign != null && StringUtils.isNotBlank(targetCampaign.getCampaignTitle())
				? targetCampaign.getCampaignTitle().trim()
				: null;
		return campaignName != null ? baseName + " (copie " + campaignName + ")" : baseName + " (copie)";
	}

	private void createDuplicatedDraftVersion(Form sourceForm, Form duplicatedForm, Integer actorUserId) throws JsonProcessingException {
		FormVersion sourceVersion = resolveSourceVersionForDuplication(sourceForm);
		FormVersion duplicatedVersion = new FormVersion();
		duplicatedVersion.setForm(duplicatedForm);
		duplicatedVersion.setVersionNumber(1);
		duplicatedVersion.setIsPublished(false);
		duplicatedVersion.setIsLocked(false);
		duplicatedVersion.setRandomQuestions(sourceVersion != null && Boolean.TRUE.equals(sourceVersion.getRandomQuestions()));
		duplicatedVersion.setIsDeleted(false);
		duplicatedVersion.setCreatedAt(Utilities.getCurrentDate());
		duplicatedVersion.setCreatedBy(actorUserId);
		duplicatedVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(duplicatedVersion)));
		duplicatedVersion = formVersionRepository.save(duplicatedVersion);

		if (sourceVersion != null) {
			copyFormVersionComposition(sourceVersion, duplicatedVersion, actorUserId);
		}
	}

	private FormVersion resolveSourceVersionForDuplication(Form sourceForm) {
		if (sourceForm == null || sourceForm.getId() == null) {
			return null;
		}

		FormVersion publishedVersion = selectHighestVersion(
				formVersionRepository.findByFormIdAndIsPublished(sourceForm.getId(), true, false));
		if (publishedVersion != null) {
			return publishedVersion;
		}

		return selectHighestVersion(formVersionRepository.findByFormId(sourceForm.getId(), false));
	}

	private FormVersion selectHighestVersion(List<FormVersion> versions) {
		if (versions == null || versions.isEmpty()) {
			return null;
		}

		FormVersion selectedVersion = null;
		for (FormVersion version : versions) {
			if (version == null) {
				continue;
			}

			if (selectedVersion == null) {
				selectedVersion = version;
				continue;
			}

			int selectedNumber = selectedVersion.getVersionNumber() != null ? selectedVersion.getVersionNumber() : 0;
			int candidateNumber = version.getVersionNumber() != null ? version.getVersionNumber() : 0;
			if (candidateNumber > selectedNumber) {
				selectedVersion = version;
				continue;
			}

			if (candidateNumber == selectedNumber) {
				int selectedId = selectedVersion.getId() != null ? selectedVersion.getId() : 0;
				int candidateId = version.getId() != null ? version.getId() : 0;
				if (candidateId > selectedId) {
					selectedVersion = version;
				}
			}
		}

		return selectedVersion;
	}

	private void copyFormVersionComposition(FormVersion sourceVersion, FormVersion duplicatedVersion, Integer actorUserId) throws JsonProcessingException {
		List<FormQuestions> sourceLinks = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(sourceVersion.getId(), false);
		if (sourceLinks == null || sourceLinks.isEmpty()) {
			return;
		}

		List<FormQuestions> duplicatedLinks = new ArrayList<FormQuestions>();
		for (FormQuestions sourceLink : sourceLinks) {
			if (sourceLink == null || sourceLink.getQuestion() == null) {
				continue;
			}

			Question duplicatedQuestion = duplicateQuestionWithAnswers(sourceLink.getQuestion(), actorUserId);
			FormQuestions duplicatedLink = new FormQuestions();
			duplicatedLink.setFormVersion(duplicatedVersion);
			duplicatedLink.setQuestion(duplicatedQuestion);
			duplicatedLink.setQuestionOrder(sourceLink.getQuestionOrder());
			duplicatedLink.setChronoOverride(sourceLink.getChronoOverride());
			duplicatedLink.setIsDeleted(false);
			duplicatedLink.setCreatedAt(Utilities.getCurrentDate());
			duplicatedLink.setCreatedBy(actorUserId);
			duplicatedLink.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(duplicatedLink)));
			duplicatedLinks.add(duplicatedLink);
		}

		if (!duplicatedLinks.isEmpty()) {
			formQuestionsRepository.saveAll(duplicatedLinks);
		}
	}

	private Question duplicateQuestionWithAnswers(Question sourceQuestion, Integer actorUserId) throws JsonProcessingException {
		Question duplicatedQuestion = new Question();
		duplicatedQuestion.setQuestionRef(sourceQuestion.getQuestionRef() != null ? sourceQuestion.getQuestionRef() : java.util.UUID.randomUUID().toString());
		duplicatedQuestion.setQuestionText(sourceQuestion.getQuestionText());
		duplicatedQuestion.setQuestionChrono(sourceQuestion.getQuestionChrono());
		duplicatedQuestion.setQuestionType(sourceQuestion.getQuestionType());
		duplicatedQuestion.setScore(sourceQuestion.getScore());
		duplicatedQuestion.setDifficultyLevel(sourceQuestion.getDifficultyLevel());
		duplicatedQuestion.setSpecialities(sourceQuestion.getSpecialities());
		duplicatedQuestion.setIsDeleted(false);
		duplicatedQuestion.setCreatedAt(Utilities.getCurrentDate());
		duplicatedQuestion.setCreatedBy(actorUserId);
		duplicatedQuestion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(duplicatedQuestion)));
		duplicatedQuestion = questionRepository.save(duplicatedQuestion);

		List<Answer> sourceAnswers = answerRepository.findByQuestionId(sourceQuestion.getId(), false);
		if (sourceAnswers == null || sourceAnswers.isEmpty()) {
			return duplicatedQuestion;
		}

		List<Answer> duplicatedAnswers = new ArrayList<Answer>();
		for (Answer sourceAnswer : sourceAnswers) {
			if (sourceAnswer == null) {
				continue;
			}

			Answer duplicatedAnswer = new Answer();
			duplicatedAnswer.setQuestion(duplicatedQuestion);
			duplicatedAnswer.setAnswerText(sourceAnswer.getAnswerText());
			duplicatedAnswer.setAnswerType(sourceAnswer.getAnswerType());
			duplicatedAnswer.setAllowAdditionalComment(sourceAnswer.getAllowAdditionalComment());
			duplicatedAnswer.setAdditionalCommentRequired(sourceAnswer.getAdditionalCommentRequired());
			duplicatedAnswer.setAdditionalCommentPlaceholder(sourceAnswer.getAdditionalCommentPlaceholder());
			duplicatedAnswer.setAnswerOrder(sourceAnswer.getAnswerOrder());
			duplicatedAnswer.setIsCorrect(sourceAnswer.getIsCorrect());
			duplicatedAnswer.setIsDeleted(false);
			duplicatedAnswer.setCreatedAt(Utilities.getCurrentDate());
			duplicatedAnswer.setCreatedBy(actorUserId);
			duplicatedAnswer.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(duplicatedAnswer)));
			duplicatedAnswers.add(duplicatedAnswer);
		}

		if (!duplicatedAnswers.isEmpty()) {
			answerRepository.saveAll(duplicatedAnswers);
		}

		return duplicatedQuestion;
	}

	private Response<FormDto> syncCampaignLinks(FormDto dto, Integer actorUserId, Locale locale) throws Exception {
		Integer targetCampaignId = resolveTargetCampaignId(dto);
		Map<String, java.lang.Object> fieldsToVerify = new HashMap<>();
		fieldsToVerify.put("targetCampaignId", targetCampaignId);
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
		}

		Campaigns campaign = campaignsRepository.findOne(targetCampaignId, false);
		if (campaign == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + targetCampaignId, locale));
		}

		List<Form> desiredForms = loadDesiredForms(dto.getFormIds(), locale);
		synchronizeCampaignFormLinksForCampaign(campaign, desiredForms, actorUserId);

		Response<FormDto> customResponse = new Response<>();
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		customResponse.setStatus(status);
		customResponse.setHasError(false);
		customResponse.setHttpCode(HttpStatus.OK.value());
		customResponse.setItems(FormTransformer.INSTANCE.toLiteDtos(desiredForms));
		customResponse.setCount((long) desiredForms.size());
		return customResponse;
	}

	private List<Form> loadDesiredForms(List<Integer> rawFormIds, Locale locale) throws Exception {
		List<Integer> desiredFormIds = sanitizeFormIds(rawFormIds);
		List<Form> desiredForms = new ArrayList<>();
		for (Integer formId : desiredFormIds) {
			Form existingForm = formRepository.findOne(formId, false);
			if (existingForm == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + formId, locale));
			}
			desiredForms.add(existingForm);
		}
		return desiredForms;
	}

	private Integer resolveTargetCampaignId(FormDto dto) {
		if (dto == null) {
			return null;
		}
		return dto.getTargetCampaignId();
	}

	private void rejectFilterCampaignIdOnMutation(FormDto dto, Locale locale) {
		if (dto == null || dto.getFilterCampaignId() == null) {
			return;
		}

		throw new InvalidEntityException(
				functionalError.REQUEST_FAIL("filterCampaignId est reserve au filtrage des formulaires", locale));
	}

	private List<Integer> sanitizeFormIds(List<Integer> rawFormIds) {
		if (rawFormIds == null || rawFormIds.isEmpty()) {
			return Collections.emptyList();
		}

		LinkedHashSet<Integer> uniqueFormIds = new LinkedHashSet<>();
		for (Integer formId : rawFormIds) {
			if (formId != null && formId > 0) {
				uniqueFormIds.add(formId);
			}
		}
		return new ArrayList<>(uniqueFormIds);
	}

	private void synchronizeCampaignFormLinksForCampaign(Campaigns campaign, List<Form> desiredForms, Integer actorUserId) {
		if (campaign == null || campaign.getId() == null) {
			return;
		}

		List<CampaignForm> existingLinks = campaignFormRepository.findAllByCampaignId(campaign.getId());
		if (existingLinks == null) {
			existingLinks = Collections.emptyList();
		}

		Map<Integer, CampaignForm> latestLinkByFormId = new LinkedHashMap<>();
		for (CampaignForm existingLink : existingLinks) {
			if (existingLink == null || existingLink.getForm() == null || existingLink.getForm().getId() == null) {
				continue;
			}
			latestLinkByFormId.put(existingLink.getForm().getId(), existingLink);
		}

		Date now = Utilities.getCurrentDate();
		List<CampaignForm> linksToSave = new ArrayList<>();
		Set<Integer> desiredFormIds = new LinkedHashSet<>();
		List<Form> impactedForms = new ArrayList<>();
		if (desiredForms != null) {
			impactedForms.addAll(desiredForms);
		}

		for (int index = 0; index < desiredForms.size(); index++) {
			Form desiredForm = desiredForms.get(index);
			if (desiredForm == null || desiredForm.getId() == null) {
				continue;
			}

			Integer desiredFormId = desiredForm.getId();
			desiredFormIds.add(desiredFormId);
			Integer assignmentOrder = index + 1;
			CampaignForm existingLink = latestLinkByFormId.get(desiredFormId);
			String searchString = buildCampaignFormSearchString(campaign, desiredForm);

			if (existingLink == null) {
				CampaignForm newLink = new CampaignForm();
				newLink.setCampaigns(campaign);
				newLink.setForm(desiredForm);
				newLink.setAssignmentOrder(assignmentOrder);
				newLink.setIsDeleted(false);
				newLink.setCreatedAt(now);
				newLink.setCreatedBy(actorUserId);
				newLink.setSearchString(searchString);
				linksToSave.add(newLink);
				continue;
			}

			boolean shouldSave = false;
			if (existingLink.getCampaigns() == null || !Objects.equals(existingLink.getCampaigns().getId(), campaign.getId())) {
				existingLink.setCampaigns(campaign);
				shouldSave = true;
			}
			if (existingLink.getForm() == null || !Objects.equals(existingLink.getForm().getId(), desiredFormId)) {
				existingLink.setForm(desiredForm);
				shouldSave = true;
			}
			if (Boolean.TRUE.equals(existingLink.getIsDeleted())) {
				existingLink.setIsDeleted(false);
				shouldSave = true;
			}
			if (!Objects.equals(existingLink.getAssignmentOrder(), assignmentOrder)) {
				existingLink.setAssignmentOrder(assignmentOrder);
				shouldSave = true;
			}
			if (!Objects.equals(existingLink.getSearchString(), searchString)) {
				existingLink.setSearchString(searchString);
				shouldSave = true;
			}

			if (shouldSave) {
				existingLink.setUpdatedAt(now);
				existingLink.setUpdatedBy(actorUserId);
				linksToSave.add(existingLink);
			}
		}

		for (CampaignForm existingLink : existingLinks) {
			if (existingLink == null || existingLink.getForm() == null || existingLink.getForm().getId() == null) {
				continue;
			}
			impactedForms.add(existingLink.getForm());
			if (Boolean.TRUE.equals(existingLink.getIsDeleted())) {
				continue;
			}

			Integer existingFormId = existingLink.getForm().getId();
			if (desiredFormIds.contains(existingFormId)) {
				continue;
			}

			existingLink.setIsDeleted(true);
			existingLink.setUpdatedAt(now);
			existingLink.setUpdatedBy(actorUserId);
			linksToSave.add(existingLink);
		}

		if (!linksToSave.isEmpty()) {
			campaignFormRepository.saveAll(linksToSave);
		}
	}

	public Response<FormDto> updateDeleted(Request<FormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}
			rejectFilterCampaignIdOnMutation(dto, locale);

			Form entityToSave = formRepository.findOne(dto.getId(), true);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + dto.getId(), locale));
			}

			rejectEffectiveTimingMutationOnLockedHistory(dto, entityToSave, locale);
			if (Utilities.shouldUpdate(dto.getFormName())) {
				entityToSave.setFormName(dto.getFormName());
			}
			if (Utilities.shouldUpdate(dto.getFormDesc())) {
				entityToSave.setFormDesc(dto.getFormDesc());
			}
			if (dto.getIsActive() != null) {
				entityToSave.setIsActive(dto.getIsActive());
			}
			if (dto.getIsTimed() != null) {
				entityToSave.setIsTimed(dto.getIsTimed());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			applyTimingInheritance(entityToSave);
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted())) {
				validateFormTimingConfiguration(entityToSave, locale);
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Form> itemsSaved = formRepository.saveAll((Iterable<Form>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("form", locale));
			}
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateDeleted Form-----");
		return response;
	}

	public Response<FormDto> updateAll(Request<FormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}
			rejectFilterCampaignIdOnMutation(dto, locale);

			Form entityToSave = formRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				entityToSave = formRepository.findOne(dto.getId(), true);
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + dto.getId(), locale));
			}

			rejectEffectiveTimingMutationOnLockedHistory(dto, entityToSave, locale);
			if (Utilities.shouldUpdate(dto.getFormName())) {
				entityToSave.setFormName(dto.getFormName());
			}
			if (Utilities.shouldUpdate(dto.getFormDesc())) {
				entityToSave.setFormDesc(dto.getFormDesc());
			}
			if (dto.getIsActive() != null) {
				entityToSave.setIsActive(dto.getIsActive());
			}
			if (dto.getIsTimed() != null) {
				entityToSave.setIsTimed(dto.getIsTimed());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			applyTimingInheritance(entityToSave);
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted())) {
				validateFormTimingConfiguration(entityToSave, locale);
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Form> itemsSaved = formRepository.saveAll((Iterable<Form>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("form", locale));
			}
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll Form-----");
		return response;
	}

	public boolean isQuizTimed(Campaigns campaign, Form form) {
		if (campaign != null && Boolean.TRUE.equals(campaign.getTimeAllForms())) {
			return true;
		}
		return isFormEffectivelyTimed(form);
	}

	public Integer calculateTotalTimeAllowed(Campaigns campaign, Form form, List<FormQuestions> formQuestions) {
		if (!isQuizTimed(campaign, form)) {
			return null;
		}

		int totalTimeAllowed = 0;
		if (formQuestions != null) {
			for (FormQuestions formQuestion : formQuestions) {
				if (formQuestion == null || formQuestion.getQuestion() == null || Boolean.TRUE.equals(formQuestion.getQuestion().getIsDeleted())) {
					continue;
				}
				Integer chrono = resolveEffectiveChrono(formQuestion.getQuestion(), formQuestion.getChronoOverride());
				if (chrono != null && chrono > 0) {
					totalTimeAllowed += chrono;
				}
			}
		}

		return totalTimeAllowed;
	}

	public void validateFormVersionTiming(FormVersion formVersion, Locale locale) {
		if (formVersion == null || !isFormEffectivelyTimed(formVersion.getForm())) {
			return;
		}

		List<String> timingErrors = collectTimingErrorsForFormVersion(formVersion);
		if (!timingErrors.isEmpty()) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Chronometrage invalide: " + String.join("; ", timingErrors),
					locale));
		}
	}

	public void validateTimedFormQuestion(FormVersion formVersion, Question question, Integer chronoOverride, Locale locale) {
		if (formVersion == null || !isFormEffectivelyTimed(formVersion.getForm())) {
			return;
		}

		Integer effectiveChrono = resolveEffectiveChrono(question, chronoOverride);
		if (effectiveChrono != null && effectiveChrono > 0) {
			return;
		}

		throw new InvalidEntityException(functionalError.REQUEST_FAIL(
				"Chronometrage invalide: " + buildTimingErrorLabel(formVersion.getForm(), formVersion, question),
				locale));
	}

	public void validateQuestionChronoUsage(Question question, Locale locale) {
		if (question == null || question.getId() == null) {
			return;
		}

		List<String> timingErrors = new ArrayList<String>();
		List<FormQuestions> formQuestionLinks = formQuestionsRepository.findByQuestionId(question.getId(), false);
		if (formQuestionLinks == null || formQuestionLinks.isEmpty()) {
			return;
		}

		for (FormQuestions formQuestion : formQuestionLinks) {
			if (formQuestion == null || formQuestion.getFormVersion() == null) {
				continue;
			}
			FormVersion formVersion = formQuestion.getFormVersion();
			if (!isFormEffectivelyTimed(formVersion.getForm())) {
				continue;
			}
			Integer effectiveChrono = resolveEffectiveChrono(question, formQuestion.getChronoOverride());
			if (effectiveChrono == null || effectiveChrono <= 0) {
				timingErrors.add(buildTimingErrorLabel(formVersion.getForm(), formVersion, question));
			}
		}

		if (!timingErrors.isEmpty()) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Chronometrage invalide: " + String.join("; ", timingErrors),
					locale));
		}
	}

	private void rejectEffectiveTimingMutationOnLockedHistory(FormDto dto, Form entityToSave, Locale locale) {
		if (dto == null || entityToSave == null || entityToSave.getId() == null) {
			return;
		}

		if (!hasLockedFormVersion(entityToSave.getId())) {
			return;
		}

		boolean currentTimed = isFormEffectivelyTimed(entityToSave);
		Campaigns requestedCampaign = resolveSingleActiveCampaign(entityToSave.getId());
		Boolean requestedIsTimed = dto.getIsTimed() != null ? dto.getIsTimed() : entityToSave.getIsTimed();
		boolean requestedTimed = Boolean.TRUE.equals(requestedIsTimed)
				|| (requestedCampaign != null && Boolean.TRUE.equals(requestedCampaign.getTimeAllForms()));

		if (currentTimed == requestedTimed) {
			return;
		}

		throw new InvalidEntityException(functionalError.REQUEST_FAIL(
				"Le chronometrage effectif d'un formulaire deja verrouille ne peut pas etre modifie en place.",
				locale));
	}

	private boolean hasLockedFormVersion(Integer formId) {
		if (formId == null) {
			return false;
		}

		List<FormVersion> formVersions = formVersionRepository.findByFormId(formId, false);
		if (formVersions == null || formVersions.isEmpty()) {
			return false;
		}

		for (FormVersion formVersion : formVersions) {
			if (formVersion != null && Boolean.TRUE.equals(formVersion.getIsLocked())) {
				return true;
			}
		}

		return false;
	}

	private void applyTimingInheritance(Form form) {
		if (form == null) {
			return;
		}

		if (form.getIsTimed() == null) {
			form.setIsTimed(false);
		}
	}

	private void validateFormTimingConfiguration(Form form, Locale locale) {
		if (form == null || !isFormEffectivelyTimed(form)) {
			return;
		}

		List<String> timingErrors = collectTimingErrorsForForm(form);
		if (!timingErrors.isEmpty()) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Chronometrage invalide: " + String.join("; ", timingErrors),
					locale));
		}
	}

	private boolean isFormEffectivelyTimed(Form form) {
		if (form == null) {
			return false;
		}
		if (Boolean.TRUE.equals(form.getIsTimed())) {
			return true;
		}
		Campaigns singleActiveCampaign = resolveSingleActiveCampaign(form.getId());
		return singleActiveCampaign != null && Boolean.TRUE.equals(singleActiveCampaign.getTimeAllForms());
	}

	private Campaigns resolveSingleActiveCampaign(Integer formId) {
		if (formId == null) {
			return null;
		}

		List<CampaignForm> links = campaignFormRepository.findByFormId(formId);
		if (links == null || links.isEmpty()) {
			return null;
		}

		Campaigns resolvedCampaign = null;
		for (CampaignForm link : links) {
			if (link == null
					|| Boolean.TRUE.equals(link.getIsDeleted())
					|| link.getCampaigns() == null
					|| link.getCampaigns().getId() == null
					|| Boolean.TRUE.equals(link.getCampaigns().getIsDeleted())) {
				continue;
			}

			if (resolvedCampaign != null && !Objects.equals(resolvedCampaign.getId(), link.getCampaigns().getId())) {
				return null;
			}

			resolvedCampaign = link.getCampaigns();
		}

		return resolvedCampaign;
	}

	private List<String> collectTimingErrorsForForm(Form form) {
		List<String> timingErrors = new ArrayList<String>();
		if (form == null || form.getId() == null) {
			return timingErrors;
		}

		List<FormVersion> formVersions = formVersionRepository.findByFormId(form.getId(), false);
		if (formVersions == null || formVersions.isEmpty()) {
			return timingErrors;
		}

		for (FormVersion formVersion : formVersions) {
			timingErrors.addAll(collectTimingErrorsForFormVersion(formVersion));
		}
		return timingErrors;
	}

	private List<String> collectTimingErrorsForFormVersion(FormVersion formVersion) {
		List<String> timingErrors = new ArrayList<String>();
		if (formVersion == null || formVersion.getId() == null) {
			return timingErrors;
		}

		List<FormQuestions> formQuestions = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
		if (formQuestions == null || formQuestions.isEmpty()) {
			return timingErrors;
		}

		for (FormQuestions formQuestion : formQuestions) {
			if (formQuestion == null) {
				continue;
			}

			Question question = formQuestion.getQuestion();
			if (question == null || Boolean.TRUE.equals(question.getIsDeleted())) {
				continue;
			}

			Integer effectiveChrono = resolveEffectiveChrono(question, formQuestion.getChronoOverride());
			if (effectiveChrono == null || effectiveChrono <= 0) {
				timingErrors.add(buildTimingErrorLabel(formVersion.getForm(), formVersion, question));
			}
		}

		return timingErrors;
	}

	private Integer resolveEffectiveChrono(Question question, Integer chronoOverride) {
		if (chronoOverride != null) {
			return chronoOverride;
		}
		return question != null ? question.getQuestionChrono() : null;
	}

	private String buildTimingErrorLabel(Form form, FormVersion formVersion, Question question) {
		String formLabel = form != null && StringUtils.isNotBlank(form.getFormName())
				? form.getFormName()
				: "Formulaire sans nom";
		String versionLabel = formVersion != null && formVersion.getVersionNumber() != null
				? "version " + formVersion.getVersionNumber()
				: "version non definie";
		String questionLabel = question != null
				? StringUtils.defaultIfBlank(question.getQuestionRef(), question.getQuestionText())
				: "question inconnue";
		return "formulaire '" + formLabel + "', " + versionLabel + ", question '" + questionLabel + "'";
	}

	private FormDto getFullInfos(FormDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
