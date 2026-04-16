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
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.LegalText;
import tech.synelia.quizapp.dao.repository.*;

@Log
@Component
public class LegalTextBusiness implements IBasicBusiness<Request<LegalTextDto>, Response<LegalTextDto>> {

    @Autowired
    private LegalTextRepository legalTextRepository;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private TechnicalError technicalError;
    @Autowired
    private ExceptionUtils exceptionUtils;
    @PersistenceContext
    private EntityManager em;

    @Override
    public Response<LegalTextDto> create(Request<LegalTextDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create LegalText-----");
        Response<LegalTextDto> response = new Response<>();
        List<LegalText> items = new ArrayList<>();

        for (LegalTextDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("textKey", dto.getTextKey());
            fieldsToVerify.put("title", dto.getTitle());
            fieldsToVerify.put("content", dto.getContent());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Verify uniqueness
            LegalText existing = legalTextRepository.findByTextKey(dto.getTextKey(), false);
            if (existing != null) {
                throw new InternalErrorException(functionalError.DATA_EXIST("legal_text textKey -> " + dto.getTextKey(), locale));
            }

            LegalText entityToSave = LegalTextTransformer.INSTANCE.toEntity(dto);
            entityToSave.setCreatedAt(Utilities.getCurrentDate());
            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            if (entityToSave.getIsActive() == null) entityToSave.setIsActive(true);
            entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<LegalText> itemsSaved = legalTextRepository.saveAll(items);
            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("legal_text", locale));
            }
            List<LegalTextDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? LegalTextTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : LegalTextTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHttpCode(HttpStatus.CREATED.value());
            response.setStatus(status);
            response.setItems(itemsDto);
            response.setHasError(false);
        }
        log.info("----end create LegalText-----");
        return response;
    }

    @Override
    public Response<LegalTextDto> update(Request<LegalTextDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update LegalText-----");
        Response<LegalTextDto> response = new Response<>();
        List<LegalText> items = new ArrayList<>();

        for (LegalTextDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            LegalText entityToSave = legalTextRepository.findOne(dto.getId(), false);
            if (entityToSave == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("legal_text id -> " + dto.getId(), locale));
            }

            if (Utilities.shouldUpdate(dto.getTextKey())) entityToSave.setTextKey(dto.getTextKey());
            if (Utilities.shouldUpdate(dto.getTitle())) entityToSave.setTitle(dto.getTitle());
            if (Utilities.shouldUpdate(dto.getContent())) entityToSave.setContent(dto.getContent());
            if (Utilities.shouldUpdate(dto.getDescription())) entityToSave.setDescription(dto.getDescription());
            if (dto.getIsActive() != null) entityToSave.setIsActive(dto.getIsActive());
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<LegalText> itemsSaved = legalTextRepository.saveAll(items);
            List<LegalTextDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? LegalTextTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : LegalTextTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end update LegalText-----");
        return response;
    }

    @Override
    public Response<LegalTextDto> delete(Request<LegalTextDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete LegalText-----");
        Response<LegalTextDto> response = new Response<>();
        List<LegalText> items = new ArrayList<>();

        for (LegalTextDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            LegalText existingEntity = legalTextRepository.findOne(dto.getId(), false);
            if (existingEntity == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("legal_text -> " + dto.getId(), locale));
            }

            existingEntity.setIsDeleted(true);
            existingEntity.setUpdatedAt(Utilities.getCurrentDate());
            existingEntity.setUpdatedBy(request.getUser());
            items.add(existingEntity);
        }

        if (!items.isEmpty()) {
            legalTextRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end delete LegalText-----");
        return response;
    }

    @Override
    public Response<LegalTextDto> getByCriteria(Request<LegalTextDto> request, Locale locale) throws Exception {
        log.info("----begin get LegalText-----");
        Response<LegalTextDto> response = new Response<>();
        List<LegalText> items = legalTextRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<LegalTextDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? LegalTextTransformer.INSTANCE.toLiteDtos(items)
                    : LegalTextTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(legalTextRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("legal_text", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get LegalText-----");
        return response;
    }

    /**
     * Find a legal text by its key. Used by frontend pages.
     */
    public LegalText findByKey(String textKey) {
        return legalTextRepository.findByTextKey(textKey, false);
    }
}
