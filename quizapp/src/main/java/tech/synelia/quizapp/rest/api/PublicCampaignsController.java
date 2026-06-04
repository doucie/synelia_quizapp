package tech.synelia.quizapp.rest.api;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import tech.synelia.quizapp.business.CampaignsBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.CampaignsDto;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "/campaigns/public")
public class PublicCampaignsController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private CampaignsBusiness campaignsBusiness;

	@RequestMapping(value = "/getAvailable", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignsDto> getAvailable(@RequestBody(required = false) Request<CampaignsDto> request) throws Exception {
		return campaignsBusiness.getPublicAvailableCampaigns(resolveLocale());
	}

	@RequestMapping(value = "/getById", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignsDto> getById(@RequestBody Request<CampaignsDto> request) throws Exception {
		Integer campaignId = request != null && request.getData() != null ? request.getData().getId() : null;
		return campaignsBusiness.getPublicCampaignById(campaignId, resolveLocale());
	}

	private Locale resolveLocale() {
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		return Locale.of(languageID == null || languageID.isBlank() ? "fr" : languageID, "");
	}
}