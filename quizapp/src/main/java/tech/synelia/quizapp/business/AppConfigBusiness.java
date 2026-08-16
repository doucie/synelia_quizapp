package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
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
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.AppConfig;
import tech.synelia.quizapp.dao.repository.*;

@Log
@Component
public class AppConfigBusiness implements IBasicBusiness<Request<AppConfigDto>, Response<AppConfigDto>> {

    @Autowired
    private AppConfigRepository appConfigRepository;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private TechnicalError technicalError;
    @Autowired
    private ExceptionUtils exceptionUtils;
    @PersistenceContext
    private EntityManager em;

    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

    @Override
    public Response<AppConfigDto> create(Request<AppConfigDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create AppConfig-----");
        Response<AppConfigDto> response = new Response<>();
        List<AppConfig> items = new ArrayList<>();

        for (AppConfigDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("configName", dto.getConfigName());
            fieldsToVerify.put("primaryColor", dto.getPrimaryColor());
            fieldsToVerify.put("colorScheme", dto.getColorScheme());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Validation enum strict colorScheme (D-013) -- whitelist alignee front COLOR_SCHEMES
            String csLower = dto.getColorScheme().toLowerCase(java.util.Locale.ROOT);
            java.util.List<String> validSchemes = java.util.Arrays.asList("violet", "blue", "green", "red", "orange", "teal", "indigo", "rose");
            if (!validSchemes.contains(csLower)) {
                throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("colorScheme invalide (violet/blue/green/red/orange/teal/indigo/rose) -> " + dto.getColorScheme(), locale));
            }
            dto.setColorScheme(csLower);

            AppConfig entityToSave = AppConfigTransformer.INSTANCE.toEntity(dto);
            entityToSave.setAppLink(normalizeOptionalText(dto.getAppLink()));
            entityToSave.setCreatedAt(Utilities.getCurrentDate());
            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            if (entityToSave.getIsActive() == null) entityToSave.setIsActive(false);
            if (entityToSave.getCandidateAccountsEnabled() == null) entityToSave.setCandidateAccountsEnabled(false);
            if (entityToSave.getCompanyName() == null) entityToSave.setCompanyName("Synelia");
            if (entityToSave.getAntiCheatEnabled() == null) entityToSave.setAntiCheatEnabled(false);
            if (entityToSave.getScreeningPolicy() == null) entityToSave.setScreeningPolicy("WARN");
            if (entityToSave.getTabSwitchMaxWarnings() == null) entityToSave.setTabSwitchMaxWarnings(3);
            if (entityToSave.getTabSwitchMaxActions() == null) entityToSave.setTabSwitchMaxActions(5);
            if (entityToSave.getFullscreenRequired() == null) entityToSave.setFullscreenRequired(false);
            if (entityToSave.getBlockShortcuts() == null) entityToSave.setBlockShortcuts(false);
            if (entityToSave.getBlockCopyPaste() == null) entityToSave.setBlockCopyPaste(false);
            validateScreeningPolicy(entityToSave.getScreeningPolicy(), locale);
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<AppConfig> itemsSaved = appConfigRepository.saveAll(items);
            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("app_config", locale));
            }
            List<AppConfigDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? AppConfigTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : AppConfigTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHttpCode(HttpStatus.CREATED.value());
            response.setStatus(status);
            response.setItems(itemsDto);
            response.setHasError(false);
        }
        log.info("----end create AppConfig-----");
        return response;
    }

    @Override
    public Response<AppConfigDto> update(Request<AppConfigDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update AppConfig-----");
        Response<AppConfigDto> response = new Response<>();
        List<AppConfig> items = new ArrayList<>();

        for (AppConfigDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            AppConfig entityToSave = appConfigRepository.findOne(dto.getId(), false);
            if (entityToSave == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("app_config id -> " + dto.getId(), locale));
            }

            if (Utilities.shouldUpdate(dto.getConfigName())) entityToSave.setConfigName(dto.getConfigName());
            if (Utilities.shouldUpdate(dto.getCompanyName())) entityToSave.setCompanyName(dto.getCompanyName());
            if (dto.getAppLink() == null || Utilities.shouldUpdate(dto.getAppLink())) entityToSave.setAppLink(normalizeOptionalText(dto.getAppLink()));
            if (dto.getLogoHtml() != null) entityToSave.setLogoHtml(dto.getLogoHtml());
            if (Utilities.shouldUpdate(dto.getPrimaryColor())) entityToSave.setPrimaryColor(dto.getPrimaryColor());
            if (Utilities.shouldUpdate(dto.getColorScheme())) {
                String csLower = dto.getColorScheme().toLowerCase(java.util.Locale.ROOT);
                java.util.List<String> validSchemes = java.util.Arrays.asList("violet", "blue", "green", "red", "orange", "teal", "indigo", "rose");
                if (!validSchemes.contains(csLower)) {
                    throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("colorScheme invalide (violet/blue/green/red/orange/teal/indigo/rose) -> " + dto.getColorScheme(), locale));
                }
                entityToSave.setColorScheme(csLower);
            }
            if (dto.getCandidateAccountsEnabled() != null) entityToSave.setCandidateAccountsEnabled(dto.getCandidateAccountsEnabled());
            if (dto.getAntiCheatEnabled() != null) entityToSave.setAntiCheatEnabled(dto.getAntiCheatEnabled());
            if (dto.getScreeningPolicy() != null) {
                validateScreeningPolicy(dto.getScreeningPolicy(), locale);
                entityToSave.setScreeningPolicy(dto.getScreeningPolicy());
            }
            if (dto.getTabSwitchMaxWarnings() != null) entityToSave.setTabSwitchMaxWarnings(dto.getTabSwitchMaxWarnings());
            if (dto.getTabSwitchMaxActions() != null) entityToSave.setTabSwitchMaxActions(dto.getTabSwitchMaxActions());
            if (dto.getFullscreenRequired() != null) entityToSave.setFullscreenRequired(dto.getFullscreenRequired());
            if (dto.getBlockShortcuts() != null) entityToSave.setBlockShortcuts(dto.getBlockShortcuts());
            if (dto.getBlockCopyPaste() != null) entityToSave.setBlockCopyPaste(dto.getBlockCopyPaste());
            if (dto.getIsActive() != null) entityToSave.setIsActive(dto.getIsActive());
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<AppConfig> itemsSaved = appConfigRepository.saveAll(items);
            List<AppConfigDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? AppConfigTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : AppConfigTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end update AppConfig-----");
        return response;
    }

    @Override
    public Response<AppConfigDto> delete(Request<AppConfigDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete AppConfig-----");
        Response<AppConfigDto> response = new Response<>();
        List<AppConfig> items = new ArrayList<>();

        for (AppConfigDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            AppConfig existingEntity = appConfigRepository.findOne(dto.getId(), false);
            if (existingEntity == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("app_config -> " + dto.getId(), locale));
            }

            existingEntity.setIsDeleted(true);
            existingEntity.setUpdatedAt(Utilities.getCurrentDate());
            existingEntity.setUpdatedBy(request.getUser());
            items.add(existingEntity);
        }

        if (!items.isEmpty()) {
            appConfigRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end delete AppConfig-----");
        return response;
    }

    @Override
    public Response<AppConfigDto> getByCriteria(Request<AppConfigDto> request, Locale locale) throws Exception {
        log.info("----begin get AppConfig-----");
        Response<AppConfigDto> response = new Response<>();
        List<AppConfig> items = appConfigRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<AppConfigDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? AppConfigTransformer.INSTANCE.toLiteDtos(items)
                    : AppConfigTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(appConfigRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("app_config", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get AppConfig-----");
        return response;
    }

    public AppConfig getActiveConfig() {
        return appConfigRepository.findActiveConfig(true, false);
    }

    private void validateScreeningPolicy(String policy, Locale locale) {
        if (policy == null) {
            return;
        }
        String normalized = policy.trim().toUpperCase(java.util.Locale.ROOT);
        if (!java.util.Arrays.asList("WARN", "FLAG", "FAIL").contains(normalized)) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "screeningPolicy invalide (WARN/FLAG/FAIL) -> " + policy, locale));
        }
    }

    private String normalizeOptionalText(String value) {
        if (!Utilities.notBlank(value)) {
            return null;
        }

        return value.trim();
    }

    public Response<AppConfigDto> activateConfig(Long configId, Integer userId) throws ParseException {
        log.info("----begin activateConfig-----");
        Response<AppConfigDto> response = new Response<>();
        AppConfig target = appConfigRepository.findOne(configId, false);
        if (target == null) {
            response.setHasError(true);
            return response;
        }

        // Deactivate all
        List<AppConfig> allConfigs = appConfigRepository.findByIsDeleted(false);
        for (AppConfig cfg : allConfigs) {
            if (cfg.getIsActive() != null && cfg.getIsActive()) {
                cfg.setIsActive(false);
                cfg.setUpdatedAt(Utilities.getCurrentDate());
                cfg.setUpdatedBy(userId);
                appConfigRepository.save(cfg);
            }
        }

        // Activate target
        target.setIsActive(true);
        target.setUpdatedAt(Utilities.getCurrentDate());
        target.setUpdatedBy(userId);
        AppConfig saved = appConfigRepository.save(target);

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(List.of(AppConfigTransformer.INSTANCE.toDto(saved)));
        response.setHasError(false);
        response.setStatus(status);
        log.info("----end activateConfig-----");
        return response;
    }
}
