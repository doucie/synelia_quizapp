/*
 * Created on 2025-08-22 ( Time 10:03:19 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2017 Savoir Faire Linux. All Rights Reserved.
 */

package tech.synelia.quizapp.user.managment;

import java.text.ParseException;
// import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.business.UserBusiness;
import tech.synelia.quizapp.business.InvitationCodeBusiness;
import tech.synelia.quizapp.business.PlatformReadinessService;
import tech.synelia.quizapp.dao.entity.AppConfig;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.repository.AppConfigRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
// import tech.synelia.quizapp.user.managment.UserManagmentRepository;
// import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.HostingUtils;
import tech.synelia.quizapp.utils.ParamsUtils;
// import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.Validate;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.UserDto;
// import tech.synelia.quizapp.user.managment.UserManagmentDto;
import tech.synelia.quizapp.utils.dto.transformer.UserTransformer;
import tech.synelia.quizapp.utils.enums.UserRole;

@Log
@Component
@EnableScheduling
public class UserManagmentBusiness {
	
	private Response<UserDto> response;
	@Autowired
	private UserBusiness userBusiness;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private AppConfigRepository appConfigRepository;
	@Autowired
	private UserManagmentRepository userManagmentRepository;
	@Autowired
	private FunctionalError functionalError;
	@PersistenceContext
	private EntityManager em;
	@Autowired
	private ParamsUtils paramsUtils;
	@Autowired
	private HostingUtils hostingUtils;
	@Autowired
	private tech.synelia.quizapp.security.JwtService jwtService;
	@Autowired
	private tech.synelia.quizapp.business.EmailTemplateBusiness emailTemplateBusiness;
	@Autowired
	private InvitationCodeBusiness invitationCodeBusiness;
	@Autowired
	private PlatformReadinessService platformReadinessService;

	private Context context;

	// private SimpleDateFormat dateFormat;
	// private SimpleDateFormat dateTimeFormat;

	private final String SENDER = "Template-Backend";
	private final String ENTETE = "Template-Backend";
	private final String TITRE = "Plateforme Template Backend";

	@SuppressWarnings("unused")
	public Response<UserDto> connexion(Request<UserDto> request, Locale locale) throws Exception {
		log.info("----begin connexion User-----");
		response = new Response<UserDto>();
		String tenancyCode = null;
		UserDto data = request.getData();
		Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
		fieldsToVerify.put("email", data.getEmail());
		fieldsToVerify.put("password", data.getPassword());
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}
		// find User - Recherche par email OU username
		String login = data.getEmail(); // Le champ email peut contenir un email ou un username
		List<User> users = userManagmentRepository.findByEmail(login, false);
		if (users == null || users.isEmpty()) {
			// Si pas trouvé par email, essayer par username
			users = userManagmentRepository.findByUsername(login, false);
		}
		User item = null;
		
		if (users != null && !users.isEmpty()) {
			// Vérifier le mot de passe avec BCrypt pour chaque utilisateur trouvé
			for (User user : users) {
				if (user.getPassword() != null) {
					// Vérifier si c'est un hash BCrypt (commence par $2a$, $2b$, $2x$, $2y$)
					if (user.getPassword().startsWith("$2")) {
						// Utiliser BCrypt pour vérifier
						if (Utilities.verifyBCryptPassword(data.getPassword(), user.getPassword())) {
							item = user;
							break;
						}
					} else {
						// Fallback : utiliser l'ancienne méthode SHA-1 pour la compatibilité
						if (user.getPassword().equals(Utilities.encrypt(data.getPassword()))) {
							item = user;
							// Optionnel : migrer vers BCrypt lors de la connexion
							// user.setPassword(Utilities.encryptWithBCrypt(data.getPassword()));
							// userRepository.save(user);
							break;
						}
					}
				}
			}
		}
		if (item == null) {
			response.setStatus(functionalError.LOGIN_FAIL(locale));
			response.setHasError(true);
			return response;
		}

		if (Utilities.isTrue(item.getIsLocked())) {
			response.setStatus(functionalError.DISALLOWED_OPERATION("Desole votre compte est verouille", locale));
			response.setHasError(true);
			return response;
		}

		if (isCandidateRole(item.getUserRole()) && !areCandidateAccountsEnabled()) {
			response.setStatus(functionalError.DISALLOWED_OPERATION(
					"La fonctionnalite de comptes candidats est desactivee.", locale));
			response.setHasError(true);
			return response;
		}

