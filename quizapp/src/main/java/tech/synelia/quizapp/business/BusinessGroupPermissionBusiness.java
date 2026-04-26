package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.BusinessGroupPermission;
import tech.synelia.quizapp.dao.entity.BusinessGroup;
import tech.synelia.quizapp.dao.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Log
@Component
public class BusinessGroupPermissionBusiness implements IBasicBusiness<Request<BusinessGroupPermissionDto>, Response<BusinessGroupPermissionDto>> {

    @Autowired
    private BusinessGroupPermissionRepository businessGroupPermissionRepository;
    @Autowired
    private BusinessGroupRepository businessGroupRepository;
    @Autowired
    private FunctionalError functionalError;
    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public Response<BusinessGroupPermissionDto> create(Request<BusinessGroupPermissionDto> request, Locale locale) throws ParseException {
        log.info("----begin create BusinessGroupPermission-----");
        Response<BusinessGroupPermissionDto> response = new Response<>();
        List<BusinessGroupPermission> items = new ArrayList<>();

        for (BusinessGroupPermissionDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("functionality", dto.getFunctionality());
            fieldsToVerify.put("businessGroupId", dto.getBusinessGroupId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Verify business group exists
            if (dto.getBusinessGroupId() != null) {
                BusinessGroup bg = businessGroupRepository.findOne(dto.getBusinessGroupId(), false);
                if (bg == null) {
                    response.setStatus(functionalError.DATA_NOT_EXIST("BusinessGroup", locale));
                    response.setHasError(true);
                    return response;
                }
            }

            BusinessGroupPermission entity = new BusinessGroupPermission();
            entity.setFunctionality(dto.getFunctionality());
            if (dto.getBusinessGroupId() != null) {
                BusinessGroup bg = new BusinessGroup();
                bg.setId(dto.getBusinessGroupId());
                entity.setBusinessGroup(bg);
            }
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(request.getUser());
            entity.setIsDeleted(false);
            items.add(entity);
        }

        if (!items.isEmpty()) {
            List<BusinessGroupPermission> saved = businessGroupPermissionRepository.saveAll(items);
            List<BusinessGroupPermissionDto> dtos = BusinessGroupPermissionTransformer.INSTANCE.toDtos(saved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setStatus(status);
        }
        log.info("----end create BusinessGroupPermission-----");
        return response;
    }

    @Override
    @Transactional
    public Response<BusinessGroupPermissionDto> update(Request<BusinessGroupPermissionDto> request, Locale locale) throws ParseException {
        log.info("----begin update BusinessGroupPermission-----");
        Response<BusinessGroupPermissionDto> response = new Response<>();
        List<BusinessGroupPermission> items = new ArrayList<>();

        for (BusinessGroupPermissionDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            BusinessGroupPermission existing = businessGroupPermissionRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("BusinessGroupPermission id -> " + dto.getId(), locale));
            }

            if (dto.getFunctionality() != null) {
                existing.setFunctionality(dto.getFunctionality());
            }
            if (dto.getBusinessGroupId() != null) {
                BusinessGroup bg = new BusinessGroup();
                bg.setId(dto.getBusinessGroupId());
                existing.setBusinessGroup(bg);
            }
            existing.setUpdatedAt(new Date());
            existing.setUpdatedBy(request.getUser());
            items.add(existing);
        }

        if (!items.isEmpty()) {
            List<BusinessGroupPermission> saved = businessGroupPermissionRepository.saveAll(items);
            List<BusinessGroupPermissionDto> dtos = BusinessGroupPermissionTransformer.INSTANCE.toDtos(saved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setStatus(status);
        }
        log.info("----end update BusinessGroupPermission-----");
        return response;
    }

    @Override
    @Transactional
    public Response<BusinessGroupPermissionDto> delete(Request<BusinessGroupPermissionDto> request, Locale locale) throws ParseException {
        log.info("----begin delete BusinessGroupPermission-----");
        Response<BusinessGroupPermissionDto> response = new Response<>();

        for (BusinessGroupPermissionDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            BusinessGroupPermission existing = businessGroupPermissionRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("BusinessGroupPermission -> " + dto.getId(), locale));
            }

            existing.setIsDeleted(true);
            existing.setUpdatedAt(new Date());
            existing.setUpdatedBy(request.getUser());
            businessGroupPermissionRepository.save(existing);
        }

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setHasError(false);
        response.setStatus(status);
        log.info("----end delete BusinessGroupPermission-----");
        return response;
    }

    @Override
    public Response<BusinessGroupPermissionDto> getByCriteria(Request<BusinessGroupPermissionDto> request, Locale locale) throws ParseException {
        log.info("----begin get BusinessGroupPermission by criteria-----");
        Response<BusinessGroupPermissionDto> response = new Response<>();

        try {
            List<BusinessGroupPermission> items = businessGroupPermissionRepository.getByCriteria(request, em, locale);

            if (items != null && !items.isEmpty()) {
                List<BusinessGroupPermissionDto> dtos = BusinessGroupPermissionTransformer.INSTANCE.toDtos(items);

                Status status = new Status();
                status.setCode(StatusCode.SUCCESS);
                status.setMessage(StatusMessage.SUCCESS);
                response.setItems(dtos);
                response.setHasError(false);
                response.setStatus(status);
                response.setCount(businessGroupPermissionRepository.count(request, em, locale));
            } else {
                response.setStatus(functionalError.DATA_EMPTY("business_group_permission", locale));
                response.setHasError(false);
                return response;
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        log.info("----end get BusinessGroupPermission by criteria-----");
        return response;
    }
}
