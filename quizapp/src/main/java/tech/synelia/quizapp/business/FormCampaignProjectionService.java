package tech.synelia.quizapp.business;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;
import tech.synelia.quizapp.utils.Utilities;

@Component
class FormCampaignProjectionService {

	@Autowired
	private CampaignFormRepository campaignFormRepository;
	@Autowired
	private FormRepository formRepository;

	void synchronizeLegacyCampaignProjection(Collection<Form> forms, Integer actorUserId) {
		if (forms == null || forms.isEmpty()) {
			return;
		}

		Map<Integer, Form> formsById = new LinkedHashMap<>();
		for (Form form : forms) {
			if (form == null || form.getId() == null) {
				continue;
			}
			formsById.putIfAbsent(form.getId(), form);
		}

		if (formsById.isEmpty()) {
			return;
		}

		Date now = Utilities.getCurrentDate();
		List<Form> formsToSave = new ArrayList<>();
		for (Form form : formsById.values()) {
			Campaigns projectedCampaign = resolveProjectedCampaign(form.getId());
			Integer currentCampaignId = form.getCampaigns() != null ? form.getCampaigns().getId() : null;
			Integer projectedCampaignId = projectedCampaign != null ? projectedCampaign.getId() : null;

			if (Objects.equals(currentCampaignId, projectedCampaignId)) {
				continue;
			}

			form.setCampaigns(projectedCampaign);
			form.setUpdatedAt(now);
			form.setUpdatedBy(actorUserId);
			formsToSave.add(form);
		}

		if (!formsToSave.isEmpty()) {
			formRepository.saveAll(formsToSave);
		}
	}

	private Campaigns resolveProjectedCampaign(Integer formId) {
		List<CampaignForm> links = campaignFormRepository.findByFormId(formId);
		if (links == null || links.isEmpty()) {
			return null;
		}

		Campaigns projectedCampaign = null;
		for (CampaignForm link : links) {
			if (link == null || Boolean.TRUE.equals(link.getIsDeleted()) || link.getCampaigns() == null || link.getCampaigns().getId() == null) {
				continue;
			}

			if (projectedCampaign != null && !Objects.equals(projectedCampaign.getId(), link.getCampaigns().getId())) {
				return null;
			}

			projectedCampaign = link.getCampaigns();
		}

		return projectedCampaign;
	}
}