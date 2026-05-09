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
public interface AppConfigTransformer {

    AppConfigTransformer INSTANCE = Mappers.getMapper(AppConfigTransformer.class);

    @FullTransformerQualifier
    @Named("toFullDto")
    @Mappings({
        @Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
        @Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
    })
    AppConfigDto toDto(AppConfig entity) throws ParseException;

    @Named("toLiteDto")
    default AppConfigDto toLiteDto(AppConfig entity) {
        if (entity == null) return null;
        AppConfigDto dto = new AppConfigDto();
        dto.setId(entity.getId());
        dto.setConfigName(entity.getConfigName());
        dto.setCompanyName(entity.getCompanyName());
        dto.setAppLink(entity.getAppLink());
        dto.setPrimaryColor(entity.getPrimaryColor());
        dto.setColorScheme(entity.getColorScheme());
        dto.setCandidateAccountsEnabled(entity.getCandidateAccountsEnabled());
        dto.setIsActive(entity.getIsActive());
        return dto;
    }

    @IterableMapping(qualifiedByName = "toFullDto")
    List<AppConfigDto> toDtos(List<AppConfig> entities) throws ParseException;

    @IterableMapping(qualifiedByName = "toLiteDto")
    default List<AppConfigDto> toLiteDtos(List<AppConfig> entities) {
        if (entities == null || entities.isEmpty()) return new ArrayList<>();
        List<AppConfigDto> dtos = new ArrayList<>();
        for (AppConfig entity : entities) {
            dtos.add(toLiteDto(entity));
        }
        return dtos;
    }

    @Mappings({
        @Mapping(source = "dto.id", target = "id"),
        @Mapping(source = "dto.configName", target = "configName"),
        @Mapping(source = "dto.companyName", target = "companyName"),
        @Mapping(source = "dto.appLink", target = "appLink"),
        @Mapping(source = "dto.logoHtml", target = "logoHtml"),
        @Mapping(source = "dto.primaryColor", target = "primaryColor"),
        @Mapping(source = "dto.colorScheme", target = "colorScheme"),
        @Mapping(source = "dto.candidateAccountsEnabled", target = "candidateAccountsEnabled"),
        @Mapping(source = "dto.isActive", target = "isActive"),
        @Mapping(source = "dto.createdBy", target = "createdBy"),
        @Mapping(source = "dto.updatedBy", target = "updatedBy"),
        @Mapping(source = "dto.isDeleted", target = "isDeleted"),
    })
    AppConfig toEntity(AppConfigDto dto) throws ParseException;
}
