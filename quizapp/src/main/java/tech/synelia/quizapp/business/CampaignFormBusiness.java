package tech.synelia.quizapp.business;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;
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
import tech.synelia.quizapp.utils.dto.CampaignFormDto;
import tech.synelia.quizapp.utils.dto.transformer.CampaignFormTransformer;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InternalErrorException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Log
@Component
public class CampaignFormBusiness implements IBasicBusiness<Request<CampaignFormDto>, Response<CampaignFormDto>> {

	@Autowired
	private CampaignFormRepository campaignFormRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private FormRepository formRepository;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private TechnicalError technicalError;
	@Autowired
	private ExceptionUtils exceptionUtils;
	@PersistenceContext
	private EntityManager em;

	private final SimpleDateFormat dateFormat;
	private final SimpleDateFormat dateTimeFormat;

	public CampaignFormBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}

	@Override
	@Transactional
	public Response<CampaignFormDto> create(Request<CampaignFormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin create CampaignForm-----");
		Response<CampaignFormDto> response = new Response<CampaignFormDto>();
		List<CampaignForm> items = new ArrayList<CampaignForm>();
		Map<Integer, Campaigns> campaignById = loadCampaigns(resolveCampaignIds(request.getDatas()), locale);
		Map<Integer, Form> formById = loadForms(resolveFormIds(request.getDatas()), locale);
		Map<Integer, List<CampaignForm>> activeLinksByCampaignId = loadActiveLinksByCampaignIds(campaignById.keySet());

		for (CampaignFormDto dto : request.getDatas()) {
			validateRequiredFields(dto, locale, true);
			Campaigns campaign = campaignById.get(dto.getCampaignId());
			Form form = formById.get(dto.getFormId());
			validateActiveDuplicate(activeLinksByCampaignId, dto.getCampaignId(), dto.getFormId(), null, locale);

			CampaignForm entityToSave = CampaignFormTransformer.INSTANCE.toEntity(dto, campaign, form);
			entityToSave.setAssignmentOrder(resolveAssignmentOrder(dto.getAssignmentOrder(), activeLinksByCampaignId.get(dto.getCampaignId())));
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			entityToSave.setSearchString(buildSearchString(campaign, form));
			items.add(entityToSave);

			activeLinksByCampaignId.computeIfAbsent(dto.getCampaignId(), key -> new ArrayList<CampaignForm>()).add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CampaignForm> itemsSaved = campaignFormRepository.saveAll(items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaignForm", locale));
			}
			List<CampaignFormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? CampaignFormTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: CampaignFormTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHttpCode(HttpStatus.CREATED.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setHasError(false);
		}
		log.info("----end create CampaignForm-----");
		return response;
	}

	@Override
	@Transactional
	public Response<CampaignFormDto> update(Request<CampaignFormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin update CampaignForm-----");
		Response<CampaignFormDto> response = new Response<CampaignFormDto>();
		List<CampaignForm> items = new ArrayList<CampaignForm>();
		List<Form> impactedForms = new ArrayList<Form>();
		Map<Integer, Campaigns> campaignById = loadCampaigns(resolveCampaignIds(request.getDatas()), locale);
		Map<Integer, Form> formById = loadForms(resolveFormIds(request.getDatas()), locale);
		Map<Integer, List<CampaignForm>> activeLinksByCampaignId = loadActiveLinksByCampaignIds(campaignById.keySet());

		for (CampaignFormDto dto : request.getDatas()) {
			validateRequiredFields(dto, locale, false);
			CampaignForm entityToSave = campaignFormRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaignForm id -> " + dto.getId(), locale));
			}

			Campaigns campaign = resolveCampaign(dto, entityToSave, campaignById, locale);
			Form form = resolveForm(dto, entityToSave, formById, locale);
			addImpactedForm(impactedForms, entityToSave.getForm());
			addImpactedForm(impactedForms, form);
			validateActiveDuplicate(activeLinksByCampaignId, campaign.getId(), form.getId(), entityToSave.getId(), locale);

			entityToSave.setCampaigns(campaign);
			entityToSave.setForm(form);
			if (dto.getAssignmentOrder() != null) {
				entityToSave.setAssignmentOrder(dto.getAssignmentOrder());
			} else if (entityToSave.getAssignmentOrder() == null) {
				entityToSave.setAssignmentOrder(resolveAssignmentOrder(null, activeLinksByCampaignId.get(campaign.getId())));
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(buildSearchString(campaign, form));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CampaignForm> itemsSaved = campaignFormRepository.saveAll(items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaignForm", locale));
			}
			List<CampaignFormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? CampaignFormTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: CampaignFormTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end update CampaignForm-----");
		return response;
	}

	@Override
	@Transactional
	public Response<CampaignFormDto> delete(Request<CampaignFormDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete CampaignForm-----");
		Response<CampaignFormDto> response = new Response<CampaignFormDto>();
		List<Form> impactedForms = new ArrayList<Form>();

		for (CampaignFormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			CampaignForm entityToSave = campaignFormRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaignForm -> " + dto.getId(), locale));
			}
			addImpactedForm(impactedForms, entityToSave.getForm());

			entityToSave.setIsDeleted(true);
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(buildSearchString(entityToSave.getCampaigns(), entityToSave.getForm()));
			campaignFormRepository.save(entityToSave);
		}
		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete CampaignForm-----");
		return response;
	}

	@Override
	public Response<CampaignFormDto> getByCriteria(Request<CampaignFormDto> request, Locale locale) throws Exception {
		log.info("----begin get CampaignForm-----");
		Response<CampaignFormDto> response = new Response<CampaignFormDto>();
		List<CampaignForm> items = campaignFormRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignFormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? CampaignFormTransformer.INSTANCE.toLiteDtos(items)
					: CampaignFormTransformer.INSTANCE.toDtos(items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(campaignFormRepository.count(request, em, locale));
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaignForm", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get CampaignForm-----");
		return response;
	}

	public Response<CampaignFormDto> getAllByCriteria(Request<CampaignFormDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL CampaignForm-----");
		Response<CampaignFormDto> response = new Response<CampaignFormDto>();
		List<CampaignForm> items = campaignFormRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignFormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? CampaignFormTransformer.INSTANCE.toLiteDtos(items)
					: CampaignFormTransformer.INSTANCE.toDtos(items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(campaignFormRepository.countAll(request, em, locale));
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaignForm", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL CampaignForm-----");
		return response;
	}

	@Transactional(rollbackFor = { RuntimeException.class, Exception.class })
	public Response<CampaignFormDto> custom(Request<CampaignFormDto> request, Locale locale) throws Exception {
		log.info("----begin custom CampaignForm-----");
		Response<CampaignFormDto> response = new Response<CampaignFormDto>();
		response.setHasError(false);
		response.setCount(1L);
		response.setHttpCode(HttpStatus.OK.value());
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setStatus(status);
		return response;
	}

	@Transactional(rollbackFor = { RuntimeException.class, Exception.class })
	public Response<CampaignFormDto> updateDeleted(Request<CampaignFormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted CampaignForm-----");
		Response<CampaignFormDto> response = new Response<CampaignFormDto>();
		List<CampaignForm> items = new ArrayList<CampaignForm>();
		List<Form> impactedForms = new ArrayList<Form>();
		Map<Integer, Campaigns> campaignById = loadCampaigns(resolveCampaignIds(request.getDatas()), locale);
		Map<Integer, Form> formById = loadForms(resolveFormIds(request.getDatas()), locale);
		Map<Integer, List<CampaignForm>> activeLinksByCampaignId = loadActiveLinksByCampaignIds(campaignById.keySet());

		for (CampaignFormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			CampaignForm entityToSave = campaignFormRepository.findOne(dto.getId(), true);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaignForm id -> " + dto.getId(), locale));
			}

			Campaigns campaign = resolveCampaign(dto, entityToSave, campaignById, locale);
			Form form = resolveForm(dto, entityToSave, formById, locale);
			addImpactedForm(impactedForms, entityToSave.getForm());
			addImpactedForm(impactedForms, form);
			boolean restoring = Boolean.FALSE.equals(dto.getIsDeleted());
			if (restoring) {
				validateActiveDuplicate(activeLinksByCampaignId, campaign.getId(), form.getId(), entityToSave.getId(), locale);
			}

			entityToSave.setCampaigns(campaign);
			entityToSave.setForm(form);
			if (dto.getAssignmentOrder() != null) {
				entityToSave.setAssignmentOrder(dto.getAssignmentOrder());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(buildSearchString(campaign, form));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CampaignForm> itemsSaved = campaignFormRepository.saveAll(items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaignForm", locale));
			}
			List<CampaignFormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? CampaignFormTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: CampaignFormTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateDeleted CampaignForm-----");
		return response;
	}

	@Transactional(rollbackFor = { RuntimeException.class, Exception.class })
	public Response<CampaignFormDto> updateAll(Request<CampaignFormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll CampaignForm-----");
		Response<CampaignFormDto> response = new Response<CampaignFormDto>();
		List<CampaignForm> items = new ArrayList<CampaignForm>();
		List<Form> impactedForms = new ArrayList<Form>();
		Map<Integer, Campaigns> campaignById = loadCampaigns(resolveCampaignIds(request.getDatas()), locale);
		Map<Integer, Form> formById = loadForms(resolveFormIds(request.getDatas()), locale);
		Map<Integer, List<CampaignForm>> activeLinksByCampaignId = loadActiveLinksByCampaignIds(campaignById.keySet());

		for (CampaignFormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			CampaignForm entityToSave = campaignFormRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				entityToSave = campaignFormRepository.findOne(dto.getId(), true);
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaignForm id -> " + dto.getId(), locale));
			}

			Campaigns campaign = resolveCampaign(dto, entityToSave, campaignById, locale);
			Form form = resolveForm(dto, entityToSave, formById, locale);
			addImpactedForm(impactedForms, entityToSave.getForm());
			addImpactedForm(impactedForms, form);
			if (!Boolean.TRUE.equals(dto.getIsDeleted()) || dto.getIsDeleted() == null) {
				validateActiveDuplicate(activeLinksByCampaignId, campaign.getId(), form.getId(), entityToSave.getId(), locale);
			}

			entityToSave.setCampaigns(campaign);
			entityToSave.setForm(form);
			if (dto.getAssignmentOrder() != null) {
				entityToSave.setAssignmentOrder(dto.getAssignmentOrder());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(buildSearchString(campaign, form));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CampaignForm> itemsSaved = campaignFormRepository.saveAll(items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaignForm", locale));
			}
			List<CampaignFormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? CampaignFormTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: CampaignFormTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll CampaignForm-----");
		return response;
	}

	private void validateRequiredFields(CampaignFormDto dto, Locale locale, boolean requireRelations) {
		Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
		if (!requireRelations) {
			fieldsToVerify.put("id", dto.getId());
		}
		if (requireRelations || dto.getCampaignId() != null) {
			fieldsToVerify.put("campaignId", dto.getCampaignId());
		}
		if (requireRelations || dto.getFormId() != null) {
			fieldsToVerify.put("formId", dto.getFormId());
		}
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
		}
	}

	private List<Form> extractForms(List<CampaignForm> campaignForms) {
		List<Form> forms = new ArrayList<Form>();
		if (campaignForms == null) {
			return forms;
		}
		for (CampaignForm campaignForm : campaignForms) {
			addImpactedForm(forms, campaignForm != null ? campaignForm.getForm() : null);
		}
		return forms;
	}

	private void addImpactedForm(List<Form> impactedForms, Form form) {
		if (impactedForms == null || form == null || form.getId() == null) {
			return;
		}
		impactedForms.add(form);
	}

	private Set<Integer> resolveCampaignIds(List<CampaignFormDto> dtos) {
		Set<Integer> ids = new LinkedHashSet<Integer>();
		if (dtos == null) {
			return ids;
		}
		for (CampaignFormDto dto : dtos) {
			if (dto != null && dto.getCampaignId() != null && dto.getCampaignId() > 0) {
				ids.add(dto.getCampaignId());
			}
		}
		return ids;
	}

	private Set<Integer> resolveFormIds(List<CampaignFormDto> dtos) {
		Set<Integer> ids = new LinkedHashSet<Integer>();
		if (dtos == null) {
			return ids;
		}
		for (CampaignFormDto dto : dtos) {
			if (dto != null && dto.getFormId() != null && dto.getFormId() > 0) {
				ids.add(dto.getFormId());
			}
		}
		return ids;
	}

	private Map<Integer, Campaigns> loadCampaigns(Set<Integer> ids, Locale locale) {
		Map<Integer, Campaigns> campaigns = new LinkedHashMap<Integer, Campaigns>();
		for (Integer id : ids) {
			Campaigns campaign = campaignsRepository.findOne(id, false);
			if (campaign == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + id, locale));
			}
			campaigns.put(id, campaign);
		}
		return campaigns;
	}

	private Map<Integer, Form> loadForms(Set<Integer> ids, Locale locale) {
		Map<Integer, Form> forms = new LinkedHashMap<Integer, Form>();
		for (Integer id : ids) {
			Form form = formRepository.findOne(id, false);
			if (form == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + id, locale));
			}
			forms.put(id, form);
		}
		return forms;
	}

	private Map<Integer, List<CampaignForm>> loadActiveLinksByCampaignIds(Set<Integer> campaignIds) {
		Map<Integer, List<CampaignForm>> linksByCampaignId = new LinkedHashMap<Integer, List<CampaignForm>>();
		for (Integer campaignId : campaignIds) {
			List<CampaignForm> links = campaignFormRepository.findByCampaignId(campaignId);
			linksByCampaignId.put(campaignId, links != null ? new ArrayList<CampaignForm>(links) : new ArrayList<CampaignForm>());
		}
		return linksByCampaignId;
	}

	private Campaigns resolveCampaign(CampaignFormDto dto, CampaignForm entity, Map<Integer, Campaigns> campaignById, Locale locale) {
		Integer campaignId = dto.getCampaignId() != null ? dto.getCampaignId() : entity.getCampaigns() != null ? entity.getCampaigns().getId() : null;
		if (campaignId == null || campaignId <= 0) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("campaignId", locale));
		}
		Campaigns campaign = campaignById.get(campaignId);
		if (campaign != null) {
			return campaign;
		}
		campaign = campaignsRepository.findOne(campaignId, false);
		if (campaign == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + campaignId, locale));
		}
		return campaign;
	}

	private Form resolveForm(CampaignFormDto dto, CampaignForm entity, Map<Integer, Form> formById, Locale locale) {
		Integer formId = dto.getFormId() != null ? dto.getFormId() : entity.getForm() != null ? entity.getForm().getId() : null;
		if (formId == null || formId <= 0) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("formId", locale));
		}
		Form form = formById.get(formId);
		if (form != null) {
			return form;
		}
		form = formRepository.findOne(formId, false);
		if (form == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + formId, locale));
		}
		return form;
	}

	private void validateActiveDuplicate(Map<Integer, List<CampaignForm>> activeLinksByCampaignId, Integer campaignId, Integer formId, Integer currentId, Locale locale) {
		List<CampaignForm> activeLinks = activeLinksByCampaignId.get(campaignId);
		if (activeLinks == null || activeLinks.isEmpty()) {
			return;
		}

		for (CampaignForm activeLink : activeLinks) {
			if (activeLink == null || activeLink.getForm() == null || activeLink.getForm().getId() == null) {
				continue;
			}
			if (Objects.equals(activeLink.getForm().getId(), formId) && !Objects.equals(activeLink.getId(), currentId)
					&& !Boolean.TRUE.equals(activeLink.getIsDeleted())) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"Cette campagne est deja liee a ce formulaire.", locale));
			}
		}
	}

	private Integer resolveAssignmentOrder(Integer requestedAssignmentOrder, List<CampaignForm> existingLinks) {
		if (requestedAssignmentOrder != null && requestedAssignmentOrder > 0) {
			return requestedAssignmentOrder;
		}
		int maxAssignmentOrder = 0;
		if (existingLinks != null) {
			for (CampaignForm existingLink : existingLinks) {
				if (existingLink != null && !Boolean.TRUE.equals(existingLink.getIsDeleted()) && existingLink.getAssignmentOrder() != null) {
					maxAssignmentOrder = Math.max(maxAssignmentOrder, existingLink.getAssignmentOrder());
				}
			}
		}
		return maxAssignmentOrder + 1;
	}

	private String buildSearchString(Campaigns campaign, Form form) {
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
}