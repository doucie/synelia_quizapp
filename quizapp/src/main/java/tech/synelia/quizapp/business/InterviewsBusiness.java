                                                            														
/*
 * Java business for entity table interviews 
 * Created on 2025-08-22 ( Time 11:38:27 )
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
import org.thymeleaf.context.Context;

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
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "interviews"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class InterviewsBusiness implements IBasicBusiness<Request<InterviewsDto>, Response<InterviewsDto>> {

	private Response<InterviewsDto> response;
	@Autowired
	private InterviewsRepository interviewsRepository;
	@Autowired
	private CandidateInterviewRepository candidateInterviewRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private InterviewCrudRepository interviewCrudRepository;
	@Autowired
	private HostingUtils hostingUtils;
	@Autowired
	private ParamsUtils paramsUtils;
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
	private Context context;

	public InterviewsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Interviews by using InterviewsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewsDto> create(Request<InterviewsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Interviews-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews>        items    = new ArrayList<Interviews>();
			
		for (InterviewsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("interviewDate", dto.getInterviewDate());
			fieldsToVerify.put("interviewType", dto.getInterviewType());
			fieldsToVerify.put("campaignId", dto.getCampaignId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if interviews to insert do not exist
			Interviews existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("interviews id -> " + dto.getId(), locale));
			}

			// Verify if campaigns exist
			Campaigns existingCampaigns = null;
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
			}
			
			// Verify if applications exist
			Applications existingApplications = null;
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
			}
			
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Interviews entityToSave = null;
			entityToSave = InterviewsTransformer.INSTANCE.toEntity(dto, existingCampaigns, existingApplications);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Interviews> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = interviewsRepository.saveAll((Iterable<Interviews>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("interviews", locale));
			}
			List<InterviewsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewsTransformer.INSTANCE.toLiteDtos(itemsSaved) : InterviewsTransformer.INSTANCE.toDtos(itemsSaved);

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
			
			// Envoyer les emails si nécessaire
			for (int i = 0; i < itemsSaved.size(); i++) {
				Interviews interview = itemsSaved.get(i);
				InterviewsDto dto = itemsDto.get(i);
				
				if (interview.getInterviewMailSent() != null && interview.getInterviewMailSent()) {
					try {
						sendInterviewEmail(interview, locale);
						log.info("Email d'entretien envoyé avec succès pour l'interview ID: " + interview.getId());
					} catch (Exception e) {
						log.warning("Échec de l'envoi de l'email pour l'interview ID: " + interview.getId() + " - " + e.getMessage());
						// Ne pas bloquer le processus si l'email échoue
					}
				}
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
		log.info("----end create Interviews-----");
		return response;
	}

	/**
	 * update Interviews by using InterviewsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewsDto> update(Request<InterviewsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Interviews-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews>        items    = new ArrayList<Interviews>();
			
		for (InterviewsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la interviews existe
			Interviews entityToSave = null;
			entityToSave = interviewsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews id -> " + dto.getId(), locale));
			}

			// Verify if campaigns exist
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				Campaigns existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
				entityToSave.setCampaigns(existingCampaigns);
			}
			// Verify if applications exist
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0){
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			if (Utilities.notBlank(dto.getInterviewLocation())) {
				entityToSave.setInterviewLocation(dto.getInterviewLocation());
			}
			if (Utilities.notBlank(dto.getInterviewDate())) {
				entityToSave.setInterviewDate(dateFormat.parse(dto.getInterviewDate()));
			}
			if (Utilities.notBlank(dto.getInterviewStatus())) {
				entityToSave.setInterviewStatus(dto.getInterviewStatus());
			}
			if (Utilities.notBlank(dto.getMeetLink())) {
				entityToSave.setMeetLink(dto.getMeetLink());
			}
			if (Utilities.notBlank(dto.getInterviewNote())) {
				entityToSave.setInterviewNote(dto.getInterviewNote());
			}
			if (dto.getInterviewMailSent() != null) {
				entityToSave.setInterviewMailSent(dto.getInterviewMailSent());
			}
			if (Utilities.notBlank(dto.getInterviewType())) {
				entityToSave.setInterviewType(dto.getInterviewType());
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.notBlank(dto.getSearchString())) {
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
			List<Interviews> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = interviewsRepository.saveAll((Iterable<Interviews>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("interviews", locale));
			}
			List<InterviewsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewsTransformer.INSTANCE.toLiteDtos(itemsSaved) : InterviewsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Interviews-----");
		return response;
	}

	/**
	 * delete Interviews by using InterviewsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewsDto> delete(Request<InterviewsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Interviews-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews>        items    = new ArrayList<Interviews>();
			
		for (InterviewsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la interviews existe
			Interviews existingEntity = null;
			existingEntity = interviewsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// candidateInterview
			List<CandidateInterview> listOfCandidateInterview = candidateInterviewRepository.findByInterviewId(existingEntity.getId(), false);
			if (listOfCandidateInterview != null && !listOfCandidateInterview.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateInterview.size() + ")", locale));
			}
			// interviewCrud
			List<InterviewCrud> listOfInterviewCrud = interviewCrudRepository.findByInterviewId(existingEntity.getId(), false);
			if (listOfInterviewCrud != null && !listOfInterviewCrud.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfInterviewCrud.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			interviewsRepository.saveAll((Iterable<Interviews>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Interviews-----");
		return response;
	}

	/**
	 * get Interviews by using InterviewsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<InterviewsDto> getByCriteria(Request<InterviewsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Interviews-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews> items 			 = interviewsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<InterviewsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewsTransformer.INSTANCE.toLiteDtos(items) : InterviewsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(interviewsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("interviews", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Interviews-----");
		return response;
	}

	/**
	 * get ALL Interviews by using InterviewsDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<InterviewsDto> getAllByCriteria(Request<InterviewsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Interviews (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		List<Interviews> items 			 = interviewsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<InterviewsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewsTransformer.INSTANCE.toLiteDtos(items) : InterviewsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(interviewsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("interviews", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Interviews-----");
		return response;
	}

	/**
	 * get full InterviewsDto by using Interviews as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public InterviewsDto getFullInfos(InterviewsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<InterviewsDto> custom(Request<InterviewsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom InterviewsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewsDto> response = new Response<InterviewsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new InterviewsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom InterviewsDto-----");
		return response;
	}
	
	/**
	 * Envoie un email de convocation pour un entretien
	 * 
	 * @param interview L'entretien pour lequel envoyer l'email
	 * @param locale La locale pour les messages
	 * @throws Exception en cas d'erreur
	 */
	private void sendInterviewEmail(Interviews interview, Locale locale) throws Exception {
		log.info("----begin sendInterviewEmail-----");
		
		// Récupérer l'application associée
		Applications application = interview.getApplications();
		if (application == null) {
			log.warning("Application introuvable pour l'interview ID: " + interview.getId());
			return;
		}
		
		// Récupérer la campagne associée
		Campaigns campaign = interview.getCampaigns();
		if (campaign == null) {
			log.warning("Campagne introuvable pour l'interview ID: " + interview.getId());
			return;
		}
		
		// Préparer l'expéditeur
		Map<String, String> from = new HashMap<>();
		from.put("email", paramsUtils.getSmtpLogin());
		from.put("user", "Synelia Recrutement");
		
		// Préparer le destinataire
		List<Map<String, String>> toRecipients = new ArrayList<>();
		Map<String, String> recipient = new HashMap<>();
		recipient.put("email", application.getCandidateEmail());
		recipient.put("user", application.getCandidateFirstName() + " " + application.getCandidateLastName());
		toRecipients.add(recipient);
		
		// Formater la date et l'heure
		String interviewDateTime = dateTimeFormat.format(interview.getInterviewDate());
		
		// Déterminer le type d'entretien
		String interviewTypeText = "IN_PERSON".equals(interview.getInterviewType()) 
			? "qui se déroulera en présentiel" 
			: "qui se déroulera en visioconférence";
		
		// Déterminer le lieu ou le lien
		String locationOrLink = "";
		if ("IN_PERSON".equals(interview.getInterviewType())) {
			locationOrLink = "Lieu : " + (interview.getInterviewLocation() != null ? interview.getInterviewLocation() : "À préciser");
		} else {
			locationOrLink = "Lien de connexion : " + (interview.getMeetLink() != null ? interview.getMeetLink() : "Sera communiqué ultérieurement");
		}
		
		// Note supplémentaire
		String additionalNote = interview.getInterviewNote() != null && !interview.getInterviewNote().isEmpty()
			? "<br/><br/>Note supplémentaire :<br/>" + interview.getInterviewNote()
			: "";
		
		// Sujet de l'email
		String subject = "Convocation à un entretien - " + campaign.getCampaignTitle();
		
		// Corps de l'email
		String contenu = "Madame, Monsieur,<br/><br/>";
		contenu += "Nous avons le plaisir de vous informer que votre candidature pour le poste de \"" + campaign.getCampaignTitle() + "\" a retenu notre attention.<br/><br/>";
		contenu += "Dans le cadre de notre processus de recrutement, nous souhaitons vous rencontrer pour un entretien " + interviewTypeText + ".<br/><br/>";
		contenu += "Détails de l'entretien :<br/><br/>";
		contenu += "Date et heure : " + interviewDateTime + "<br/>";
		contenu += locationOrLink + additionalNote + "<br/><br/>";
		contenu += "Nous vous prions de bien vouloir confirmer votre disponibilité en répondant à cet email.<br/><br/>";
		contenu += "Nous restons à votre disposition pour toute information complémentaire.<br/><br/>";
		contenu += "Cordialement,<br/>";
		contenu += "L'équipe de recrutement";
		
		// Préparer le contexte Thymeleaf
		context = new Context();
		String template = "blank";
		context.setVariable("contenu", contenu);
		context.setVariable("entete", "Convocation Entretien");
		context.setVariable("titre", "Convocation à un entretien");
		
		String body = "";
		Response<?> responseEmail = hostingUtils.sendEmail(from, toRecipients, subject, body, null, context, template, locale);
		
		if (responseEmail.isHasError()) {
			log.warning("Échec de l'envoi de l'email de convocation pour: " + application.getCandidateEmail());
			throw new Exception("Erreur lors de l'envoi de l'email");
		} else {
			log.info("Email de convocation envoyé avec succès à: " + application.getCandidateEmail());
		}
		
		log.info("----end sendInterviewEmail-----");
	}
}
