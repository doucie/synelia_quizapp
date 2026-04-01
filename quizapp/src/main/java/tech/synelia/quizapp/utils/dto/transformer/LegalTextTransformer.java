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
public interface LegalTextTransformer {

    LegalTextTransformer INSTANCE = Mappers.getMapper(LegalTextTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
    })
    LegalTextDto toDto(LegalText entity) throws ParseException;

    @Named("toLiteDto")
    default LegalTextDto toLiteDto(LegalText entity) {
        if (entity == null) return null;
        LegalTextDto dto = new LegalTextDto();
        dto.setId(entity.getId());
        dto.setTextKey(entity.getTextKey());
        dto.setTitle(entity.getTitle());
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<LegalTextDto> toDtos(List<LegalText> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<LegalTextDto> toLiteDtos(List<LegalText> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<LegalTextDto> dtos = new ArrayList<>();
        for (LegalText entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.textKey", target = "textKey"),
        @Mapping(source = "dto.title", target = "title"),
        @Mapping(source = "dto.content", target = "content"),
        @Mapping(source = "dto.description", target = "description"),
        @Mapping(source = "dto.isActive", target = "isActive"),
        @Mapping(source = "dto.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
        @Mapping(source = "dto.searchString", target = "searchString"),
    })
    LegalText toEntity(LegalTextDto dto) throws ParseException;
}
