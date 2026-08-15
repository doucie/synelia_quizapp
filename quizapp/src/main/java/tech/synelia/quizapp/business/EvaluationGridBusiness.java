package tech.synelia.quizapp.business;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.EvaluationGridTemplate;
import tech.synelia.quizapp.dao.entity.EvaluationGridTemplateVersion;
import tech.synelia.quizapp.dao.repository.EvaluationGridTemplateRepository;
import tech.synelia.quizapp.dao.repository.EvaluationGridTemplateVersionRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.EvaluationGridTemplateDto;
import tech.synelia.quizapp.utils.dto.EvaluationGridTemplateVersionDto;

@Log
@Component
public class EvaluationGridBusiness {

    @Autowired
    private EvaluationGridTemplateRepository templateRepository;
    @Autowired
    private EvaluationGridTemplateVersionRepository versionRepository;
    @Autowired
    private FunctionalError functionalError;

    /**
     * Catalogue des grilles d'évaluation : templates actifs avec leurs versions
     * publiées (disponibilité = is_published, cf. note 430).
     */
    public Response<EvaluationGridTemplateDto> getTemplates(Locale locale) {
        log.info("----begin getTemplates EvaluationGrid-----");
        Response<EvaluationGridTemplateDto> response = new Response<>();

        List<EvaluationGridTemplate> templates = templateRepository.findByIsDeleted(false);
        List<EvaluationGridTemplateDto> items = new ArrayList<>();
        if (templates != null) {
            for (EvaluationGridTemplate template : templates) {
                if (!Boolean.TRUE.equals(template.getIsActive())) {
                    continue;
                }
                EvaluationGridTemplateDto dto = new EvaluationGridTemplateDto();
                dto.setId(template.getId());
                dto.setTemplateName(template.getTemplateName());
                dto.setTemplateDesc(template.getTemplateDesc());
                dto.setIsActive(template.getIsActive());
                dto.setIsDeleted(template.getIsDeleted());

                List<EvaluationGridTemplateVersion> versions = versionRepository
                        .findByEvaluationGridTemplateId(template.getId(), false);
                List<EvaluationGridTemplateVersionDto> versionDtos = new ArrayList<>();
                if (versions != null) {
                    for (EvaluationGridTemplateVersion version : versions) {
                        if (!Boolean.TRUE.equals(version.getIsPublished())) {
                            continue;
                        }
                        EvaluationGridTemplateVersionDto versionDto = new EvaluationGridTemplateVersionDto();
                        versionDto.setId(version.getId());
                        versionDto.setEvaluationGridTemplateId(version.getEvaluationGridTemplateId());
                        versionDto.setVersionNumber(version.getVersionNumber());
                        versionDto.setVersionLabel(version.getVersionLabel());
                        versionDto.setIsPublished(version.getIsPublished());
                        versionDto.setLockedAt(version.getLockedAt() != null ? version.getLockedAt().toString() : null);
                        versionDto.setIsDeleted(version.getIsDeleted());
                        versionDtos.add(versionDto);
                    }
                }
                dto.setVersions(versionDtos);
                items.add(dto);
            }
        }

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(items);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);
        response.setCount((long) items.size());

        log.info("----end getTemplates EvaluationGrid-----");
        return response;
    }
}
