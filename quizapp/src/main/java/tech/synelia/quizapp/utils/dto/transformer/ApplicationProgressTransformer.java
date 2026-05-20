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
public interface ApplicationProgressTransformer {

    ApplicationProgressTransformer INSTANCE = Mappers.getMapper(ApplicationProgressTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
        @Mapping(source = "entity.startedAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "startedAt"),
        @Mapping(source = "entity.completedAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "completedAt"),
        @Mapping(source = "entity.applications.id", target = "applicationId"),
        @Mapping(source = "entity.applications.candidateFirstName", target = "candidateFirstName"),
        @Mapping(source = "entity.applications.candidateLastName", target = "candidateLastName"),
        @Mapping(source = "entity.pipelineStage.id", target = "pipelineStageId"),
        @Mapping(source = "entity.pipelineStage.stageLabel", target = "stageName"),
        @Mapping(source = "entity.pipelineStage.stageType", target = "stageType"),
        @Mapping(source = "entity.pipelineStage.stageOrder", target = "stageOrder"),
        @Mapping(source = "entity.decidedBy.id", target = "decidedById"),
        @Mapping(source = "entity.decidedBy.firstName", target = "decidedByFirstName"),
        @Mapping(source = "entity.decidedBy.lastName", target = "decidedByLastName"),
    })
    ApplicationProgressDto toDto(ApplicationProgress entity) throws ParseException;

    @Named("toLiteDto")
    default ApplicationProgressDto toLiteDto(ApplicationProgress entity) {
        if (entity == null) return null;
        ApplicationProgressDto dto = new ApplicationProgressDto();
        dto.setId(entity.getId());
        dto.setProgressStatus(entity.getProgressStatus());
        dto.setScore(entity.getScore());
        dto.setMailSent(entity.getMailSent());
        if (entity.getApplications() != null) {
            dto.setApplicationId(entity.getApplications().getId());
        }
        if (entity.getPipelineStage() != null) {
            dto.setPipelineStageId(entity.getPipelineStage().getId());
            dto.setStageType(entity.getPipelineStage().getStageType());
            dto.setStageName(entity.getPipelineStage().getStageLabel());
            dto.setStageOrder(entity.getPipelineStage().getStageOrder());
        }
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<ApplicationProgressDto> toDtos(List<ApplicationProgress> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<ApplicationProgressDto> toLiteDtos(List<ApplicationProgress> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<ApplicationProgressDto> dtos = new ArrayList<>();
        for (ApplicationProgress entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.progressStatus", target = "progressStatus"),
        @Mapping(source = "dto.score", target = "score"),
        @Mapping(source = "dto.notes", target = "notes"),
        @Mapping(source = "dto.mailSent", target = "mailSent"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
        @Mapping(source = "applications", target = "applications"),
        @Mapping(source = "pipelineStage", target = "pipelineStage"),
        @Mapping(source = "decidedBy", target = "decidedBy"),
        @Mapping(target = "createdAt", ignore = true),
        @Mapping(target = "updatedAt", ignore = true),
        @Mapping(target = "startedAt", ignore = true),
        @Mapping(target = "completedAt", ignore = true),
        @Mapping(target = "searchString", ignore = true),
    })
    ApplicationProgress toEntity(ApplicationProgressDto dto, Applications applications, PipelineStage pipelineStage, User decidedBy) throws ParseException;
}
