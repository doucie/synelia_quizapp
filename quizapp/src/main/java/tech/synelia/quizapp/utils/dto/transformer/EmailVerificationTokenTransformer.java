/*
 * Java transformer for entity table email_verification_tokens
 * Created on 2025-10-08
 */

package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
import java.util.List;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import tech.synelia.quizapp.dao.entity.EmailVerificationToken;
import tech.synelia.quizapp.utils.contract.FullTransformerQualifier;
import tech.synelia.quizapp.utils.dto.EmailVerificationTokenDto;

/**
 * TRANSFORMER for table "email_verification_tokens"
 *
 * @author Generated
 */
@Mapper
public interface EmailVerificationTokenTransformer {

    EmailVerificationTokenTransformer INSTANCE = Mappers.getMapper(EmailVerificationTokenTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="createdAt"),
        @Mapping(source="entity.usedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="usedAt"),
        @Mapping(source="entity.expiresAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="expiresAt"),
        @Mapping(source="entity.application.id", target="applicationId"),
        @Mapping(source="entity.user.id", target="userId"),
    })
    EmailVerificationTokenDto toDto(EmailVerificationToken entity) throws ParseException;

    @Named("toLiteDto")
    default EmailVerificationTokenDto toLiteDto(EmailVerificationToken entity) {
        if (entity == null) {
            return null;
        }
        EmailVerificationTokenDto dto = new EmailVerificationTokenDto();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setToken(entity.getToken());
        dto.setTokenType(entity.getTokenType());
        dto.setIsUsed(entity.getIsUsed());
        if (entity.getApplication() != null) {
            dto.setApplicationId(entity.getApplication().getId());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
        }
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<EmailVerificationTokenDto> toDto(List<EmailVerificationToken> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    List<EmailVerificationTokenDto> toLiteDto(List<EmailVerificationToken> entities);

    @FullTransformerQualifier
    @Named("toFullEntity")
    @Mappings({
        @Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="createdAt"),
        @Mapping(source="dto.usedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="usedAt"),
        @Mapping(source="dto.expiresAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="expiresAt"),
        @Mapping(target="application", ignore=true), // Sera défini manuellement si nécessaire
        @Mapping(target="user", ignore=true), // Sera défini manuellement si nécessaire
    })
    EmailVerificationToken toEntity(EmailVerificationTokenDto dto) throws ParseException;

    @Named("toLiteEntity")
    default EmailVerificationToken toLiteEntity(EmailVerificationTokenDto dto) {
        if (dto == null) {
            return null;
        }
        EmailVerificationToken entity = new EmailVerificationToken();
        entity.setId(dto.getId());
        entity.setEmail(dto.getEmail());
        entity.setToken(dto.getToken());
        entity.setTokenType(dto.getTokenType());
        entity.setIsUsed(dto.getIsUsed());
        return entity;
    }

    @IterableMapping(qualifiedByName = "toLiteEntity")
    List<EmailVerificationToken> toEntity(List<EmailVerificationTokenDto> dtos) throws ParseException;
}