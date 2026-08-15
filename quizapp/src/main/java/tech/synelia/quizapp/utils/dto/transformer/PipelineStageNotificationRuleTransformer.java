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
public interface PipelineStageNotificationRuleTransformer {

    PipelineStageNotificationRuleTransformer INSTANCE = Mappers.getMapper(PipelineStageNotificationRuleTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
        @Mapping(source = "entity.pipelineStage.id", target = "pipelineStageId"),
        @Mapping(source = "entity.pipelineStage.stageLabel", target = "pipelineStageLabel"),
    })
    PipelineStageNotificationRuleDto toDto(PipelineStageNotificationRule entity) throws ParseException;

    @Named("toLiteDto")
    default PipelineStageNotificationRuleDto toLiteDto(PipelineStageNotificationRule entity) {
        if (entity == null) return null;
        PipelineStageNotificationRuleDto dto = new PipelineStageNotificationRuleDto();
        dto.setId(entity.getId());
        dto.setTriggerCode(entity.getTriggerCode());
        dto.setOutcomeCode(entity.getOutcomeCode());
        dto.setEmailTemplateId(entity.getEmailTemplateId());
        dto.setIsRequired(entity.getIsRequired());
        dto.setIsAutomatic(entity.getIsAutomatic());
        dto.setRequiresManualConfirmation(entity.getRequiresManualConfirmation());
        if (entity.getPipelineStage() != null) {
            dto.setPipelineStageId(entity.getPipelineStage().getId());
        }
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<PipelineStageNotificationRuleDto> toDtos(List<PipelineStageNotificationRule> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<PipelineStageNotificationRuleDto> toLiteDtos(List<PipelineStageNotificationRule> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<PipelineStageNotificationRuleDto> dtos = new ArrayList<>();
        for (PipelineStageNotificationRule entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.triggerCode", target = "triggerCode"),
        @Mapping(source = "dto.outcomeCode", target = "outcomeCode"),
        @Mapping(source = "dto.emailTemplateId", target = "emailTemplateId"),
        @Mapping(source = "dto.isRequired", target = "isRequired"),
        @Mapping(source = "dto.isAutomatic", target = "isAutomatic"),
        @Mapping(source = "dto.requiresManualConfirmation", target = "requiresManualConfirmation"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
        @Mapping(source = "pipelineStage", target = "pipelineStage"),
        @Mapping(target = "createdAt", ignore = true),
        @Mapping(target = "updatedAt", ignore = true),
        @Mapping(target = "searchString", ignore = true),
    })
    PipelineStageNotificationRule toEntity(PipelineStageNotificationRuleDto dto, PipelineStage pipelineStage) throws ParseException;
}
