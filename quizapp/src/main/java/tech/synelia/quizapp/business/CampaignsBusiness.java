                                                                            																		
/*
 * Java business for entity table campaigns 
 * Created on 2025-08-22 ( Time 11:38:25 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

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
import tech.synelia.quizapp.utils.contract.SearchParam;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.utils.enums.FormAssignmentExhaustionPolicy;
import tech.synelia.quizapp.utils.enums.FormAssignmentStrategy;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "campaigns"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class CampaignsBusiness implements IBasicBusiness<Request<CampaignsDto>, Response<CampaignsDto>> {

	private Response<CampaignsDto> response;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private PermissionService permissionService;
	@Autowired
	private EntityPermissionRepository entityPermissionRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private FormRepository formRepository;
	@Autowired
	private SpecialitiesRepository specialitiesRepository;
	@Autowired
	private InterviewsRepository interviewsRepository;
	@Autowired
	private SourceTokenRepository sourceTokenRepository;
	@Autowired
	private PipelineTemplateRepository pipelineTemplateRepository;
	@Autowired
	private ApplicationProgressBusiness applicationProgressBusiness;
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

	public CampaignsBusiness() {
		dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignsDto> create(Request<CampaignsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
			
		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("campaignTitle", dto.getCampaignTitle());
		// fieldsToVerify.put("campaignDesc", dto.getCampaignDesc());
		fieldsToVerify.put("campaignStatus", dto.getCampaignStatus());
		// fieldsToVerify.put("campaignStart", dto.getCampaignStart());
		// fieldsToVerify.put("campaignEnd", dto.getCampaignEnd());
		// fieldsToVerify.put("maxApply", dto.getMaxApply());
		fieldsToVerify.put("allCanEvaluate", dto.getAllCanEvaluate());
		// fieldsToVerify.put("searchString", dto.getSearchString());
		fieldsToVerify.put("specialityId", dto.getSpecialityId());
		fieldsToVerify.put("creatorId", dto.getCreatorId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Validation: date de fin >= date de début
			if (dto.getCampaignStart() != null && !dto.getCampaignStart().isEmpty()
					&& dto.getCampaignEnd() != null && !dto.getCampaignEnd().isEmpty()) {
				Date start = dateFormat.parse(dto.getCampaignStart());
				Date end = dateFormat.parse(dto.getCampaignEnd());
				if (end.before(start)) {
					throw new InvalidEntityException(functionalError.REQUEST_FAIL(
							"La date de fin ne peut pas être antérieure à la date de début", locale));
				}
			}

			// Verify if campaigns to insert do not exist
			Campaigns existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("campaigns id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			User existingUser = null;
			if (dto.getCreatorId() != null && dto.getCreatorId() > 0){
				existingUser = userRepository.findOne(dto.getCreatorId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user creatorId -> " + dto.getCreatorId(), locale));
				}
			}
			// Verify if specialities exist
			Specialities existingSpecialities = null;
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
			}
			// Vérifier / assigner le pipeline template
			PipelineTemplate existingPipelineTemplate = null;
			if (dto.getPipelineTemplateId() != null && dto.getPipelineTemplateId() > 0) {
				existingPipelineTemplate = pipelineTemplateRepository.findOne(dto.getPipelineTemplateId(), false);
				if (existingPipelineTemplate == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipelineTemplate pipelineTemplateId -> " + dto.getPipelineTemplateId(), locale));
				}
				if (existingPipelineTemplate.getIsActive() == null || !existingPipelineTemplate.getIsActive()) {
					throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Le template de pipeline sélectionné n'est pas actif", locale));
				}
			} else {
				// Utiliser le template par défaut si non fourni
				existingPipelineTemplate = pipelineTemplateRepository.findByIsDefaultTrue();
				if (existingPipelineTemplate == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Aucun template de pipeline par défaut configuré", locale));
				}
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			// Validation: maxApply doit être >= 1 si fourni
			if (dto.getMaxApply() != null && dto.getMaxApply() < 1) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"La valeur maximale de candidatures doit être supérieure ou égale à 1", locale));
			}

			Campaigns entityToSave = null;
			entityToSave = CampaignsTransformer.INSTANCE.toEntity(dto, existingUser, existingSpecialities);
			entityToSave.setPipelineTemplate(existingPipelineTemplate);
			applyFormAssignmentConfiguration(entityToSave, dto, true, locale);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Campaigns> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = campaignsRepository.saveAll((Iterable<Campaigns>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaigns", locale));
			}
			ensureCampaignCreatorPermissions(itemsSaved, request.getUser());
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignsTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
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
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end create Campaigns-----");
		return response;
	}

	/**
	 * update Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignsDto> update(Request<CampaignsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
		
		Integer authenticatedUserId = request.getUser();
		if (authenticatedUserId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}
			
		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// ========== VÉRIFICATION DES PERMISSIONS ==========
			log.info("🔐 Vérification des permissions pour l'utilisateur " + authenticatedUserId + " sur la campagne " + dto.getId());
			
			boolean canModify = permissionService.hasEntityPermission(authenticatedUserId, "CAMPAIGN", dto.getId(), "ADMIN")
					|| permissionService.hasEntityPermission(authenticatedUserId, "CAMPAIGN", dto.getId(), "UPDATE");
			if (!canModify) {
				log.log(java.util.logging.Level.WARNING,
						"❌ Accès refusé : l'utilisateur {0} n'a pas les droits pour modifier la campagne {1}",
						new Object[]{authenticatedUserId, dto.getId()});
				throw new InvalidEntityException(functionalError.REQUEST_FAIL("Accès refusé: droits insuffisants pour modifier cette campagne", locale));
			}
			log.info("✅ Utilisateur autorisé à modifier la campagne " + dto.getId());
			// ========== FIN VÉRIFICATION DES PERMISSIONS ==========

			// Verifier si la campaigns existe
			Campaigns entityToSave = null;
			entityToSave = campaignsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getCreatorId() != null && dto.getCreatorId() > 0){
				User existingUser = userRepository.findOne(dto.getCreatorId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user creatorId -> " + dto.getCreatorId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if specialities exist
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			// Verify if pipelineTemplate changed
			if (dto.getPipelineTemplateId() != null && dto.getPipelineTemplateId() > 0) {
				PipelineTemplate newTemplate = pipelineTemplateRepository.findOne(dto.getPipelineTemplateId(), false);
				if (newTemplate == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipelineTemplate pipelineTemplateId -> " + dto.getPipelineTemplateId(), locale));
				}
				if (newTemplate.getIsActive() == null || !newTemplate.getIsActive()) {
					throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Le template de pipeline sélectionné n'est pas actif", locale));
				}
				entityToSave.setPipelineTemplate(newTemplate);
			}
			if (Utilities.shouldUpdate(dto.getCampaignTitle())) {
				entityToSave.setCampaignTitle(dto.getCampaignTitle());
			}
			if (Utilities.shouldUpdate(dto.getCampaignDesc())) {
				entityToSave.setCampaignDesc(dto.getCampaignDesc());
			}
			if (Utilities.shouldUpdate(dto.getCampaignStatus())) {
				entityToSave.setCampaignStatus(dto.getCampaignStatus());
			}
			if (Utilities.shouldUpdate(dto.getCampaignStart())) {
				entityToSave.setCampaignStart(dateFormat.parse(dto.getCampaignStart()));
			}
			if (Utilities.shouldUpdate(dto.getCampaignEnd())) {
				entityToSave.setCampaignEnd(dateFormat.parse(dto.getCampaignEnd()));
			}
			if (entityToSave.getCampaignStart() != null && entityToSave.getCampaignEnd() != null
					&& entityToSave.getCampaignEnd().before(entityToSave.getCampaignStart())) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"La date de fin ne peut pas être antérieure à la date de début", locale));
			}
			if (dto.getMaxApply() != null && dto.getMaxApply() > 0) {
				entityToSave.setMaxApply(dto.getMaxApply());
			}
			if (dto.getAllCanEvaluate() != null) {
				entityToSave.setAllCanEvaluate(dto.getAllCanEvaluate());
			}
			applyFormAssignmentConfiguration(entityToSave, dto, false, locale);
			ensureOperationalPipelineTemplate(entityToSave, locale);
			
			// ⚠️ NE JAMAIS modifier createdBy lors d'une mise à jour !
			// createdBy doit toujours rester l'utilisateur qui a créé la campagne initialement
			
			// Mettre à jour les métadonnées de modification
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser()); // L'utilisateur authentifié qui fait la modification
			// Générer le searchString à partir de l'entité finale
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Campaigns> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = campaignsRepository.saveAll((Iterable<Campaigns>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaigns", locale));
			}
			
			ensureCampaignCreatorPermissions(itemsSaved, request.getUser());
			
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignsTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
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
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end update Campaigns-----");
		return response;
	}

	private void ensureOperationalPipelineTemplate(Campaigns campaign, Locale locale) {
		if (campaign == null) {
			return;
		}

		String campaignStatus = StringUtils.upperCase(StringUtils.trimToEmpty(campaign.getCampaignStatus()));
		if (!"ACTIVE".equals(campaignStatus)) {
			return;
		}

		if (campaign.getPipelineTemplate() != null && campaign.getPipelineTemplate().getId() != null) {
			return;
		}

		PipelineTemplate defaultTemplate = pipelineTemplateRepository.findByIsDefaultTrue();
		if (defaultTemplate != null && Boolean.TRUE.equals(defaultTemplate.getIsActive())) {
			campaign.setPipelineTemplate(defaultTemplate);
			return;
		}

		throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
				"Impossible d'activer cette campagne sans pipeline template actif ou template par défaut.", locale));
	}

	private void applyFormAssignmentConfiguration(Campaigns entityToSave, CampaignsDto dto, boolean isCreate, Locale locale) {
		if (isCreate) {
			entityToSave.setFormAssignmentStrategy(normalizeFormAssignmentStrategy(dto.getFormAssignmentStrategy(), true, locale));
			entityToSave.setFormAssignmentExhaustionPolicy(normalizeFormAssignmentExhaustionPolicy(dto.getFormAssignmentExhaustionPolicy(), true, locale));
			return;
		}

		if (Utilities.shouldUpdate(dto.getFormAssignmentStrategy())) {
			entityToSave.setFormAssignmentStrategy(normalizeFormAssignmentStrategy(dto.getFormAssignmentStrategy(), false, locale));
		}

		if (Utilities.shouldUpdate(dto.getFormAssignmentExhaustionPolicy())) {
			entityToSave.setFormAssignmentExhaustionPolicy(normalizeFormAssignmentExhaustionPolicy(dto.getFormAssignmentExhaustionPolicy(), false, locale));
		}
	}

	private String normalizeFormAssignmentStrategy(String value, boolean useDefaultWhenBlank, Locale locale) {
		String trimmedValue = StringUtils.trimToNull(value);
		if (trimmedValue == null) {
			return useDefaultWhenBlank ? FormAssignmentStrategy.RANDOM.getValue() : null;
		}
		try {
			return FormAssignmentStrategy.fromValue(trimmedValue).getValue();
		} catch (IllegalArgumentException ex) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Strategie d'attribution de formulaire invalide: " + trimmedValue, locale));
		}
	}

	private String normalizeFormAssignmentExhaustionPolicy(String value, boolean useDefaultWhenBlank, Locale locale) {
		String trimmedValue = StringUtils.trimToNull(value);
		if (trimmedValue == null) {
			return useDefaultWhenBlank ? FormAssignmentExhaustionPolicy.BLOCK.getValue() : null;
		}
		try {
			return FormAssignmentExhaustionPolicy.fromValue(trimmedValue).getValue();
		} catch (IllegalArgumentException ex) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Politique d'epuisement de formulaires invalide: " + trimmedValue, locale));
		}
	}

	private void ensureCampaignCreatorPermissions(List<Campaigns> campaigns, Integer actorUserId) {
		log.info("🔄 Vérification des entity_permission pour les campagnes sauvegardées");
		for (Campaigns savedCampaign : campaigns) {
			try {
				Integer creatorId = savedCampaign.getCreatedBy();
				if (creatorId == null || creatorId <= 0) {
					continue;
				}

				User creator = userRepository.findOne(creatorId, false);
				if (creator == null) {
					continue;
				}

				String[] permissionKeys = {"ADMIN", "CREATOR", "UPDATE", "DELETE", "EVALUATE", "CORRECT_TEST", "PLANIFY", "ADVANCE_PIPELINE", "FOLLOW"};
				for (String key : permissionKeys) {
					EntityPermission existing = entityPermissionRepository.findByUserIdAndEntityTypeAndEntityIdAndPermissionKey(
							creatorId, "CAMPAIGN", savedCampaign.getId(), key);
					if (existing == null) {
						EntityPermission ep = new EntityPermission();
						ep.setUser(creator);
						ep.setEntityType("CAMPAIGN");
						ep.setEntityId(savedCampaign.getId());
						ep.setPermissionKey(key);
						ep.setCreatedAt(Utilities.getCurrentDate());
						ep.setCreatedBy(actorUserId);
						ep.setIsDeleted(false);
						entityPermissionRepository.save(ep);
					} else if (Boolean.TRUE.equals(existing.getIsDeleted())) {
						existing.setIsDeleted(false);
						existing.setUpdatedAt(Utilities.getCurrentDate());
						existing.setUpdatedBy(actorUserId);
						entityPermissionRepository.save(existing);
					}
				}
				log.info("👑 Créateur ID=" + creator.getId() + " vérifié avec tous les droits sur campagne " + savedCampaign.getId());
			} catch (Exception e) {
				log.severe("❌ Erreur lors de la vérification des entity_permission pour campagne " + savedCampaign.getId() + ": " + e.getMessage());
				e.printStackTrace();
			}
		}
		log.info("✅ Vérification des entity_permission terminée");
	}

	/**
	 * delete Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignsDto> delete(Request<CampaignsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
		
		Integer authenticatedUserId = request.getUser();
		if (authenticatedUserId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}
			
		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// ========== VÉRIFICATION DES PERMISSIONS ==========
			log.info("🔐 Vérification des permissions pour l'utilisateur " + authenticatedUserId + " sur la campagne " + dto.getId());
			
			boolean canDelete = permissionService.hasEntityPermission(authenticatedUserId, "CAMPAIGN", dto.getId(), "ADMIN")
					|| permissionService.hasEntityPermission(authenticatedUserId, "CAMPAIGN", dto.getId(), "DELETE");
			if (!canDelete) {
				log.warning("❌ Accès refusé : l'utilisateur " + authenticatedUserId + " n'a pas les droits pour supprimer la campagne " + dto.getId());
				throw new InvalidEntityException(functionalError.REQUEST_FAIL("Accès refusé: droits insuffisants pour supprimer cette campagne", locale));
			}
			log.info("✅ Utilisateur autorisé à supprimer la campagne " + dto.getId());
			// ========== FIN VÉRIFICATION DES PERMISSIONS ==========

			// Verifier si la campaigns existe
			Campaigns existingEntity = null;
			existingEntity = campaignsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// entityPermission
			List<EntityPermission> listOfEntityPermission = entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", existingEntity.getId());
			if (listOfEntityPermission != null && !listOfEntityPermission.isEmpty()){
				// Supprimer les entity_permission associées avant de soft-delete la campagne
				for (EntityPermission ep : listOfEntityPermission) {
					ep.setIsDeleted(true);
				}
				entityPermissionRepository.saveAll(listOfEntityPermission);
			}
			// form
			List<Form> listOfForm = formRepository.findByCampaignId(existingEntity.getId(), false);
			if (listOfForm != null && !listOfForm.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfForm.size() + ")", locale));
			}
			// interviews
			List<Interviews> listOfInterviews = interviewsRepository.findByCampaignId(existingEntity.getId(), false);
			if (listOfInterviews != null && !listOfInterviews.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfInterviews.size() + ")", locale));
			}
			// sourceToken
			List<SourceToken> listOfSourceToken = sourceTokenRepository.findByCampaignId(existingEntity.getId(), false);
			if (listOfSourceToken != null && !listOfSourceToken.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfSourceToken.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			campaignsRepository.saveAll((Iterable<Campaigns>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Campaigns-----");
		return response;
	}

	/**
	 * get Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<CampaignsDto> getByCriteria(Request<CampaignsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns> items 			 = campaignsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(items) : CampaignsTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
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
			response.setCount(campaignsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaigns", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Campaigns-----");
		return response;
	}

	/**
	 * get ALL Campaigns by using CampaignsDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<CampaignsDto> getAllByCriteria(Request<CampaignsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Campaigns (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();

		// Ajuster la taille de page selon les préférences utilisateur
		Utilities.adjustPageSizeFromUserPreference(request, userRepository);

		List<Campaigns> items 			 = campaignsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(items) : CampaignsTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
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
			response.setCount(campaignsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("campaigns", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Campaigns-----");
		return response;
	}



	/**
	 * update deleted Campaigns by using CampaignsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	public Response<CampaignsDto> updateDeleted(Request<CampaignsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted Campaigns (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
		Integer authenticatedUserId = request.getUser();
		if (authenticatedUserId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}
        
		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			boolean canModify = permissionService.hasEntityPermission(authenticatedUserId, "CAMPAIGN", dto.getId(), "ADMIN")
					|| permissionService.hasEntityPermission(authenticatedUserId, "CAMPAIGN", dto.getId(), "UPDATE");
			if (!canModify) {
				log.log(java.util.logging.Level.WARNING,
						"❌ Accès refusé : l'utilisateur {0} n'a pas les droits pour modifier la campagne {1}",
						new Object[]{authenticatedUserId, dto.getId()});
				throw new InvalidEntityException(functionalError.REQUEST_FAIL("Accès refusé: droits insuffisants pour modifier cette campagne", locale));
			}

			// Verifier si la campaigns existe (incluant les supprimés)
			Campaigns entityToSave = null;
			entityToSave = campaignsRepository.findOne(dto.getId(), true);  // true pour inclure les supprimés
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getCreatorId() != null && dto.getCreatorId() > 0){
				User existingUser = userRepository.findOne(dto.getCreatorId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user creatorId -> " + dto.getCreatorId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if specialities exist
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.shouldUpdate(dto.getCampaignTitle())) {
				entityToSave.setCampaignTitle(dto.getCampaignTitle());
			}
			if (Utilities.shouldUpdate(dto.getCampaignDesc())) {
				entityToSave.setCampaignDesc(dto.getCampaignDesc());
			}
			if (Utilities.shouldUpdate(dto.getCampaignStatus())) {
				entityToSave.setCampaignStatus(dto.getCampaignStatus());
			}
			if (Utilities.shouldUpdate(dto.getCampaignStart())) {
				entityToSave.setCampaignStart(dateFormat.parse(dto.getCampaignStart()));
			}
			if (Utilities.shouldUpdate(dto.getCampaignEnd())) {
				entityToSave.setCampaignEnd(dateFormat.parse(dto.getCampaignEnd()));
			}
			if (entityToSave.getCampaignStart() != null && entityToSave.getCampaignEnd() != null
					&& entityToSave.getCampaignEnd().before(entityToSave.getCampaignStart())) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"La date de fin ne peut pas être antérieure à la date de début", locale));
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (dto.getMaxApply() != null && dto.getMaxApply() > 0) {
				entityToSave.setMaxApply(dto.getMaxApply());
			}
			if (dto.getAllCanEvaluate() != null) {
				entityToSave.setAllCanEvaluate(dto.getAllCanEvaluate());
			}
			ensureOperationalPipelineTemplate(entityToSave, locale);
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.shouldUpdate(dto.getSearchString())) {
				entityToSave.setSearchString(dto.getSearchString());
			}
			// Après toutes les mises à jour conditionnelles...
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			// Générer le searchString à partir de l'entité finale
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Campaigns> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = campaignsRepository.saveAll((Iterable<Campaigns>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaigns", locale));
			}
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignsTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
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
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end updateDeleted Campaigns-----");
		return response;
	}

	/**
	 * update all Campaigns (active and deleted) by using CampaignsDto as object.
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<CampaignsDto> updateAll(Request<CampaignsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin updateAll Campaigns-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		List<Campaigns>        items    = new ArrayList<Campaigns>();
		Integer authenticatedUserId = request.getUser();
		if (authenticatedUserId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}

		for (CampaignsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			boolean canModify = permissionService.hasEntityPermission(authenticatedUserId, "CAMPAIGN", dto.getId(), "ADMIN")
					|| permissionService.hasEntityPermission(authenticatedUserId, "CAMPAIGN", dto.getId(), "UPDATE");
			if (!canModify) {
				log.warning("❌ Accès refusé : l'utilisateur " + authenticatedUserId + " n'a pas les droits pour modifier la campagne " + dto.getId());
				throw new InvalidEntityException(functionalError.REQUEST_FAIL("Accès refusé: droits insuffisants pour modifier cette campagne", locale));
			}

			// Verifier si la campaigns existe (actifs d'abord, puis supprimés)
			Campaigns entityToSave = null;
			// Pour updateAll, chercher d'abord les campagnes actives, puis les supprimées
			entityToSave = campaignsRepository.findOne(dto.getId(), false); // Chercher d'abord les actives
			if (entityToSave == null) {
				entityToSave = campaignsRepository.findOne(dto.getId(), true); // Puis les supprimées si pas trouvé
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getCreatorId() != null && dto.getCreatorId() > 0){
				User existingUser = userRepository.findOne(dto.getCreatorId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user creatorId -> " + dto.getCreatorId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if specialities exist
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0){
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.shouldUpdate(dto.getCampaignTitle())) {
				entityToSave.setCampaignTitle(dto.getCampaignTitle());
			}
			if (Utilities.shouldUpdate(dto.getCampaignDesc())) {
				entityToSave.setCampaignDesc(dto.getCampaignDesc());
			}
			if (Utilities.shouldUpdate(dto.getCampaignStatus())) {
				entityToSave.setCampaignStatus(dto.getCampaignStatus());
			}
			if (Utilities.shouldUpdate(dto.getCampaignStart())) {
				entityToSave.setCampaignStart(dateFormat.parse(dto.getCampaignStart()));
			}
			if (Utilities.shouldUpdate(dto.getCampaignEnd())) {
				entityToSave.setCampaignEnd(dateFormat.parse(dto.getCampaignEnd()));
			}
			if (entityToSave.getCampaignStart() != null && entityToSave.getCampaignEnd() != null
					&& entityToSave.getCampaignEnd().before(entityToSave.getCampaignStart())) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"La date de fin ne peut pas être antérieure à la date de début", locale));
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (dto.getMaxApply() != null && dto.getMaxApply() > 0) {
				entityToSave.setMaxApply(dto.getMaxApply());
			}
			if (dto.getAllCanEvaluate() != null) {
				entityToSave.setAllCanEvaluate(dto.getAllCanEvaluate());
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.shouldUpdate(dto.getSearchString())) {
				entityToSave.setSearchString(dto.getSearchString());
			}
			// Après toutes les mises à jour conditionnelles...
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			// Générer le searchString à partir de l'entité finale
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Campaigns> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = campaignsRepository.saveAll((Iterable<Campaigns>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("campaigns", locale));
			}
			List<CampaignsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CampaignsTransformer.INSTANCE.toLiteDtos(itemsSaved) : CampaignsTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
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
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end updateAll Campaigns-----");
		return response;
	}

	/**
	 * get full CampaignsDto by using Campaigns as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public CampaignsDto getFullInfos(CampaignsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// Récupérer le nom du créateur
		if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
			User creator = userRepository.findOne(dto.getCreatedBy(), false);
			if (creator != null) {
				// Construire le nom complet: username (ou firstName + lastName si disponibles)
				String creatorName = creator.getUsername();
				if (Utilities.notBlank(creator.getFirstName()) && Utilities.notBlank(creator.getLastName())) {
					creatorName = creator.getFirstName() + " " + creator.getLastName();
				}
				dto.setCreatorName(creatorName);
			}
		}

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<CampaignsDto> custom(Request<CampaignsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom CampaignsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new CampaignsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom CampaignsDto-----");
		return response;
	}

	/**
	 * Check if user has permission to edit a campaign
	 * Returns:
	 * - canEdit: true/false if user has rights via campaign_crud
	 * - requiresAdminMode: true if user is ADMIN/SUPER but needs to enable admin mode
	 * - userRole: the user's role (ADMIN/SUPER/RECRUITER)
	 */
	public Response<CampaignsDto> checkEditPermission(Request<CampaignsDto> request, Locale locale) throws Exception {
		log.info("----begin checkEditPermission-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<CampaignsDto> response = new Response<CampaignsDto>();
		
		try {
			// Récupérer les paramètres
			Integer userId = request.getUser();
			Integer campaignId = null;
			
			// Gérer le cas où getDatas() peut être null ou vide
			if (request.getDatas() != null && !request.getDatas().isEmpty()) {
				campaignId = request.getDatas().get(0).getId();
			} else if (request.getData() != null) {
				campaignId = request.getData().getId();
			}
			
			if (userId == null || campaignId == null) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY("userId or campaignId", locale));
			}
			
			log.info("Checking edit permission for user " + userId + " on campaign " + campaignId);
			
		// 2. Vérifier les permissions entité via PermissionService
		boolean hasDirectRights = permissionService.hasEntityPermission(userId, "CAMPAIGN", campaignId, "ADMIN")
				|| permissionService.hasEntityPermission(userId, "CAMPAIGN", campaignId, "UPDATE");
		
		log.info("User " + userId + " hasDirectRights on campaign " + campaignId + ": " + hasDirectRights);
			
			// 3. Préparer la réponse
			CampaignsDto responseDto = new CampaignsDto();
			responseDto.setId(campaignId);
			
			if (hasDirectRights) {
				// L'utilisateur a les droits directs, il peut modifier
				log.info("User has direct edit rights");
				responseDto.setCampaignTitle("CAN_EDIT");
				responseDto.setCampaignDesc("HAS_RIGHTS");
			} else {
				// Pas de droits directs, vérifier s'il a la permission fonctionnelle UPDATE_CAMPAIGNS
				if (permissionService.hasPermission(userId, "UPDATE_CAMPAIGNS")) {
					log.info("User has functional UPDATE_CAMPAIGNS permission but no entity rights - requires admin mode");
					responseDto.setCampaignTitle("REQUIRES_ADMIN_MODE");
					User user = userRepository.findOne(userId, false);
					responseDto.setCampaignDesc(user != null ? user.getUserRole() : "");
				} else {
					log.info("User has no edit rights");
					responseDto.setCampaignTitle("NO_PERMISSION");
					User user = userRepository.findOne(userId, false);
					responseDto.setCampaignDesc(user != null ? user.getUserRole() : "");
				}
			}
			
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			
			response.setItems(Arrays.asList(responseDto));
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			
		} catch (Exception e) {
			log.severe("Error checking edit permission: " + e.getMessage());
			e.printStackTrace();
			throw new RuntimeException("Error checking edit permission: " + e.getMessage());
		}
		
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end checkEditPermission-----");
		return response;
	}
}

