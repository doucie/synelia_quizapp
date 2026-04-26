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
import tech.synelia.quizapp.dao.repository.SmtpConfigRepository;
import tech.synelia.quizapp.utils.FunctionalError;
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
    private FunctionalError functionalError;
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
            entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            SmtpConfig activeConfigToKeep = getLastActiveConfig(items);
            List<SmtpConfig> itemsSaved = smtpConfigRepository.saveAll(items);

            if (activeConfigToKeep != null && activeConfigToKeep.getId() != null) {
                activateConfig(activeConfigToKeep.getId(), request.getUser());
                for (SmtpConfig savedItem : itemsSaved) {
                    savedItem.setIsActive(activeConfigToKeep.getId().equals(savedItem.getId()));
                }
            }

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
            if (dto.getPasswordEncrypted() != null && Utilities.shouldUpdate(dto.getPasswordEncrypted())) {
                entityToSave.setPasswordEncrypted(dto.getPasswordEncrypted());
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
            entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            SmtpConfig activeConfigToKeep = getLastActiveConfig(items);
            List<SmtpConfig> itemsSaved = smtpConfigRepository.saveAll(items);

            if (activeConfigToKeep != null && activeConfigToKeep.getId() != null) {
                activateConfig(activeConfigToKeep.getId(), request.getUser());
                for (SmtpConfig savedItem : itemsSaved) {
                    savedItem.setIsActive(activeConfigToKeep.getId().equals(savedItem.getId()));
                }
            }

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
        // Deactivate only currently active configs.
        List<SmtpConfig> activeConfigs = smtpConfigRepository.findByIsActiveAndIsDeleted(true, false);
        for (SmtpConfig config : activeConfigs) {
            if (!config.getId().equals(configId)) {
                config.setIsActive(false);
                config.setUpdatedAt(Utilities.getCurrentDate());
                config.setUpdatedBy(userId);
            }
        }

        if (!activeConfigs.isEmpty()) {
            smtpConfigRepository.saveAll(activeConfigs);
        }

        // Activate the requested one
        SmtpConfig toActivate = smtpConfigRepository.findOne(configId, false);
        if (toActivate != null) {
            toActivate.setIsActive(true);
            toActivate.setUpdatedAt(Utilities.getCurrentDate());
            toActivate.setUpdatedBy(userId);
            smtpConfigRepository.save(toActivate);
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
}
