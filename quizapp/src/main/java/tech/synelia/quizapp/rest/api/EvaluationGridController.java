package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Locale;

import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.EvaluationGridTemplateDto;
import tech.synelia.quizapp.business.EvaluationGridBusiness;

@Log
@CrossOrigin("*")
@RestController
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@RequestMapping(value="/evaluationGrid")
public class EvaluationGridController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ExceptionUtils exceptionUtils;
    @Autowired
    private EvaluationGridBusiness evaluationGridBusiness;

    @RequestMapping(value="/templates", method=RequestMethod.POST, produces={"application/json"})
    public ResponseEntity<Response<EvaluationGridTemplateDto>> templates() {
        log.info("start method /evaluationGrid/templates");
        Response<EvaluationGridTemplateDto> response = new Response<>();
        try {
            response = evaluationGridBusiness.getTemplates(locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