		item.setLastConnectionDate(Utilities.getCurrentDate());
		userRepository.save(item);

		List<User> items = Arrays.asList(item);
		if (items != null && !items.isEmpty()) {
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? UserTransformer.INSTANCE.toLiteDtos(items)
					: UserTransformer.INSTANCE.toDtos(items);
			final String tenantID = tenancyCode;
			final int size = items.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = userBusiness.getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setStatus(functionalError.SUCCESS("", locale));
			
			// Générer le JWT et l'inclure dans la réponse
			String jwt = jwtService.generateToken(item.getId(), item.getEmail(), item.getUserRole());
			response.setSessionUser(jwt);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("user", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end connexion User-----");
		return response;
	}

	@SuppressWarnings("unused")
	public Response<UserDto> deconnexion(Request<UserDto> request, Locale locale) {
		log.info("----begin deconnexion-----");
		response = new Response<UserDto>();

		Map<String, java.lang.Object> fieldsToVerifyUser = new HashMap<String, java.lang.Object>();
		fieldsToVerifyUser.put("user", request.getUser());
		if (!Validate.RequiredValue(fieldsToVerifyUser).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}
		UserDto data = request.getData();
		// Definir les parametres obligatoires
		Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
		fieldsToVerify.put("login", data.getId());
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}

		User item = userRepository.findOne(data.getId(), Boolean.FALSE);
		if (item == null) {
			response.setStatus(functionalError.DATA_NOT_EXIST("user ->" + data.getId(), locale));
			response.setHasError(true);
			return response;
		}

		if (item != null && !item.getId().equals(request.getUser())) {
			response.setStatus(functionalError
					.DISALLOWED_OPERATION("Désolé! vous être déja connecté avec ce utilisateur", locale));
			response.setHasError(true);
			return response;
		}
		userRepository.save(item);

		response.setStatus(functionalError.SUCCESS("Vous être déconnecté", locale));
		response.setHasError(false);
		log.info("----end deconnexion-----");
		return response;
	}

	@SuppressWarnings("unused")
	public Response<UserDto> changerMotDePasse(Request<UserManagmentDto> request, Locale locale) throws Exception {
		log.info("----begin changerMotDePasse-----");

		response = new Response<UserDto>();

		UserManagmentDto dto = request.getData();
		// Definir les parametres obligatoires
		Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
		fieldsToVerify.put("email", dto.getEmail());
		fieldsToVerify.put("password", dto.getPassword());
		fieldsToVerify.put("oldPassword", dto.getOldPassword());
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}

		// verify if password is strong
		Map<String, Object> passValid = Utilities.validatePassword(dto.getPassword());

		if (Utilities.isTrue(Boolean.parseBoolean(passValid.get(Utilities.validePassState).toString()))) {
			response.setStatus(
					functionalError.INVALID_FORMAT(passValid.get(Utilities.validePassMessage).toString(), locale));
			response.setHasError(true);
			return response;
		}

		// Verify if user to authenticate exists - Updated pour BCrypt
		List<User> users = userManagmentRepository.findByEmail(dto.getEmail().trim(), false);
		User existingEntity = null;
		
		if (users != null && !users.isEmpty()) {
			// Vérifier l'ancien mot de passe avec BCrypt pour chaque utilisateur trouvé
			for (User user : users) {
				if (user.getPassword() != null) {
					// Vérifier si c'est un hash BCrypt (commence par $2a$, $2b$, $2x$, $2y$)
					if (user.getPassword().startsWith("$2")) {
						// Utiliser BCrypt pour vérifier l'ancien mot de passe
						if (Utilities.verifyBCryptPassword(dto.getOldPassword().trim(), user.getPassword())) {
							existingEntity = user;
							break;
						}
					} else {
						// Fallback : utiliser l'ancienne méthode SHA-1 pour la compatibilité
						if (user.getPassword().equals(Utilities.encrypt(dto.getOldPassword().trim()))) {
							existingEntity = user;
							break;
						}
					}
				}
			}
		}
		
		if (existingEntity == null) {
			response.setStatus(functionalError.LOGIN_FAIL(locale));
			response.setHasError(true);
			return response;
		}

		// verifier que le user connecter correspond à celui qui veut changer le
		// password
		if (!existingEntity.getId().equals(request.getUser())) {
			response.setStatus(functionalError
					.AUTH_FAIL("Vous ne pouvez pas modifier le mot de passe d'un autre utilisateur.", locale));
			response.setHasError(true);
			return response;
		}

