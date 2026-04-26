package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import tech.synelia.quizapp.utils.*;
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

    @RequestMapping(value="/getAll", method=RequestMethod.GET, produces={"application/json"})
    public Response<EmailTemplatePresetDto> getAll() throws ParseException {
        log.info("start method /emailTemplatePreset/getAll");
        Response<EmailTemplatePresetDto> response = new Response<>();

        List<EmailTemplatePreset> presets = presetRepository.findByIsDeleted(false);
        if (presets != null && !presets.isEmpty()) {
            List<EmailTemplatePresetDto> dtos = new ArrayList<>();
            for (EmailTemplatePreset p : presets) {
                EmailTemplatePresetDto dto = new EmailTemplatePresetDto();
                dto.setId(p.getId());
                dto.setName(p.getName());
                dto.setCategory(p.getCategory());
                dto.setHtmlStructure(p.getHtmlStructure());
                dto.setPreviewImage(p.getPreviewImage());
                dto.setDescription(p.getDescription());
                dtos.add(dto);
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
}
