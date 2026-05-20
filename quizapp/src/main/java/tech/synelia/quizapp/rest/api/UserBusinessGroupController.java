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
@RequestMapping(value="/userBusinessGroup")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'RECRUITER')")
public class UserBusinessGroupController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ControllerFactory<UserBusinessGroupDto> controllerFactory;
    @Autowired
    private UserBusinessGroupBusiness userBusinessGroupBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Response<UserBusinessGroupDto>> create(@RequestBody Request<UserBusinessGroupDto> request) throws Exception {
        log.info("start method /userBusinessGroup/create");
        Response<UserBusinessGroupDto> response = controllerFactory.create(userBusinessGroupBusiness, request, FunctionalityEnum.CREATE_USER_BUSINESS_GROUP);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
        log.info("end method /userBusinessGroup/create");
        return ResponseEntity.created(uri).body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Response<UserBusinessGroupDto> update(@RequestBody Request<UserBusinessGroupDto> request) throws Exception {
        log.info("start method /userBusinessGroup/update");
        Response<UserBusinessGroupDto> response = controllerFactory.update(userBusinessGroupBusiness, request, FunctionalityEnum.UPDATE_USER_BUSINESS_GROUP);
        log.info("end method /userBusinessGroup/update");
        return response;
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Response<UserBusinessGroupDto> delete(@RequestBody Request<UserBusinessGroupDto> request) throws Exception {
        log.info("start method /userBusinessGroup/delete");
        Response<UserBusinessGroupDto> response = controllerFactory.delete(userBusinessGroupBusiness, request, FunctionalityEnum.DELETE_USER_BUSINESS_GROUP);
        log.info("end method /userBusinessGroup/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<UserBusinessGroupDto> getByCriteria(@RequestBody Request<UserBusinessGroupDto> request) throws Exception {
        log.info("start method /userBusinessGroup/getByCriteria");
        Response<UserBusinessGroupDto> response = controllerFactory.getByCriteria(userBusinessGroupBusiness, request, FunctionalityEnum.VIEW_USER_BUSINESS_GROUP);
        log.info("end method /userBusinessGroup/getByCriteria");
        return response;
    }
}
