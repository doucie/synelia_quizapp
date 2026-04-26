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
import tech.synelia.quizapp.dao.entity.UserBusinessGroup;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.BusinessGroup;
import tech.synelia.quizapp.dao.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Log
@Component
public class UserBusinessGroupBusiness implements IBasicBusiness<Request<UserBusinessGroupDto>, Response<UserBusinessGroupDto>> {

    @Autowired
    private UserBusinessGroupRepository userBusinessGroupRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BusinessGroupRepository businessGroupRepository;
    @Autowired
    private FunctionalError functionalError;
    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public Response<UserBusinessGroupDto> create(Request<UserBusinessGroupDto> request, Locale locale) throws ParseException {
        log.info("----begin create UserBusinessGroup-----");
        Response<UserBusinessGroupDto> response = new Response<>();
        List<UserBusinessGroup> items = new ArrayList<>();

        for (UserBusinessGroupDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("userId", dto.getUserId());
            fieldsToVerify.put("businessGroupId", dto.getBusinessGroupId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Verify user exists
            if (dto.getUserId() != null) {
                User user = userRepository.findOne(dto.getUserId(), false);
                if (user == null) {
                    response.setStatus(functionalError.DATA_NOT_EXIST("User", locale));
                    response.setHasError(true);
                    return response;
                }
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

            UserBusinessGroup entity = new UserBusinessGroup();
            if (dto.getUserId() != null) {
                User user = new User();
                user.setId(dto.getUserId());
                entity.setUser(user);
            }
            if (dto.getBusinessGroupId() != null) {
                BusinessGroup bg = new BusinessGroup();
                bg.setId(dto.getBusinessGroupId());
                entity.setBusinessGroup(bg);
            }
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(request.getUser());
            entity.setIsDeleted(false);
            entity.setIsModerator(dto.getIsModerator() != null ? dto.getIsModerator() : false);
            items.add(entity);
        }

        if (!items.isEmpty()) {
            List<UserBusinessGroup> saved = userBusinessGroupRepository.saveAll(items);
            List<UserBusinessGroupDto> dtos = UserBusinessGroupTransformer.INSTANCE.toDtos(saved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setStatus(status);
        }
        log.info("----end create UserBusinessGroup-----");
        return response;
    }

    @Override
    @Transactional
    public Response<UserBusinessGroupDto> update(Request<UserBusinessGroupDto> request, Locale locale) throws ParseException {
        log.info("----begin update UserBusinessGroup-----");
        Response<UserBusinessGroupDto> response = new Response<>();
        List<UserBusinessGroup> items = new ArrayList<>();

        for (UserBusinessGroupDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            UserBusinessGroup existing = userBusinessGroupRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("UserBusinessGroup id -> " + dto.getId(), locale));
            }

            if (dto.getUserId() != null) {
                User user = new User();
                user.setId(dto.getUserId());
                existing.setUser(user);
            }
            if (dto.getBusinessGroupId() != null) {
                BusinessGroup bg = new BusinessGroup();
                bg.setId(dto.getBusinessGroupId());
                existing.setBusinessGroup(bg);
            }
            if (dto.getIsModerator() != null) {
                existing.setIsModerator(dto.getIsModerator());
            }
            existing.setUpdatedAt(new Date());
            existing.setUpdatedBy(request.getUser());
            items.add(existing);
        }

        if (!items.isEmpty()) {
            List<UserBusinessGroup> saved = userBusinessGroupRepository.saveAll(items);
            List<UserBusinessGroupDto> dtos = UserBusinessGroupTransformer.INSTANCE.toDtos(saved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setStatus(status);
        }
        log.info("----end update UserBusinessGroup-----");
        return response;
    }

    @Override
    @Transactional
    public Response<UserBusinessGroupDto> delete(Request<UserBusinessGroupDto> request, Locale locale) throws ParseException {
        log.info("----begin delete UserBusinessGroup-----");
        Response<UserBusinessGroupDto> response = new Response<>();

        for (UserBusinessGroupDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            UserBusinessGroup existing = userBusinessGroupRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("UserBusinessGroup -> " + dto.getId(), locale));
            }

            existing.setIsDeleted(true);
            existing.setUpdatedAt(new Date());
            existing.setUpdatedBy(request.getUser());
            userBusinessGroupRepository.save(existing);
        }

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setHasError(false);
        response.setStatus(status);
        log.info("----end delete UserBusinessGroup-----");
        return response;
    }

    @Override
    public Response<UserBusinessGroupDto> getByCriteria(Request<UserBusinessGroupDto> request, Locale locale) throws ParseException {
        log.info("----begin get UserBusinessGroup by criteria-----");
        Response<UserBusinessGroupDto> response = new Response<>();

        try {
            List<UserBusinessGroup> items = userBusinessGroupRepository.getByCriteria(request, em, locale);

            if (items != null && !items.isEmpty()) {
                List<UserBusinessGroupDto> dtos = UserBusinessGroupTransformer.INSTANCE.toDtos(items);

                Status status = new Status();
                status.setCode(StatusCode.SUCCESS);
                status.setMessage(StatusMessage.SUCCESS);
                response.setItems(dtos);
                response.setHasError(false);
                response.setStatus(status);
                response.setCount(userBusinessGroupRepository.count(request, em, locale));
            } else {
                response.setStatus(functionalError.DATA_EMPTY("user_business_group", locale));
                response.setHasError(false);
                return response;
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        log.info("----end get UserBusinessGroup by criteria-----");
        return response;
    }
}
