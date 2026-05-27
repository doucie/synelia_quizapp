

/*
 * Created on 2025-08-22 ( Time 11:38:40 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2017 Savoir Faire Linux. All Rights Reserved.
 */

package tech.synelia.quizapp.business.fact;

import java.text.ParseException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;   

import lombok.extern.java.Log;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.PermissionDeniedDataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Validate;
// import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.PermissionService;
import tech.synelia.quizapp.business.fact.BusinessFactory;


/**
 * BUSINESS factory
 *
 * @author Geo
 */
@Log
@Component
public class BusinessFactory<DTO> {

    @FunctionalInterface
    public interface BusinessOperation<DTO> {
        Response<DTO> execute(Request<DTO> request, Locale locale) throws Exception;
    }

    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils  exceptionUtils;
    @Autowired
    private PermissionService permissionService;

    /**
     * create entity by using dto as object.
     *
     * @param request
     * @return response
     * @throws JsonProcessingException
     */
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<DTO> create(IBasicBusiness<Request<DTO>, Response<DTO>> iBasicBusiness, Request<DTO> request, FunctionalityEnum functionalityEnum, Locale locale) throws ParseException, JsonProcessingException{
        Response<DTO> response = new Response<DTO>();
        try {
            checkUserAccess(request, functionalityEnum, locale);
            response = iBasicBusiness.create(request, locale);
        } catch (PermissionDeniedDataAccessException e) {
            exceptionUtils.PERMISSION_DENIED_DATA_ACCESS_EXCEPTION(response, locale, e);
        } catch (DataAccessResourceFailureException e) {
            exceptionUtils.DATA_ACCESS_RESOURCE_FAILURE_EXCEPTION(response, locale, e);
        } catch (DataAccessException e) {
            exceptionUtils.DATA_ACCESS_EXCEPTION(response, locale, e);
        } finally {
            if (response.isHasError() && response.getStatus() != null) {
                log.info(String.format("Erreur| code: {} -  message: {}", response.getStatus().getCode(), response.getStatus().getMessage()));
                Status status  = new Status();
                status.setMessage(response.getStatus().getMessage());
                status.setCode(response.getStatus().getCode());
                throw new InternalErrorException(status);
            }
        }
        return response;
    }

    /**
     * update entity by using dto as object.
     *
     * @param request
     * @return response
     * @throws JsonProcessingException
     */
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<DTO> update(IBasicBusiness<Request<DTO>, Response<DTO>> iBasicBusiness, Request<DTO> request, FunctionalityEnum functionalityEnum, Locale locale) throws ParseException, JsonProcessingException {
        Response<DTO> response = new Response<DTO>();
        try {
            checkUserAccess(request, functionalityEnum, locale);
            response = iBasicBusiness.update(request, locale);
        } catch (PermissionDeniedDataAccessException e) {
            exceptionUtils.PERMISSION_DENIED_DATA_ACCESS_EXCEPTION(response, locale, e);
        } catch (DataAccessResourceFailureException e) {
            exceptionUtils.DATA_ACCESS_RESOURCE_FAILURE_EXCEPTION(response, locale, e);
        } catch (DataAccessException e) {
            exceptionUtils.DATA_ACCESS_EXCEPTION(response, locale, e);
        } finally {
            if (response.isHasError() && response.getStatus() != null) {
                log.info(String.format("Erreur| code: {} -  message: {}", response.getStatus().getCode(), response.getStatus().getMessage()));
                Status status  = new Status();
                status.setMessage(response.getStatus().getMessage());
                status.setCode(response.getStatus().getCode());
                throw new InternalErrorException(status);
            }
        }
        return response;
    }

    /**
     * delete entity by using dto as object.
     *
     * @param request
     * @return response
     * @throws JsonProcessingException
     */
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<DTO> delete(IBasicBusiness<Request<DTO>, Response<DTO>> iBasicBusiness, Request<DTO> request, FunctionalityEnum functionalityEnum, Locale locale) throws ParseException, JsonProcessingException{
        Response<DTO> response = new Response<DTO>();
        try {
            checkUserAccess(request, functionalityEnum, locale);
            response = iBasicBusiness.delete(request, locale);
        } catch (PermissionDeniedDataAccessException e) {
            exceptionUtils.PERMISSION_DENIED_DATA_ACCESS_EXCEPTION(response, locale, e);
        } catch (DataAccessResourceFailureException e) {
            exceptionUtils.DATA_ACCESS_RESOURCE_FAILURE_EXCEPTION(response, locale, e);
        } catch (DataAccessException e) {
            exceptionUtils.DATA_ACCESS_EXCEPTION(response, locale, e);
        } finally {
            if (response.isHasError() && response.getStatus() != null) {
                log.info(String.format("Erreur| code: {} -  message: {}", response.getStatus().getCode(), response.getStatus().getMessage()));
                Status status  = new Status();
                status.setMessage(response.getStatus().getMessage());
                status.setCode(response.getStatus().getCode());
                throw new InternalErrorException(status);            
            }
        }
        return response;
    }

