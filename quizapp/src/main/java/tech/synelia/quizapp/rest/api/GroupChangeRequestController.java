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
import java.net.URI;

import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/groupChangeRequest")
@PreAuthorize("isAuthenticated()")
public class GroupChangeRequestController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ControllerFactory<GroupChangeRequestDto> controllerFactory;
    @Autowired
    private GroupChangeRequestBusiness groupChangeRequestBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<GroupChangeRequestDto>> create(@RequestBody Request<GroupChangeRequestDto> request) throws Exception {
        log.info("start method /groupChangeRequest/create");
        Response<GroupChangeRequestDto> response = controllerFactory.create(groupChangeRequestBusiness, request, FunctionalityEnum.CREATE_GROUP_CHANGE_REQUEST);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
        log.info("end method /groupChangeRequest/create");
        return ResponseEntity.created(uri).body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<GroupChangeRequestDto> update(@RequestBody Request<GroupChangeRequestDto> request) throws Exception {
        log.info("start method /groupChangeRequest/update");
        Response<GroupChangeRequestDto> response = controllerFactory.update(groupChangeRequestBusiness, request, FunctionalityEnum.UPDATE_GROUP_CHANGE_REQUEST);
        log.info("end method /groupChangeRequest/update");
        return response;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<GroupChangeRequestDto> delete(@RequestBody Request<GroupChangeRequestDto> request) throws Exception {
        log.info("start method /groupChangeRequest/delete");
        Response<GroupChangeRequestDto> response = controllerFactory.delete(groupChangeRequestBusiness, request, FunctionalityEnum.DELETE_GROUP_CHANGE_REQUEST);
        log.info("end method /groupChangeRequest/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<GroupChangeRequestDto> getByCriteria(@RequestBody Request<GroupChangeRequestDto> request) throws Exception {
        log.info("start method /groupChangeRequest/getByCriteria");
        Response<GroupChangeRequestDto> response = controllerFactory.getByCriteria(groupChangeRequestBusiness, request, FunctionalityEnum.VIEW_GROUP_CHANGE_REQUEST);
        log.info("end method /groupChangeRequest/getByCriteria");
        return response;
    }
}
