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
import tech.synelia.quizapp.dao.entity.EmailVerificationToken;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.*;

@Log
@Component
public class EmailVerificationTokenBusiness implements IBasicBusiness<Request<EmailVerificationTokenDto>, Response<EmailVerificationTokenDto>> {

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Autowired
    private ApplicationsRepository applicationsRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FunctionalError functionalError;

    @Override
    @Transactional
    public Response<EmailVerificationTokenDto> create(Request<EmailVerificationTokenDto> request, Locale locale) throws ParseException {
        log.info("----begin create EmailVerificationToken-----");
        Response<EmailVerificationTokenDto> response = new Response<>();
        List<EmailVerificationToken> items = new ArrayList<>();

        for (EmailVerificationTokenDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("email", dto.getEmail());
            fieldsToVerify.put("token", dto.getToken());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            EmailVerificationToken entity = EmailVerificationTokenTransformer.INSTANCE.toEntity(dto);

            if (dto.getApplicationId() != null) {
                Applications app = applicationsRepository.findOne(dto.getApplicationId(), false);
                if (app != null) {
                    entity.setApplication(app);
                }
            }
            if (dto.getUserId() != null) {
                User user = userRepository.findOne(dto.getUserId(), false);
                if (user != null) {
                    entity.setUser(user);
                }
            }
            entity.setCreatedAt(new Date());
            entity.setIsUsed(false);
            items.add(entity);
        }

        if (!items.isEmpty()) {
            List<EmailVerificationToken> saved = emailVerificationTokenRepository.saveAll(items);
            List<EmailVerificationTokenDto> dtos = EmailVerificationTokenTransformer.INSTANCE.toDto(saved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setStatus(status);
        }
        log.info("----end create EmailVerificationToken-----");
        return response;
    }

    @Override
    @Transactional
    public Response<EmailVerificationTokenDto> update(Request<EmailVerificationTokenDto> request, Locale locale) throws ParseException {
        log.info("----begin update EmailVerificationToken-----");
        Response<EmailVerificationTokenDto> response = new Response<>();
        List<EmailVerificationToken> items = new ArrayList<>();

        for (EmailVerificationTokenDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            Optional<EmailVerificationToken> optExisting = emailVerificationTokenRepository.findById(dto.getId());
            if (optExisting.isEmpty()) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("EmailVerificationToken id -> " + dto.getId(), locale));
            }

            EmailVerificationToken existing = optExisting.get();
            if (dto.getEmail() != null) existing.setEmail(dto.getEmail());
            if (dto.getToken() != null) existing.setToken(dto.getToken());
            if (dto.getTokenType() != null) existing.setTokenType(dto.getTokenType());
            if (dto.getIsUsed() != null) existing.setIsUsed(dto.getIsUsed());

            if (dto.getApplicationId() != null) {
                Applications app = new Applications();
                app.setId(dto.getApplicationId());
                existing.setApplication(app);
            }
            if (dto.getUserId() != null) {
                User user = new User();
                user.setId(dto.getUserId());
                existing.setUser(user);
            }
            items.add(existing);
        }

        if (!items.isEmpty()) {
            List<EmailVerificationToken> saved = emailVerificationTokenRepository.saveAll(items);
            List<EmailVerificationTokenDto> dtos = EmailVerificationTokenTransformer.INSTANCE.toDto(saved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setStatus(status);
        }
        log.info("----end update EmailVerificationToken-----");
        return response;
    }

    @Override
    @Transactional
    public Response<EmailVerificationTokenDto> delete(Request<EmailVerificationTokenDto> request, Locale locale) throws ParseException {
        log.info("----begin delete EmailVerificationToken-----");
        Response<EmailVerificationTokenDto> response = new Response<>();

        for (EmailVerificationTokenDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            Optional<EmailVerificationToken> optExisting = emailVerificationTokenRepository.findById(dto.getId());
            if (optExisting.isEmpty()) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("EmailVerificationToken -> " + dto.getId(), locale));
            }

            // Hard delete since entity has no isDeleted field
            emailVerificationTokenRepository.delete(optExisting.get());
        }

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setHasError(false);
        response.setStatus(status);
        log.info("----end delete EmailVerificationToken-----");
        return response;
    }

    @Override
    public Response<EmailVerificationTokenDto> getByCriteria(Request<EmailVerificationTokenDto> request, Locale locale) throws ParseException {
        log.info("----begin get EmailVerificationToken by criteria-----");
        Response<EmailVerificationTokenDto> response = new Response<>();
        List<EmailVerificationToken> items;

        if (request.getData() != null && request.getData().getEmail() != null) {
            items = emailVerificationTokenRepository.findByEmailAndIsUsedFalse(request.getData().getEmail());
        } else {
            items = emailVerificationTokenRepository.findAll();
        }

        // Pagination
        long totalCount = items.size();
        if (request.getIndex() != null && request.getSize() != null) {
            int start = request.getIndex() * request.getSize();
            int end = Math.min(start + request.getSize(), items.size());
            items = start < items.size() ? items.subList(start, end) : new ArrayList<>();
        }

        List<EmailVerificationTokenDto> dtos = EmailVerificationTokenTransformer.INSTANCE.toDto(items);

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(dtos);
        response.setCount(totalCount);
        response.setHasError(false);
        response.setStatus(status);
        log.info("----end get EmailVerificationToken by criteria-----");
        return response;
    }
}
