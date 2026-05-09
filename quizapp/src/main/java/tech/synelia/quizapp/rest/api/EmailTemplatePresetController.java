package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.EmailTemplatePresetDto;
import tech.synelia.quizapp.dao.entity.EmailTemplatePreset;
import tech.synelia.quizapp.dao.repository.EmailTemplatePresetRepository;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/emailTemplatePreset")
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class EmailTemplatePresetController {

    @Autowired
    private EmailTemplatePresetRepository presetRepository;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<EmailTemplatePresetDto>> create(@RequestBody Request<EmailTemplatePresetDto> request) throws ParseException {
        log.info("start method /emailTemplatePreset/create");

        Response<EmailTemplatePresetDto> response = new Response<>();
        List<EmailTemplatePresetDto> items = new ArrayList<>();

        if (request == null || request.getDatas() == null || request.getDatas().isEmpty()) {
            return ResponseEntity.badRequest().body(buildBadRequestResponse("Aucun preset à créer"));
        }

        for (EmailTemplatePresetDto dto : request.getDatas()) {
            String name = StringUtils.trimToNull(dto.getName());
            String category = StringUtils.trimToNull(dto.getCategory());
            String htmlStructure = StringUtils.trimToNull(dto.getHtmlStructure());

            if (name == null || category == null || htmlStructure == null) {
                return ResponseEntity.badRequest().body(buildBadRequestResponse("Nom, catégorie et structure HTML sont requis"));
            }

            EmailTemplatePreset entity = new EmailTemplatePreset();
            entity.setName(name);
            entity.setCategory(category);
            entity.setHtmlStructure(htmlStructure);
            entity.setPreviewImage(normalizeOptionalText(dto.getPreviewImage()));
            entity.setDescription(normalizeOptionalText(dto.getDescription()));
            entity.setIsDeleted(false);
            entity.setCreatedAt(Utilities.getCurrentDate());
            entity.setUpdatedAt(Utilities.getCurrentDate());

            EmailTemplatePreset saved = presetRepository.save(entity);
            items.add(toDto(saved));
        }

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(items);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.CREATED.value());
        response.setStatus(status);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().build().toUri();
        log.info("end method /emailTemplatePreset/create");
        return ResponseEntity.created(uri).body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<EmailTemplatePresetDto> update(@RequestBody Request<EmailTemplatePresetDto> request) throws ParseException {
        log.info("start method /emailTemplatePreset/update");

        if (request == null || request.getDatas() == null || request.getDatas().isEmpty()) {
            return buildBadRequestResponse("Aucun preset à mettre à jour");
        }

        Response<EmailTemplatePresetDto> response = new Response<>();
        List<EmailTemplatePresetDto> items = new ArrayList<>();

        for (EmailTemplatePresetDto dto : request.getDatas()) {
            if (dto.getId() == null) {
                return buildBadRequestResponse("L'identifiant du preset est requis");
            }

            EmailTemplatePreset entity = presetRepository.findOne(dto.getId(), false);
            if (entity == null) {
                return buildNotFoundResponse("Preset introuvable : " + dto.getId());
            }

            if (Utilities.shouldUpdate(dto.getName())) {
                entity.setName(normalizeOptionalText(dto.getName()));
            }
            if (Utilities.shouldUpdate(dto.getCategory())) {
                entity.setCategory(normalizeOptionalText(dto.getCategory()));
            }
            if (Utilities.shouldUpdate(dto.getHtmlStructure())) {
                entity.setHtmlStructure(normalizeOptionalText(dto.getHtmlStructure()));
            }
            if (dto.getPreviewImage() == null || Utilities.shouldUpdate(dto.getPreviewImage())) {
                entity.setPreviewImage(normalizeOptionalText(dto.getPreviewImage()));
            }
            if (dto.getDescription() == null || Utilities.shouldUpdate(dto.getDescription())) {
                entity.setDescription(normalizeOptionalText(dto.getDescription()));
            }
            if (dto.getIsDeleted() != null) {
                entity.setIsDeleted(dto.getIsDeleted());
            }

            if (StringUtils.isBlank(entity.getName()) || StringUtils.isBlank(entity.getCategory()) || StringUtils.isBlank(entity.getHtmlStructure())) {
                return buildBadRequestResponse("Nom, catégorie et structure HTML sont requis");
            }

            entity.setUpdatedAt(Utilities.getCurrentDate());
            EmailTemplatePreset saved = presetRepository.save(entity);
            items.add(toDto(saved));
        }

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(items);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);

        log.info("end method /emailTemplatePreset/update");
        return response;
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<EmailTemplatePresetDto> delete(@RequestBody Request<EmailTemplatePresetDto> request) throws ParseException {
        log.info("start method /emailTemplatePreset/delete");

        if (request == null || request.getDatas() == null || request.getDatas().isEmpty()) {
            return buildBadRequestResponse("Aucun preset à supprimer");
        }

        for (EmailTemplatePresetDto dto : request.getDatas()) {
            if (dto.getId() == null) {
                return buildBadRequestResponse("L'identifiant du preset est requis");
            }

            EmailTemplatePreset entity = presetRepository.findOne(dto.getId(), false);
            if (entity == null) {
                return buildNotFoundResponse("Preset introuvable : " + dto.getId());
            }

            entity.setIsDeleted(true);
            entity.setUpdatedAt(Utilities.getCurrentDate());
            presetRepository.save(entity);
        }

        Response<EmailTemplatePresetDto> response = new Response<>();
        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);

        log.info("end method /emailTemplatePreset/delete");
        return response;
    }

    @RequestMapping(value="/getAll", method=RequestMethod.GET, produces={"application/json"})
    public Response<EmailTemplatePresetDto> getAll() throws ParseException {
        log.info("start method /emailTemplatePreset/getAll");
        Response<EmailTemplatePresetDto> response = new Response<>();

        List<EmailTemplatePreset> presets = presetRepository.findByIsDeleted(false);
        if (presets != null && !presets.isEmpty()) {
            List<EmailTemplatePresetDto> dtos = new ArrayList<>();
            for (EmailTemplatePreset p : presets) {
                dtos.add(toDto(p));
            }
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        } else {
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage("Aucun preset trouvé");
            response.setItems(new ArrayList<>());
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("end method /emailTemplatePreset/getAll");
        return response;
    }

    private EmailTemplatePresetDto toDto(EmailTemplatePreset preset) {
        EmailTemplatePresetDto dto = new EmailTemplatePresetDto();
        dto.setId(preset.getId());
        dto.setName(preset.getName());
        dto.setCategory(preset.getCategory());
        dto.setHtmlStructure(preset.getHtmlStructure());
        dto.setPreviewImage(preset.getPreviewImage());
        dto.setDescription(preset.getDescription());
        dto.setIsDeleted(preset.getIsDeleted());
        dto.setCreatedAt(preset.getCreatedAt() == null ? null : preset.getCreatedAt().toString());
        dto.setUpdatedAt(preset.getUpdatedAt() == null ? null : preset.getUpdatedAt().toString());
        return dto;
    }

    private String normalizeOptionalText(String value) {
        return StringUtils.trimToNull(value);
    }

    private Response<EmailTemplatePresetDto> buildBadRequestResponse(String message) {
        Response<EmailTemplatePresetDto> response = new Response<>();
        Status status = new Status();
        status.setCode(StatusCode.FUNC_REQUEST_FAIL);
        status.setMessage(message);
        response.setItems(new ArrayList<>());
        response.setHasError(true);
        response.setHttpCode(HttpStatus.BAD_REQUEST.value());
        response.setStatus(status);
        return response;
    }

    private Response<EmailTemplatePresetDto> buildNotFoundResponse(String message) {
        Response<EmailTemplatePresetDto> response = new Response<>();
        Status status = new Status();
        status.setCode(StatusCode.FUNC_DATA_NOT_EXIST);
        status.setMessage(message);
        response.setItems(new ArrayList<>());
        response.setHasError(true);
        response.setHttpCode(HttpStatus.NOT_FOUND.value());
        response.setStatus(status);
        return response;
    }
}