		// Hasher le nouveau mot de passe avec BCrypt
		existingEntity.setPassword(Utilities.encryptWithBCrypt(dto.getPassword().trim()));
		existingEntity.setIsDefaultPassword(false);
		existingEntity = userRepository.save(existingEntity);

		response.setStatus(functionalError.SUCCESS("", locale));
		response.setItem(UserTransformer.INSTANCE.toDto(existingEntity));
		response.setHasError(false);

		log.info("----end changerMotDePasse-----");

		return response;
	}

	@SuppressWarnings("unused")
	@Transactional
	public Response<UserDto> changerEmail(Request<UserManagmentDto> request, Locale locale) throws Exception {
		log.info("----begin changerEmail-----");

		response = new Response<UserDto>();

		UserManagmentDto dto = request.getData();
		Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
		fieldsToVerify.put("email", dto.getEmail());
		fieldsToVerify.put("oldPassword", dto.getOldPassword());
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}

		User currentUser = userRepository.findOne(request.getUser(), false);
		if (currentUser == null) {
			response.setStatus(functionalError.AUTH_FAIL("Utilisateur introuvable.", locale));
			response.setHasError(true);
			return response;
		}

		if (!passwordMatches(currentUser, dto.getOldPassword().trim())) {
			response.setStatus(functionalError.LOGIN_FAIL(locale));
			response.setHasError(true);
			return response;
		}

		String nextEmail = dto.getEmail().trim().toLowerCase(Locale.ROOT);
		if (nextEmail.equalsIgnoreCase(currentUser.getEmail())) {
			response.setStatus(functionalError.SUCCESS("", locale));
			response.setItem(UserTransformer.INSTANCE.toDto(currentUser));
			response.setHasError(false);
			log.info("----end changerEmail-----");
			return response;
		}

		User existingUser = userRepository.findByEmail(nextEmail, false);
		if (existingUser != null && !existingUser.getId().equals(currentUser.getId())) {
			response.setStatus(functionalError.DATA_EXIST("user email -> " + nextEmail, locale));
			response.setHasError(true);
			return response;
		}

		currentUser.setEmail(nextEmail);
		currentUser.setUpdatedAt(Utilities.getCurrentDate());
		currentUser.setUpdatedBy(request.getUser());
		currentUser.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(currentUser)));
		currentUser = userRepository.save(currentUser);

		response.setStatus(functionalError.SUCCESS("", locale));
		response.setItem(UserTransformer.INSTANCE.toDto(currentUser));
		response.setHasError(false);

		log.info("----end changerEmail-----");

		return response;
	}

	@SuppressWarnings("unused")
	public Response<UserDto> reinitialiserMotDePasse(Request<UserDto> request, Locale locale) throws Exception {
		log.info("----begin reinitialiserMotDePasse User-----");

		response = new Response<UserDto>();

		List<User> items = new ArrayList<>();
		User existingEntity = null;

		UserDto dto = request.getData();
		// Definir les parametres obligatoires
		Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
		fieldsToVerify.put("email", dto.getEmail());
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}

		existingEntity = userRepository.findByEmail(dto.getEmail(), false);
		if (existingEntity == null) {
			response.setStatus(functionalError.DATA_NOT_EXIST("utilisateur ->" + dto.getEmail(), locale));
			response.setHasError(true);
			return response;
		}

		if (!Utilities.notBlank(existingEntity.getEmail())) {
			response.setStatus(functionalError.DATA_NOT_EXIST("utilisateur --email", locale));
			response.setHasError(true);
			return response;
		}

		platformReadinessService.requireEmailDeliveryAvailable("PASSWORD_RESET", "password_reset", locale);

		Date targetTime = new Date(); // now
		targetTime = DateUtils.addHours(targetTime, 48); // add // 48// hours
		String validationCode = Utilities.generateAlphanumericCode(8);
		existingEntity.setIsDefaultPassword(Boolean.TRUE);
		// Utiliser BCrypt pour hasher le nouveau mot de passe généré
		existingEntity.setPassword(Utilities.encryptWithBCrypt(validationCode));

		List<User> utilisateurs = Arrays.asList(existingEntity);
		if (Utilities.isNotEmpty(utilisateurs)) {
			// set mail to user
			Map<String, String> from = new HashMap<>();
			from.put("email", paramsUtils.getSmtpLogin());
			from.put("user", SENDER);
			// recipients
			List<Map<String, String>> toRecipients = new ArrayList<Map<String, String>>();
			utilisateurs.stream().forEach(user -> {
				Map<String, String> recipient = new HashMap<String, String>();
				recipient = new HashMap<String, String>();
				recipient.put("email", user.getEmail());
				toRecipients.add(recipient);
			});
			// choisir la vraie url
			String appLink = paramsUtils.getUrlAppl();
			// subject et contenu
			String subject;
			String contenu;

			EmailTemplate emailTemplate = platformReadinessService.requireActiveEmailTemplate(
					"PASSWORD_RESET", "password_reset", locale);
			Map<String, String> vars = new HashMap<>();
			vars.put("first_name", existingEntity.getFirstName());
			vars.put("last_name", existingEntity.getLastName());
			vars.put("email", existingEntity.getEmail());
			vars.put("new_password", validationCode);
			vars.put("app_link", appLink);
			subject = emailTemplateBusiness.renderSubjectTemplate(emailTemplate, vars);
			contenu = emailTemplateBusiness.renderBodyTemplate(emailTemplate, vars);
			String body = "";
			context = new Context();
			String template = "blank";
			context.setVariable("contenu", contenu);
			context.setVariable("entete", ENTETE);
			context.setVariable("titre", TITRE);
			context.setVariable("appLink", appLink);
			Response<UserDto> responseEnvoiEmail = hostingUtils.sendEmail(from, toRecipients, subject, body, null, context, template, locale);
			if (responseEnvoiEmail.isHasError()) {
				response.setStatus(responseEnvoiEmail.getStatus());
				response.setHasError(true);
				return response;
			} else {
				// inserer les données en base de données
				existingEntity.setIsDefaultPassword(Boolean.TRUE);
				userRepository.save(existingEntity);
				// Renseigner les données à retourner dans la reponse
				response.setStatus(functionalError
						.SUCCESS("un mail vous a ete envoye à l'adresse" + existingEntity.getEmail(), locale));
			}
		}
		items.add(existingEntity);

		if (!items.isEmpty()) {
			List<User> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = userRepository.saveAll((Iterable<User>) items);
			if (itemsSaved == null) {
				response.setStatus(functionalError.SAVE_FAIL("utilisateur", locale));
				response.setHasError(true);
				return response;
			}

			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? UserTransformer.INSTANCE.toLiteDtos(items)
					: UserTransformer.INSTANCE.toDtos(items);
			final int size = items.size();
			itemsDto.parallelStream().forEach(ldto -> {
				try {
					ldto = userBusiness.getFullInfos(ldto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					e.printStackTrace();
				}
			});
			response.setItems(itemsDto);
			response.setCount(1L);
			response.setHasError(false);
			response.setStatus(functionalError.SUCCESS("mot de passe reinitialisé", locale));
		}
		log.info("----end reinitialiserMotDePasse User-----");
		return response;
	}

	@SuppressWarnings("unused")
	@Transactional(rollbackFor = { RuntimeException.class, Exception.class })
	public Response<UserDto> verrouiller(Request<UserDto> request, Locale locale) throws ParseException {
		log.info("----begin verrouiller User-----");

		response = new Response<UserDto>();

		Map<String, java.lang.Object> fieldsToVerifyUser = new HashMap<String, java.lang.Object>();
		fieldsToVerifyUser.put("user", request.getUser());
		if (!Validate.RequiredValue(fieldsToVerifyUser).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}

		List<User> items = new ArrayList<User>();

		for (UserDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
				response.setHasError(true);
				return response;
			}
			User requester = userRepository.findOne(request.getUser(), false);
			if (requester == null) {
				response.setStatus(functionalError.DATA_EXIST("User [" + request.getUser() + "] inexistant", locale));
				response.setHasError(true);
				return response;
			}

			// Verify if utilisateur to insert do not exist
			User entityToLock = null;
			entityToLock = userRepository.findOne(dto.getId(), false);
			if (entityToLock == null) {
				response.setStatus(functionalError.DATA_NOT_EXIST("User -> " + dto.getId(), locale));
				response.setHasError(true);
				return response;
			}

			if (entityToLock.getIsLocked() != null && entityToLock.getIsLocked()) {
				response.setStatus(functionalError.DISALLOWED_OPERATION("Désolé, ce compte est déjà verrouillé.", locale));
				response.setHasError(true);
				return response;
			}

			entityToLock.setIsLocked(true);

			items.add(entityToLock);
		}

		if (!items.isEmpty()) {
			List<User> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = userRepository.saveAll((Iterable<User>) items);
			if (itemsSaved == null) {
				response.setStatus(functionalError.SAVE_FAIL("user", locale));
				response.setHasError(true);
				return response;
			}
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? UserTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: UserTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = userBusiness.getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			response.setItems(itemsDto);
			response.setStatus(functionalError.SUCCESS("compte utilisateur vérrouillé", locale));
			response.setHasError(false);
		}
		log.info("----end verrouiller User-----");

		return response;
	}

	@SuppressWarnings("unused")
	@Transactional(rollbackFor = { RuntimeException.class, Exception.class })
	public Response<UserDto> déverrouiller(Request<UserDto> request, Locale locale) throws ParseException {
		log.info("----begin déverrouiller User-----");

		response = new Response<UserDto>();

		Map<String, java.lang.Object> fieldsToVerifyUser = new HashMap<String, java.lang.Object>();
		fieldsToVerifyUser.put("user", request.getUser());
		if (!Validate.RequiredValue(fieldsToVerifyUser).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}

		List<User> items = new ArrayList<User>();
		
		for (UserDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
				response.setHasError(true);
				return response;
			}
			User requester = userRepository.findOne(request.getUser(), false);
			if (requester == null) {
				response.setStatus(
						functionalError.DATA_EXIST("utilisateur [" + request.getUser() + "] inexistant", locale));
				response.setHasError(true);
				return response;
			}

			// Verify if utilisateur to insert do not exist
			User entityToLock = null;
			entityToLock = userRepository.findOne(dto.getId(), false);
			if (entityToLock == null) {
				response.setStatus(functionalError.DATA_NOT_EXIST("utilisateur -> " + dto.getId(), locale));
				response.setHasError(true);
				return response;
			}
			
			if (entityToLock.getIsLocked() != null && !entityToLock.getIsLocked()) {
				response.setStatus(functionalError.DISALLOWED_OPERATION("Désolé, ce compte est déjà deverrouillé.", locale));
				response.setHasError(true);
				return response;
			}
			entityToLock.setIsLocked(false);
			items.add(entityToLock);
		}

		if (!items.isEmpty()) {
			List<User> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = userRepository.saveAll((Iterable<User>) items);
			if (itemsSaved == null) {
				response.setStatus(functionalError.SAVE_FAIL("user", locale));
				response.setHasError(true);
				return response;
			}
			List<UserDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
					? UserTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: UserTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = userBusiness.getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			response.setItems(itemsDto);
			response.setStatus(functionalError.SUCCESS("compte utilisateur déverrouillé", locale));
			response.setHasError(false);
		}

		log.info("----end déverrouiller User-----");

		return response;
	}

	/**
	 * Tâche programmée qui marque automatiquement les utilisateurs comme hors ligne
	 * si ils n'ont pas eu d'activité depuis plus de 2 minutes
	 * S'exécute toutes les minutes
	 */
	@Scheduled(fixedRate = 60000) // Toutes les minutes (60 secondes)
	public void cleanupInactiveUsers() {
		try {
			log.fine("[CLEANUP] Début du nettoyage des utilisateurs inactifs");
			
			// Calculer la date limite (2 minutes dans le passé)
			Date timeoutThreshold = new Date(System.currentTimeMillis() - (2 * 60 * 1000)); // 2 minutes
			
			// Trouver tous les utilisateurs marqués comme en ligne mais inactifs
			List<User> inactiveUsers = userRepository.findInactiveOnlineUsers(timeoutThreshold);
			
			if (inactiveUsers != null && !inactiveUsers.isEmpty()) {
				log.fine("[CLEANUP] " + inactiveUsers.size() + " utilisateurs inactifs détectés");
				
				// Marquer ces utilisateurs comme hors ligne
				for (User user : inactiveUsers) {
					user.setIsOnline(false);
					user.setUpdatedAt(new Date());
					log.fine("[CLEANUP] Utilisateur " + user.getId() + " (" + user.getUsername() + ") marqué hors ligne (inactif depuis " + user.getLastConnectionDate() + ")");
				}
				
				// Sauvegarder les modifications
				userRepository.saveAll(inactiveUsers);
				log.fine("[CLEANUP] " + inactiveUsers.size() + " utilisateurs marqués comme hors ligne");
			} else {
				log.fine("[CLEANUP] Aucun utilisateur inactif détecté");
			}
			
		} catch (Exception e) {
			log.severe("[CLEANUP] Erreur lors du nettoyage des utilisateurs inactifs: " + e.getMessage());
			e.printStackTrace();
		}
	}

	/**
	 * Register a new user using an invitation code.
	 * Public endpoint - no authentication required.
	 */
	@SuppressWarnings("unused")
	public Response<UserDto> registerWithCode(Request<UserManagmentDto> request, Locale locale) throws Exception {
		log.info("----begin registerWithCode-----");
		response = new Response<UserDto>();

		UserManagmentDto dto = request.getData();
		Map<String, Object> fieldsToVerify = new HashMap<>();
		fieldsToVerify.put("code", dto.getCode());
		fieldsToVerify.put("firstName", dto.getFirstName());
		fieldsToVerify.put("lastName", dto.getLastName());
		fieldsToVerify.put("password", dto.getPassword());
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			response.setStatus(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			response.setHasError(true);
			return response;
		}

		// Validate invitation code
		Response<tech.synelia.quizapp.utils.dto.InvitationCodeDto> codeResponse = invitationCodeBusiness.validateCode(dto.getCode(), locale);
		if (codeResponse.isHasError()) {
			response.setStatus(codeResponse.getStatus());
			response.setHasError(true);
			return response;
		}

		tech.synelia.quizapp.utils.dto.InvitationCodeDto invitation = codeResponse.getItem();

		if (isCandidateRole(invitation.getRole()) && !areCandidateAccountsEnabled()) {
			response.setStatus(functionalError.DISALLOWED_OPERATION(
					"La fonctionnalite de comptes candidats est desactivee.", locale));
			response.setHasError(true);
			return response;
		}

		// Validate password strength
		Map<String, Object> passValid = Utilities.validatePassword(dto.getPassword());
		if (Utilities.isTrue(Boolean.parseBoolean(passValid.get(Utilities.validePassState).toString()))) {
			response.setStatus(functionalError.INVALID_FORMAT(passValid.get(Utilities.validePassMessage).toString(), locale));
			response.setHasError(true);
			return response;
		}

		// Check email uniqueness
		User existingUser = userRepository.findByEmail(invitation.getEmail(), false);
		if (existingUser != null) {
			response.setStatus(functionalError.DATA_EXIST("Un compte existe déjà avec cet email -> " + invitation.getEmail(), locale));
			response.setHasError(true);
			return response;
		}

		// Create the user
		User newUser = new User();
		newUser.setEmail(invitation.getEmail());
		newUser.setFirstName(dto.getFirstName());
		newUser.setLastName(dto.getLastName());
		newUser.setUsername(dto.getFirstName().toLowerCase() + "." + dto.getLastName().toLowerCase());
		newUser.setPassword(Utilities.encryptWithBCrypt(dto.getPassword()));
		newUser.setUserRole(invitation.getRole());
		newUser.setIsDefaultPassword(false);
		newUser.setIsOnline(false);
		newUser.setIsLocked(false);
		newUser.setIsDeleted(false);
		newUser.setCreatedAt(Utilities.getCurrentDate());

		User savedUser = userRepository.save(newUser);
		if (savedUser == null) {
			response.setStatus(functionalError.SAVE_FAIL("user", locale));
			response.setHasError(true);
			return response;
		}

		// Mark invitation code as used
		invitationCodeBusiness.markAsUsed(dto.getCode());

		List<UserDto> itemsDto = Arrays.asList(UserTransformer.INSTANCE.toDto(savedUser));
		response.setItems(itemsDto);
		response.setHasError(false);
		response.setStatus(functionalError.SUCCESS("Compte créé avec succès", locale));

		log.info("----end registerWithCode-----");
		return response;
	}

	private boolean areCandidateAccountsEnabled() {
		AppConfig activeConfig = appConfigRepository.findActiveConfig(true, false);
		return activeConfig != null && Boolean.TRUE.equals(activeConfig.getCandidateAccountsEnabled());
	}

	private boolean isCandidateRole(String role) {
		return UserRole.CANDIDATE.getValue().equalsIgnoreCase(StringUtils.trimToEmpty(role));
	}

	private boolean passwordMatches(User user, String rawPassword) throws Exception {
		if (user == null || StringUtils.isBlank(rawPassword) || user.getPassword() == null) {
			return false;
		}

		if (user.getPassword().startsWith("$2")) {
			return Utilities.verifyBCryptPassword(rawPassword, user.getPassword());
		}

		return user.getPassword().equals(Utilities.encrypt(rawPassword));
	}

}
