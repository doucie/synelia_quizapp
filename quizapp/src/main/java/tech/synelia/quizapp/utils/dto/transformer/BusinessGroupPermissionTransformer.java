package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
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
public interface BusinessGroupPermissionTransformer {

    BusinessGroupPermissionTransformer INSTANCE = Mappers.getMapper(BusinessGroupPermissionTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="createdAt"),
        @Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="updatedAt"),
        @Mapping(source="entity.businessGroup.id", target="businessGroupId"),
    })
    BusinessGroupPermissionDto toDto(BusinessGroupPermission entity) throws ParseException;

    @Named("toLiteDto")
    default BusinessGroupPermissionDto toLiteDto(BusinessGroupPermission entity) {
        if (entity == null) {
            return null;
        }
        BusinessGroupPermissionDto dto = new BusinessGroupPermissionDto();
        dto.setId(entity.getId());
        dto.setFunctionality(entity.getFunctionality());
        dto.setBusinessGroupId(entity.getBusinessGroup() != null ? entity.getBusinessGroup().getId() : null);
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<BusinessGroupPermissionDto> toDtos(List<BusinessGroupPermission> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    List<BusinessGroupPermissionDto> toLiteDtos(List<BusinessGroupPermission> entities);

    @FullTransformerQualifier
    @Named("toFullEntity")
    @Mappings({
        @Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="createdAt"),
        @Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="updatedAt"),
        @Mapping(target="businessGroup", ignore=true),
    })
    BusinessGroupPermission toEntity(BusinessGroupPermissionDto dto) throws ParseException;

    @Named("toLiteEntity")
    default BusinessGroupPermission toLiteEntity(BusinessGroupPermissionDto dto) {
        if (dto == null) {
            return null;
        }
        BusinessGroupPermission entity = new BusinessGroupPermission();
        entity.setId(dto.getId());
        entity.setFunctionality(dto.getFunctionality());
        if (dto.getBusinessGroupId() != null) {
            BusinessGroup bg = new BusinessGroup();
            bg.setId(dto.getBusinessGroupId());
            entity.setBusinessGroup(bg);
        }
        return entity;
    }

    @IterableMapping(qualifiedByName = "toFullEntity")
    List<BusinessGroupPermission> toEntity(List<BusinessGroupPermissionDto> dtos) throws ParseException;
}
