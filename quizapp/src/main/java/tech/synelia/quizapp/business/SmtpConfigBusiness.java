package tech.synelia.quizapp.business;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.SmtpConfig;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.SmtpConfigRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.HostingUtils;
import tech.synelia.quizapp.utils.ParamsUtils;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.Validate;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.SmtpConfigDto;
import tech.synelia.quizapp.utils.dto.transformer.SmtpConfigTransformer;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InternalErrorException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Log
@Component
public class SmtpConfigBusiness implements IBasicBusiness<Request<SmtpConfigDto>, Response<SmtpConfigDto>> {

    @Autowired
    private SmtpConfigRepository smtpConfigRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private HostingUtils hostingUtils;
    @Autowired
    private ParamsUtils paramsUtils;
    @PersistenceContext
    private EntityManager em;

    @Override
    public Response<SmtpConfigDto> create(Request<SmtpConfigDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create SmtpConfig-----");
        Response<SmtpConfigDto> response = new Response<>();
        List<SmtpConfig> items = new ArrayList<>();

        for (SmtpConfigDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("host", dto.getHost());
            fieldsToVerify.put("port", dto.getPort());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            SmtpConfig entityToSave = SmtpConfigTransformer.INSTANCE.toEntity(dto);
            entityToSave.setCreatedAt(Utilities.getCurrentDate());
            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            if (entityToSave.getIsActive() == null) entityToSave.setIsActive(false);
            entityToSave.setSearchString(buildSearchString(entityToSave));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            SmtpConfig activeConfigToKeep = getLastActiveConfig(items);
            normalizeSingleActiveSelection(items, activeConfigToKeep);
            if (activeConfigToKeep != null) {
                deactivateOtherActiveConfigs(activeConfigToKeep.getId(), request.getUser());
            }
            List<SmtpConfig> itemsSaved = smtpConfigRepository.saveAll(items);

            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("smtp_config", locale));
            }
            List<SmtpConfigDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? SmtpConfigTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : SmtpConfigTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHttpCode(HttpStatus.CREATED.value());
            response.setStatus(status);
            response.setItems(itemsDto);
            response.setHasError(false);
        }
        log.info("----end create SmtpConfig-----");
        return response;
    }

    @Override
    public Response<SmtpConfigDto> update(Request<SmtpConfigDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update SmtpConfig-----");
        Response<SmtpConfigDto> response = new Response<>();
        List<SmtpConfig> items = new ArrayList<>();

        for (SmtpConfigDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            SmtpConfig entityToSave = smtpConfigRepository.findOne(dto.getId(), false);
            if (entityToSave == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("smtp_config id -> " + dto.getId(), locale));
            }

            if (Utilities.shouldUpdate(dto.getHost())) entityToSave.setHost(dto.getHost());
            if (dto.getPort() != null) entityToSave.setPort(dto.getPort());
            if (Utilities.shouldUpdate(dto.getUsername())) entityToSave.setUsername(dto.getUsername());
            // Keep the existing password when the frontend omits the field during edition.
            if (dto.getPassword() != null && Utilities.shouldUpdate(dto.getPassword())) {
                entityToSave.setPasswordEncrypted(dto.getPassword());
            }
            if (dto.getSmtpAuth() != null) entityToSave.setSmtpAuth(dto.getSmtpAuth());
            if (dto.getStarttlsEnable() != null) entityToSave.setStarttlsEnable(dto.getStarttlsEnable());
            if (dto.getStarttlsRequired() != null) entityToSave.setStarttlsRequired(dto.getStarttlsRequired());
            if (dto.getConnectionTimeout() != null) entityToSave.setConnectionTimeout(dto.getConnectionTimeout());
            if (dto.getTimeout() != null) entityToSave.setTimeout(dto.getTimeout());
            if (dto.getWriteTimeout() != null) entityToSave.setWriteTimeout(dto.getWriteTimeout());
            if (Utilities.shouldUpdate(dto.getSenderName())) entityToSave.setSenderName(dto.getSenderName());
            if (Utilities.shouldUpdate(dto.getSenderEmail())) entityToSave.setSenderEmail(dto.getSenderEmail());
            if (dto.getIsActive() != null) entityToSave.setIsActive(dto.getIsActive());
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            entityToSave.setSearchString(buildSearchString(entityToSave));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            SmtpConfig activeConfigToKeep = getLastActiveConfig(items);
            normalizeSingleActiveSelection(items, activeConfigToKeep);
            if (activeConfigToKeep != null) {
                deactivateOtherActiveConfigs(activeConfigToKeep.getId(), request.getUser());
            }
            List<SmtpConfig> itemsSaved = smtpConfigRepository.saveAll(items);

            List<SmtpConfigDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? SmtpConfigTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : SmtpConfigTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end update SmtpConfig-----");
        return response;
    }

    @Override
    public Response<SmtpConfigDto> delete(Request<SmtpConfigDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete SmtpConfig-----");
        Response<SmtpConfigDto> response = new Response<>();
        List<SmtpConfig> items = new ArrayList<>();

        for (SmtpConfigDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            SmtpConfig existingEntity = smtpConfigRepository.findOne(dto.getId(), false);
            if (existingEntity == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("smtp_config -> " + dto.getId(), locale));
            }

            existingEntity.setIsDeleted(true);
            existingEntity.setUpdatedAt(Utilities.getCurrentDate());
            existingEntity.setUpdatedBy(request.getUser());
            items.add(existingEntity);
        }

        if (!items.isEmpty()) {
            smtpConfigRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end delete SmtpConfig-----");
        return response;
    }

    @Override
    public Response<SmtpConfigDto> getByCriteria(Request<SmtpConfigDto> request, Locale locale) throws Exception {
        log.info("----begin get SmtpConfig-----");
        Response<SmtpConfigDto> response = new Response<>();
        List<SmtpConfig> items = smtpConfigRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<SmtpConfigDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? SmtpConfigTransformer.INSTANCE.toLiteDtos(items)
                    : SmtpConfigTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(smtpConfigRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("smtp_config", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get SmtpConfig-----");
        return response;
    }

    public Response<SmtpConfigDto> testActiveConfig(Request<SmtpConfigDto> request, Locale locale) {
        log.info("----begin testActiveConfig-----");

        Map<String, Object> fieldsToVerify = new HashMap<>();
        fieldsToVerify.put("user", request.getUser());
        if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
        }

        User currentUser = userRepository.findOne(request.getUser(), false);
        if (currentUser == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + request.getUser(), locale));
        }
        if (!Utilities.notBlank(currentUser.getEmail())) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("email", locale));
        }

        SmtpConfig activeConfig = getActiveConfig();
        if (activeConfig == null || !Utilities.notBlank(activeConfig.getHost())) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Aucune configuration SMTP active n'est disponible pour cet envoi.", locale));
        }

        String senderEmail = resolveSenderEmail(activeConfig);
        if (!Utilities.notBlank(senderEmail)) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "La configuration SMTP active ne definit aucun email expediteur exploitable.", locale));
        }

        Map<String, String> from = new HashMap<>();
        from.put("email", senderEmail);
        from.put("user", Utilities.notBlank(activeConfig.getSenderName()) ? activeConfig.getSenderName() : "Synelia SMTP");

        Map<String, String> recipient = new HashMap<>();
        recipient.put("email", currentUser.getEmail().trim());
        recipient.put("user", buildDisplayName(currentUser));

        List<Map<String, String>> toRecipients = new ArrayList<>();
        toRecipients.add(recipient);

        StringBuilder body = new StringBuilder();
        body.append("<p>Ceci est un email de test SMTP envoye depuis l'administration QuizApp.</p>");
        body.append("<p>Configuration active : ")
                .append(activeConfig.getHost())
                .append(":")
                .append(activeConfig.getPort())
                .append(".</p>");

        Response<Object> emailResponse = hostingUtils.sendEmail(
                from,
                toRecipients,
                "Test SMTP QuizApp",
                body.toString(),
                null,
                null,
            null,
                locale);

        Response<SmtpConfigDto> response = new Response<>();
        if (emailResponse.isHasError()) {
            response.setHasError(true);
            response.setHttpCode(emailResponse.getHttpCode() > 0 ? emailResponse.getHttpCode() : HttpStatus.BAD_REQUEST.value());
            response.setStatus(emailResponse.getStatus());
            return response;
        }

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage("Email de test SMTP envoye a " + currentUser.getEmail().trim());
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);

        log.info("----end testActiveConfig-----");
        return response;
    }

    /**
     * Get the currently active SMTP configuration, if any.
     */
    public SmtpConfig getActiveConfig() {
        return smtpConfigRepository.findActiveConfig(true, false);
    }

    /**
     * Activate a config and deactivate all others.
     */
    public void activateConfig(Integer configId, Integer userId) {
        deactivateOtherActiveConfigs(configId, userId);

        // Activate the requested one
        SmtpConfig toActivate = smtpConfigRepository.findOne(configId, false);
        if (toActivate != null) {
            toActivate.setIsActive(true);
            toActivate.setUpdatedAt(Utilities.getCurrentDate());
            toActivate.setUpdatedBy(userId);
            toActivate.setSearchString(buildSearchString(toActivate));
            smtpConfigRepository.save(toActivate);
        }
    }

    private void normalizeSingleActiveSelection(List<SmtpConfig> items, SmtpConfig activeConfigToKeep) {
        if (items == null || items.isEmpty()) {
            return;
        }

        for (SmtpConfig item : items) {
            boolean shouldBeActive = activeConfigToKeep != null && item == activeConfigToKeep;
            item.setIsActive(shouldBeActive);
            item.setSearchString(buildSearchString(item));
        }
    }

    private void deactivateOtherActiveConfigs(Integer configIdToKeep, Integer userId) {
        List<SmtpConfig> activeConfigs = smtpConfigRepository.findByIsActiveAndIsDeleted(true, false);
        if (activeConfigs == null || activeConfigs.isEmpty()) {
            return;
        }

        List<SmtpConfig> configsToUpdate = new ArrayList<>();
        for (SmtpConfig config : activeConfigs) {
            if (configIdToKeep != null && config.getId().equals(configIdToKeep)) {
                continue;
            }
            config.setIsActive(false);
            config.setUpdatedAt(Utilities.getCurrentDate());
            config.setUpdatedBy(userId);
            config.setSearchString(buildSearchString(config));
            configsToUpdate.add(config);
        }

        if (!configsToUpdate.isEmpty()) {
            smtpConfigRepository.saveAll(configsToUpdate);
        }
    }

    private SmtpConfig getLastActiveConfig(List<SmtpConfig> items) {
        SmtpConfig activeConfig = null;
        for (SmtpConfig item : items) {
            if (Boolean.TRUE.equals(item.getIsActive()) && !Boolean.TRUE.equals(item.getIsDeleted())) {
                activeConfig = item;
            }
        }
        return activeConfig;
    }

    private String buildSearchString(SmtpConfig entity) {
        StringBuilder builder = new StringBuilder();
        appendSearchValue(builder, entity.getHost());
        appendSearchValue(builder, entity.getPort());
        appendSearchValue(builder, entity.getUsername());
        appendSearchValue(builder, entity.getSenderName());
        appendSearchValue(builder, entity.getSenderEmail());
        appendSearchValue(builder, entity.getIsActive());
        appendSearchValue(builder, entity.getIsDeleted());
        return builder.toString();
    }

    private void appendSearchValue(StringBuilder builder, Object value) {
        if (value == null) {
            return;
        }

        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return;
        }

        if (builder.length() > 0) {
            builder.append(' ');
        }
        builder.append(text);
    }

    private String resolveSenderEmail(SmtpConfig activeConfig) {
        if (Utilities.notBlank(activeConfig.getSenderEmail())) {
            return activeConfig.getSenderEmail().trim();
        }
        if (Utilities.notBlank(activeConfig.getUsername())) {
            return activeConfig.getUsername().trim();
        }
        if (Utilities.notBlank(paramsUtils.getSmtpLogin())) {
            return paramsUtils.getSmtpLogin().trim();
        }
        return null;
    }

    private String buildDisplayName(User currentUser) {
        StringBuilder builder = new StringBuilder();
        if (Utilities.notBlank(currentUser.getFirstName())) {
            builder.append(currentUser.getFirstName().trim());
        }
        if (Utilities.notBlank(currentUser.getLastName())) {
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(currentUser.getLastName().trim());
        }
        return builder.length() > 0 ? builder.toString() : currentUser.getEmail().trim();
    }
}
