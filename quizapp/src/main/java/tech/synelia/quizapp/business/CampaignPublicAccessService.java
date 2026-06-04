package tech.synelia.quizapp.business;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Date;
import java.util.Locale;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.entity.FormVersion;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.CampaignFormRepository;
import tech.synelia.quizapp.dao.repository.FormVersionRepository;
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Component
public class CampaignPublicAccessService {

	private static final String STATUS_OPEN = "OPEN";
	private static final String STATUS_PENDING = "PENDING";
	private static final String STATUS_CLOSED = "CLOSED";
	private static final DateTimeFormatter DISPLAY_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	@Autowired
	private SourceTokenRepository sourceTokenRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private CampaignFormRepository campaignFormRepository;
	@Autowired
	private FormVersionRepository formVersionRepository;
	@Autowired
	private FunctionalError functionalError;

	public SourceToken requireAvailableToken(String tokenString, Locale locale) {
		if (StringUtils.isBlank(tokenString) || tokenString.length() != 6) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Token invalide - format incorrect", locale));
		}

		SourceToken sourceToken = sourceTokenRepository.findByTokenString(tokenString.toLowerCase(Locale.ROOT), false);
		if (sourceToken == null || Boolean.TRUE.equals(sourceToken.getIsDeleted())) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Lien de candidature introuvable", locale));
		}

		ensureSourceTokenAllowsApplications(sourceToken, 0, locale);
		return sourceToken;
	}

	public Campaigns requirePublicCampaign(Integer campaignId, Locale locale) {
		if (campaignId == null || campaignId <= 0) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("campaignId", locale));
		}

		Campaigns campaign = campaignsRepository.findOne(campaignId, false);
		ensureCampaignAllowsApplications(campaign, 0, locale);
		ensureCampaignHasPublishedFormVersion(campaign, locale);
		return campaign;
	}

	public void ensureSourceTokenAllowsApplications(SourceToken sourceToken, int pendingRequestApplications, Locale locale) {
		if (sourceToken == null || Boolean.TRUE.equals(sourceToken.getIsDeleted())) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Lien de candidature introuvable", locale));
		}

		Date now = new Date();
		if (sourceToken.getExpirationDate() != null && !sourceToken.getExpirationDate().after(now)) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Ce lien de candidature a expire.", locale));
		}

		ensureCampaignAllowsApplications(sourceToken.getCampaigns(), pendingRequestApplications, locale);
		ensureFormAccessIsAvailable(sourceToken, locale);
	}

	public void ensureCampaignAllowsDirectApplications(Campaigns campaign, int pendingRequestApplications, Locale locale) {
		ensureCampaignAllowsApplications(campaign, pendingRequestApplications, locale);
		ensureCampaignHasPublishedFormVersion(campaign, locale);

		if (requiresSourceToken(campaign)) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette campagne necessite un code transmis par le recruteur.", locale));
		}
	}

	public boolean canBeListedPublicly(Campaigns campaign) {
		try {
			ensureCampaignAllowsApplications(campaign, 0, Locale.FRENCH);
			return campaign != null && campaignHasPublishedFormVersion(campaign.getId());
		} catch (RuntimeException exception) {
			return false;
		}
	}

	public boolean requiresSourceToken(Campaigns campaign) {
		String strategy = StringUtils.upperCase(StringUtils.trimToEmpty(campaign != null ? campaign.getFormAssignmentStrategy() : null));
		return "SOURCE_TOKEN".equals(strategy);
	}

	private void ensureCampaignAllowsApplications(Campaigns campaign, int pendingRequestApplications, Locale locale) {
		if (campaign == null || Boolean.TRUE.equals(campaign.getIsDeleted())) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Cette campagne n'est plus disponible.", locale));
		}

		if (campaign.getPipelineTemplate() == null || campaign.getPipelineTemplate().getId() == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette campagne n'est pas encore ouverte: aucun pipeline de recrutement n'est configure.", locale));
		}

		if (!Boolean.TRUE.equals(campaign.getPipelineTemplate().getIsActive())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette campagne n'est pas encore ouverte: le pipeline configure n'est pas actif.", locale));
		}

		String status = StringUtils.upperCase(StringUtils.trimToEmpty(campaign.getCampaignStatus()));
		if (!STATUS_OPEN.equals(status)) {
			if (STATUS_PENDING.equals(status)) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL("Cette campagne n'est pas encore ouverte aux candidatures.", locale));
			}
			if (STATUS_CLOSED.equals(status)) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL("Cette campagne est fermee aux nouvelles candidatures.", locale));
			}

			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette campagne n'est pas disponible pour de nouvelles candidatures.", locale));
		}

		LocalDate today = toLocalDate(new Date());
		LocalDate startDate = toLocalDate(campaign.getCampaignStart());
		if (startDate != null && startDate.isAfter(today)) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette campagne ouvrira le " + DISPLAY_DATE_FORMAT.format(startDate) + ".", locale));
		}

		LocalDate endDate = toLocalDate(campaign.getCampaignEnd());
		if (endDate != null && endDate.isBefore(today)) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette campagne n'accepte plus de nouvelles candidatures.", locale));
		}

		Integer maxApply = campaign.getMaxApply();
		if (maxApply != null && maxApply > 0) {
			Long currentApplications = applicationsRepository.countByCampaignId(campaign.getId(), false);
			long totalApplications = (currentApplications == null ? 0L : currentApplications) + pendingRequestApplications;
			if (totalApplications >= maxApply) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"Le nombre maximal de candidatures pour cette campagne a ete atteint.", locale));
			}
		}
	}

	private void ensureCampaignHasPublishedFormVersion(Campaigns campaign, Locale locale) {
		if (campaign == null || campaign.getId() == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Cette campagne n'est plus disponible.", locale));
		}

		if (!campaignHasPublishedFormVersion(campaign.getId())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette campagne n'est pas encore ouverte: aucun formulaire publie n'est disponible.", locale));
		}
	}

	private void ensureFormAccessIsAvailable(SourceToken sourceToken, Locale locale) {
		Campaigns campaign = sourceToken.getCampaigns();
		if (campaign == null || campaign.getId() == null) {
			return;
		}

		ensureCampaignHasPublishedFormVersion(campaign, locale);

		String strategy = StringUtils.upperCase(StringUtils.trimToEmpty(campaign.getFormAssignmentStrategy()));
		if (!"SOURCE_TOKEN".equals(strategy)) {
			return;
		}

		Form assignedForm = sourceToken.getForm();
		if (assignedForm == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Ce lien de candidature n'est pas encore configure avec un formulaire dedie.", locale));
		}

		if (!hasActiveCampaignFormLink(campaign.getId(), assignedForm.getId())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Le formulaire configure sur ce lien ne correspond pas a la campagne.", locale));
		}

		if (!formHasPublishedVersion(assignedForm.getId())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Aucune version publiee n'est disponible pour le formulaire configure sur ce lien.", locale));
		}
	}

	private boolean campaignHasPublishedFormVersion(Integer campaignId) {
		if (campaignId == null) {
			return false;
		}

		List<Form> forms = campaignFormRepository.findActiveFormsByCampaignId(campaignId);
		if (forms == null || forms.isEmpty()) {
			return false;
		}

		for (Form form : forms) {
			if (form != null && form.getId() != null && formHasPublishedVersion(form.getId())) {
				return true;
			}
		}

		return false;
	}

	private boolean formHasPublishedVersion(Integer formId) {
		List<FormVersion> publishedVersions = formVersionRepository.findByFormIdAndIsPublished(formId, true, false);
		return publishedVersions != null && !publishedVersions.isEmpty();
	}

	private boolean hasActiveCampaignFormLink(Integer campaignId, Integer formId) {
		if (campaignId == null || formId == null) {
			return false;
		}
		return campaignFormRepository.countActiveLinksByCampaignIdAndFormId(campaignId, formId) > 0L;
	}

	private LocalDate toLocalDate(Date date) {
		if (date == null) {
			return null;
		}
		return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
	}
}