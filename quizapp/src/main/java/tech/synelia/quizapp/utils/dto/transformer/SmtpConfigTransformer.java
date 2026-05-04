package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SmtpConfigTransformer {

    SmtpConfigTransformer INSTANCE = Mappers.getMapper(SmtpConfigTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
    })
    SmtpConfigDto toDto(SmtpConfig entity) throws ParseException;

    @Named("toLiteDto")
    default SmtpConfigDto toLiteDto(SmtpConfig entity) {
        if (entity == null) return null;
        SmtpConfigDto dto = new SmtpConfigDto();
        dto.setId(entity.getId());
        dto.setHost(entity.getHost());
        dto.setSenderEmail(entity.getSenderEmail());
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<SmtpConfigDto> toDtos(List<SmtpConfig> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<SmtpConfigDto> toLiteDtos(List<SmtpConfig> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<SmtpConfigDto> dtos = new ArrayList<>();
        for (SmtpConfig entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.host", target = "host"),
        @Mapping(source = "dto.port", target = "port"),
        @Mapping(source = "dto.username", target = "username"),
        @Mapping(source = "dto.password", target = "passwordEncrypted"),
        @Mapping(source = "dto.smtpAuth", target = "smtpAuth"),
        @Mapping(source = "dto.starttlsEnable", target = "starttlsEnable"),
        @Mapping(source = "dto.starttlsRequired", target = "starttlsRequired"),
        @Mapping(source = "dto.connectionTimeout", target = "connectionTimeout"),
        @Mapping(source = "dto.timeout", target = "timeout"),
        @Mapping(source = "dto.writeTimeout", target = "writeTimeout"),
        @Mapping(source = "dto.senderName", target = "senderName"),
        @Mapping(source = "dto.senderEmail", target = "senderEmail"),
        @Mapping(source = "dto.isActive", target = "isActive"),
        @Mapping(source = "dto.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
        @Mapping(source = "dto.searchString", target = "searchString"),
    })
    SmtpConfig toEntity(SmtpConfigDto dto) throws ParseException;
}
