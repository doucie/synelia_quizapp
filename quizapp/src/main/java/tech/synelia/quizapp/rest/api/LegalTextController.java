package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.Locale;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/legalText")
public class LegalTextController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private ControllerFactory<LegalTextDto> controllerFactory;
    @Autowired
    private LegalTextBusiness legalTextBusiness;

    @PreAuthorize("hasRole('SUPER')")
    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<LegalTextDto>> create(@RequestBody Request<LegalTextDto> request) throws Exception {
        log.info("start method /legalText/create");
        Response<LegalTextDto> response = controllerFactory.create(legalTextBusiness, request, FunctionalityEnum.CREATE_LEGAL_TEXT);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
        log.info("end method /legalText/create");
        return ResponseEntity.created(uri).body(response);
    }

    @PreAuthorize("hasRole('SUPER')")
    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<LegalTextDto> update(@RequestBody Request<LegalTextDto> request) throws Exception {
        log.info("start method /legalText/update");
        Response<LegalTextDto> response = controllerFactory.update(legalTextBusiness, request, FunctionalityEnum.UPDATE_LEGAL_TEXT);
        log.info("end method /legalText/update");
        return response;
    }

    @PreAuthorize("hasRole('SUPER')")
    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<LegalTextDto> delete(@RequestBody Request<LegalTextDto> request) throws Exception {
        log.info("start method /legalText/delete");
        Response<LegalTextDto> response = controllerFactory.delete(legalTextBusiness, request, FunctionalityEnum.DELETE_LEGAL_TEXT);
        log.info("end method /legalText/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<LegalTextDto> getByCriteria(@RequestBody Request<LegalTextDto> request) throws Exception {
        log.info("start method /legalText/getByCriteria");
        Response<LegalTextDto> response = controllerFactory.getByCriteria(legalTextBusiness, request, FunctionalityEnum.VIEW_LEGAL_TEXT);
        log.info("end method /legalText/getByCriteria");
        return response;
    }
}