    /**
     * delete entity by using dto as object.
     *
     * @param request
     * @return response
     */
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<DTO> getByCriteria(IBasicBusiness<Request<DTO>, Response<DTO>> iBasicBusiness, Request<DTO> request, FunctionalityEnum functionalityEnum, Locale locale) throws Exception{
        Response<DTO> response = new Response<DTO>();
        try {
            checkUserAccess(request, functionalityEnum, locale);
            response = iBasicBusiness.getByCriteria(request, locale);
        } catch (PermissionDeniedDataAccessException e) {
            exceptionUtils.PERMISSION_DENIED_DATA_ACCESS_EXCEPTION(response, locale, e);
        } catch (DataAccessResourceFailureException e) {
            exceptionUtils.DATA_ACCESS_RESOURCE_FAILURE_EXCEPTION(response, locale, e);
        } catch (DataAccessException e) {
            exceptionUtils.DATA_ACCESS_EXCEPTION(response, locale, e);
        } finally {
            if (response.isHasError() && response.getStatus() != null) {
                log.info(String.format("Erreur| code: {} -  message: {}", response.getStatus().getCode(), response.getStatus().getMessage()));
                Status status  = new Status();
                status.setMessage(response.getStatus().getMessage());
                status.setCode(response.getStatus().getCode());
                throw new InternalErrorException(status);
            }
        }
        return response;
    }

    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<DTO> execute(Request<DTO> request, FunctionalityEnum functionalityEnum, Locale locale, BusinessOperation<DTO> operation) throws Exception {
        Response<DTO> response = new Response<DTO>();
        try {
            checkUserAccess(request, functionalityEnum, locale);
            response = operation.execute(request, locale);
        } catch (PermissionDeniedDataAccessException e) {
            exceptionUtils.PERMISSION_DENIED_DATA_ACCESS_EXCEPTION(response, locale, e);
        } catch (DataAccessResourceFailureException e) {
            exceptionUtils.DATA_ACCESS_RESOURCE_FAILURE_EXCEPTION(response, locale, e);
        } catch (DataAccessException e) {
            exceptionUtils.DATA_ACCESS_EXCEPTION(response, locale, e);
        } finally {
            if (response.isHasError() && response.getStatus() != null) {
                log.info(String.format("Erreur| code: {} -  message: {}", response.getStatus().getCode(), response.getStatus().getMessage()));
                Status status  = new Status();
                status.setMessage(response.getStatus().getMessage());
                status.setCode(response.getStatus().getCode());
                throw new InternalErrorException(status);
            }
        }
        return response;
    }

    private void checkUserAccess(Request<DTO> request, FunctionalityEnum functionalityEnum, Locale locale) {
        Integer authenticatedUserId = resolveAuthenticatedUserId();
        if (authenticatedUserId != null) {
            request.setUser(authenticatedUserId);
        }

        Map<String, java.lang.Object> fieldsToVerifyUser = new HashMap<String, java.lang.Object>();
        fieldsToVerifyUser.put("user", request.getUser());
        if (!Validate.RequiredValue(fieldsToVerifyUser).isGood()) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
        }
        // Vérifier la permission fonctionnelle (sauf DEFAULT qui est un pass-through)
        if (functionalityEnum != null && functionalityEnum != FunctionalityEnum.DEFAULT) {
            if (!permissionService.hasPermission(request.getUser(), functionalityEnum.name())) {
                throw new PermissionDeniedDataAccessException(
                        "Accès refusé pour la fonctionnalité : " + functionalityEnum.name(), null);
            }
        }
    }

    private Integer resolveAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Integer) {
            return (Integer) principal;
        }
        if (principal instanceof Number) {
            return ((Number) principal).intValue();
        }
        if (principal instanceof String principalValue
                && !principalValue.isBlank()
                && !"anonymousUser".equalsIgnoreCase(principalValue)) {
            try {
                return Integer.valueOf(principalValue);
            } catch (NumberFormatException exception) {
                return null;
            }
        }

        return null;
    }


}
