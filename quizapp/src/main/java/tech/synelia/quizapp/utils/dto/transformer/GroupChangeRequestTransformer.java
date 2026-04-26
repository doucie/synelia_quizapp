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
public interface GroupChangeRequestTransformer {

    GroupChangeRequestTransformer INSTANCE = Mappers.getMapper(GroupChangeRequestTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="createdAt"),
        @Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="updatedAt"),
        @Mapping(source="entity.requestedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="requestedAt"),
        @Mapping(source="entity.processedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="processedAt"),
        @Mapping(source="entity.user.id", target="userId"),
        @Mapping(source="entity.targetGroup.id", target="targetGroupId"),
    })
    GroupChangeRequestDto toDto(GroupChangeRequest entity) throws ParseException;

    @Named("toLiteDto")
    default GroupChangeRequestDto toLiteDto(GroupChangeRequest entity) {
        if (entity == null) {
            return null;
        }
        GroupChangeRequestDto dto = new GroupChangeRequestDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setTargetGroupId(entity.getTargetGroup() != null ? entity.getTargetGroup().getId() : null);
        dto.setStatus(entity.getStatus());
        dto.setReason(entity.getReason());
        // Enrich with display names
        if (entity.getUser() != null) {
            dto.setUserName((entity.getUser().getFirstName() != null ? entity.getUser().getFirstName() : "") + " " +
                            (entity.getUser().getLastName() != null ? entity.getUser().getLastName() : ""));
            dto.setUserEmail(entity.getUser().getEmail());
        }
        if (entity.getTargetGroup() != null) {
            dto.setTargetGroupName(entity.getTargetGroup().getGroupName());
        }
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<GroupChangeRequestDto> toDtos(List<GroupChangeRequest> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    List<GroupChangeRequestDto> toLiteDtos(List<GroupChangeRequest> entities);
}
