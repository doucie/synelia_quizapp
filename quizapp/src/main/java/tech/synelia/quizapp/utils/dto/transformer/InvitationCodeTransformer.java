package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.*;

@Mapper
public interface InvitationCodeTransformer {

    InvitationCodeTransformer INSTANCE = Mappers.getMapper(InvitationCodeTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "updatedAt"),
        @Mapping(source = "entity.expiredAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "expiredAt"),
    })
    InvitationCodeDto toDto(InvitationCode entity) throws ParseException;

    @Named("toLiteDto")
    default InvitationCodeDto toLiteDto(InvitationCode entity) {
        if (entity == null) return null;
        InvitationCodeDto dto = new InvitationCodeDto();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setRole(entity.getRole());
        dto.setCode(entity.getCode());
        dto.setIsUsed(entity.getIsUsed());
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<InvitationCodeDto> toDtos(List<InvitationCode> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<InvitationCodeDto> toLiteDtos(List<InvitationCode> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<InvitationCodeDto> dtos = new ArrayList<>();
        for (InvitationCode entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.email", target = "email"),
        @Mapping(source = "dto.role", target = "role"),
        @Mapping(source = "dto.code", target = "code"),
        @Mapping(source = "dto.isUsed", target = "isUsed"),
        @Mapping(source = "dto.expiredAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "expiredAt"),
        @Mapping(source = "dto.createdAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "createdAt"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "updatedAt"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
        @Mapping(source = "dto.searchString", target = "searchString"),
    })
    InvitationCode toEntity(InvitationCodeDto dto) throws ParseException;
}
