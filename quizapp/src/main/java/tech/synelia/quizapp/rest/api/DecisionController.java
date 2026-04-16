/*
 * Java controller for entity table decisions
 * Created on 2025-10-27 ( Time 12:00:00 )
 * Generator tool : Synelia Tools
 */

package tech.synelia.quizapp.rest.api;

import java.net.URI;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;
import tech.synelia.quizapp.business.DecisionBusiness;
import tech.synelia.quizapp.rest.fact.ControllerFactory;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.DecisionDto;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;

/**
 * Controller for table "decisions"
 *
 * @author Synelia
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/decisions")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'UTILISATEUR')")
public class DecisionController {

    @Autowired
    private HttpServletRequest requestBasic;

    private final Logger slf4jLogger = LoggerFactory.getLogger(getClass());

    @Autowired
    private ControllerFactory<DecisionDto> controllerFactory;

    @Autowired
    private DecisionBusiness decisionBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<DecisionDto>> create(@RequestBody Request<DecisionDto> request) throws Exception {
        slf4jLogger.info("start method /decisions/create");
        Response<DecisionDto> response = controllerFactory.create(decisionBusiness, request, FunctionalityEnum.CREATE_DECISIONS);
        
        // Check if response has items before trying to access them
        if (response.isHasError() || response.getItems() == null || response.getItems().isEmpty()) {
            slf4jLogger.info("end method /decisions/create with error");
            return ResponseEntity.badRequest().body(response);
        }
        
        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .buildAndExpand(response.getItems().get(0))
                .toUri();
        slf4jLogger.info("end method /decisions/create");
        return ResponseEntity.created(uri).body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<DecisionDto> update(@RequestBody Request<DecisionDto> request) throws Exception {
        slf4jLogger.info("start method /decisions/update");
        Response<DecisionDto> response = controllerFactory.update(decisionBusiness, request, FunctionalityEnum.UPDATE_DECISIONS);
        slf4jLogger.info("end method /decisions/update");
        return response;
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<DecisionDto> delete(@RequestBody Request<DecisionDto> request) throws Exception {
        slf4jLogger.info("start method /decisions/delete");
        Response<DecisionDto> response = controllerFactory.delete(decisionBusiness, request, FunctionalityEnum.DELETE_DECISIONS);
        slf4jLogger.info("end method /decisions/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<DecisionDto> getByCriteria(@RequestBody Request<DecisionDto> request) throws Exception {
        slf4jLogger.info("start method /decisions/getByCriteria");
        Response<DecisionDto> response = controllerFactory.getByCriteria(decisionBusiness, request, FunctionalityEnum.VIEW_DECISIONS);
        slf4jLogger.info("end method /decisions/getByCriteria");
        return response;
    }
}