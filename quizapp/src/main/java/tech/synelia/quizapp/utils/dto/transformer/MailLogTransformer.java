package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import tech.synelia.quizapp.dao.entity.MailLog;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.MailLogDto;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MailLogTransformer {

	MailLogTransformer INSTANCE = Mappers.getMapper(MailLogTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source = "entity.sentAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "sentAt"),
		@Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "createdAt"),
		@Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "updatedAt"),
	})
	MailLogDto toDto(MailLog entity) throws ParseException;

	@Named("toLiteDto")
	default MailLogDto toLiteDto(MailLog entity) {
		if (entity == null) {
			return null;
		}
		MailLogDto dto = new MailLogDto();
		dto.setId(entity.getId());
		dto.setRecipientEmail(entity.getRecipientEmail());
		dto.setSubject(entity.getSubject());
		dto.setStatus(entity.getStatus());
		return dto;
	}

	@IterableMapping(qualifiedByName = "toFullDto")
	List<MailLogDto> toDtos(List<MailLog> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<MailLogDto> toLiteDtos(List<MailLog> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<MailLogDto> dtos = new ArrayList<>();
		for (MailLog entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source = "dto.id", target = "id"),
		@Mapping(source = "dto.recipientEmail", target = "recipientEmail"),
		@Mapping(source = "dto.recipientUserId", target = "recipientUserId"),
		@Mapping(source = "dto.senderUserId", target = "senderUserId"),
		@Mapping(source = "dto.emailTemplateId", target = "emailTemplateId"),
		@Mapping(source = "dto.subject", target = "subject"),
		@Mapping(source = "dto.bodyPreview", target = "bodyPreview"),
		@Mapping(source = "dto.status", target = "status"),
		@Mapping(source = "dto.errorMessage", target = "errorMessage"),
		@Mapping(source = "dto.sentAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "sentAt"),
		@Mapping(source = "dto.createdAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "createdAt"),
		@Mapping(source = "dto.createdBy", target = "createdBy"),
		@Mapping(source = "dto.updatedAt", dateFormat = "dd/MM/yyyy HH:mm:ss", target = "updatedAt"),
		@Mapping(source = "dto.updatedBy", target = "updatedBy"),
		@Mapping(source = "dto.isDeleted", target = "isDeleted"),
		@Mapping(source = "dto.searchString", target = "searchString"),
	})
	MailLog toEntity(MailLogDto dto) throws ParseException;
}