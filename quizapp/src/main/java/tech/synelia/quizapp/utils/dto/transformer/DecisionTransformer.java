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
        @Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
        @Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
        @Mapping(source="entity.applicationProgress.applications.id", target="applicationId"),
        @Mapping(source="entity.user.id", target="userId"),
        @Mapping(source="entity.applicationProgress.id", target="applicationProgressId"),
        @Mapping(source="entity.cancelsDecision.id", target="cancelsDecisionId"),
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
        dto.setJustification(entity.getJustification());
        dto.setDecisionMode(entity.getDecisionMode());
        dto.setApplicationId(entity.getApplicationProgress() != null && entity.getApplicationProgress().getApplications() != null
                ? entity.getApplicationProgress().getApplications().getId() : null);
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setApplicationProgressId(entity.getApplicationProgress() != null ? entity.getApplicationProgress().getId() : null);
        dto.setCancelsDecisionId(entity.getCancelsDecision() != null ? entity.getCancelsDecision().getId() : null);
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<DecisionDto> toDto(List<Decision> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    List<DecisionDto> toLiteDto(List<Decision> entities);

    @FullTransformerQualifier
    @Named("toFullEntity")
    @Mappings({
        @Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
        @Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
        @Mapping(target="user", ignore=true),
        @Mapping(target="applicationProgress", ignore=true),
        @Mapping(target="cancelsDecision", ignore=true),
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
        entity.setJustification(dto.getJustification());
        entity.setDecisionMode(dto.getDecisionMode());
        if (dto.getUserId() != null) {
            User user = new User();
            user.setId(dto.getUserId());
            entity.setUser(user);
        }
        if (dto.getApplicationProgressId() != null) {
            ApplicationProgress progress = new ApplicationProgress();
            progress.setId(dto.getApplicationProgressId());
            entity.setApplicationProgress(progress);
        }
        if (dto.getCancelsDecisionId() != null) {
            Decision cancelsDecision = new Decision();
            cancelsDecision.setId(dto.getCancelsDecisionId());
            entity.setCancelsDecision(cancelsDecision);
        }
        return entity;
    }

    @IterableMapping(qualifiedByName = "toFullEntity")
    List<Decision> toEntity(List<DecisionDto> dtos) throws ParseException;
}