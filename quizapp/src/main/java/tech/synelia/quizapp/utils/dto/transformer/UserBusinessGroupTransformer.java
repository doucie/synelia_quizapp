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
public interface UserBusinessGroupTransformer {

    UserBusinessGroupTransformer INSTANCE = Mappers.getMapper(UserBusinessGroupTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="createdAt"),
        @Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="updatedAt"),
        @Mapping(source="entity.user.id", target="userId"),
        @Mapping(source="entity.businessGroup.id", target="businessGroupId"),
    })
    UserBusinessGroupDto toDto(UserBusinessGroup entity) throws ParseException;

    @Named("toLiteDto")
    default UserBusinessGroupDto toLiteDto(UserBusinessGroup entity) {
        if (entity == null) {
            return null;
        }
        UserBusinessGroupDto dto = new UserBusinessGroupDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setBusinessGroupId(entity.getBusinessGroup() != null ? entity.getBusinessGroup().getId() : null);
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<UserBusinessGroupDto> toDtos(List<UserBusinessGroup> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    List<UserBusinessGroupDto> toLiteDtos(List<UserBusinessGroup> entities);

    @FullTransformerQualifier
    @Named("toFullEntity")
    @Mappings({
        @Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="createdAt"),
        @Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="updatedAt"),
        @Mapping(target="user", ignore=true),
        @Mapping(target="businessGroup", ignore=true),
    })
    UserBusinessGroup toEntity(UserBusinessGroupDto dto) throws ParseException;

    @Named("toLiteEntity")
    default UserBusinessGroup toLiteEntity(UserBusinessGroupDto dto) {
        if (dto == null) {
            return null;
        }
        UserBusinessGroup entity = new UserBusinessGroup();
        entity.setId(dto.getId());
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
        return entity;
    }

    @IterableMapping(qualifiedByName = "toFullEntity")
    List<UserBusinessGroup> toEntity(List<UserBusinessGroupDto> dtos) throws ParseException;
}
