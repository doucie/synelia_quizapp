/*
 * Java transformer for entity table decisions
 * Created on 2025-10-27 ( Time 12:00:00 )
 * Generator tool : Synelia Tools
 */

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

/**
 * TRANSFORMER for table "decisions"
 *
 * @author Synelia
 */
@Mapper
public interface DecisionTransformer {

    DecisionTransformer INSTANCE = Mappers.getMapper(DecisionTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source="entity.createdAt", dateFormat="yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", target="createdAt"),
        @Mapping(source="entity.updatedAt", dateFormat="yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", target="updatedAt"),
        @Mapping(source="entity.application.id", target="applicationId"),
        @Mapping(source="entity.user.id", target="userId"),
    })
    DecisionDto toDto(Decision entity) throws ParseException;

    @Named("toLiteDto")
    default DecisionDto toLiteDto(Decision entity) {
        if (entity == null) {
            return null;
        }
        DecisionDto dto = new DecisionDto();
        dto.setId(entity.getId());
        dto.setDecisionType(entity.getDecisionType());
        dto.setDecisionAction(entity.getDecisionAction());
        dto.setApplicationId(entity.getApplication() != null ? entity.getApplication().getId() : null);
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<DecisionDto> toDto(List<Decision> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    List<DecisionDto> toLiteDto(List<Decision> entities);

    @FullTransformerQualifier
    @Named("toFullEntity")
    @Mappings({
        @Mapping(source="dto.createdAt", dateFormat="yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", target="createdAt"),
        @Mapping(source="dto.updatedAt", dateFormat="yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", target="updatedAt"),
        @Mapping(target="application", ignore=true),
        @Mapping(target="user", ignore=true),
    })
    Decision toEntity(DecisionDto dto) throws ParseException;

    @Named("toLiteEntity")
    default Decision toLiteEntity(DecisionDto dto) {
        if (dto == null) {
            return null;
        }
        Decision entity = new Decision();
        entity.setId(dto.getId());
        entity.setDecisionType(dto.getDecisionType());
        entity.setDecisionAction(dto.getDecisionAction());
        if (dto.getApplicationId() != null) {
            Applications app = new Applications();
            app.setId(dto.getApplicationId());
            entity.setApplication(app);
        }
        if (dto.getUserId() != null) {
            User user = new User();
            user.setId(dto.getUserId());
            entity.setUser(user);
        }
        return entity;
    }

    @IterableMapping(qualifiedByName = "toFullEntity")
    List<Decision> toEntity(List<DecisionDto> dtos) throws ParseException;
}