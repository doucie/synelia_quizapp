package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.enums.CampaignStatus;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

/**
 * Scheduler that automatically transitions campaign statuses based on date rules:
 * - DRAFT  → PENDING : campaign_start is in the future
 * - PENDING → OPEN   : campaign_start <= today
 * - OPEN    → CLOSED : campaign_end < today OR max_apply reached
 * - PAUSED  → CLOSED : campaign_end < today
 */
@Log
@Component
public class CampaignLifecycleScheduler {

	private static final int SYSTEM_ACTOR_USER_ID = 0;

	@Autowired
	private CampaignsRepository campaignsRepository;

	@Autowired
	private ApplicationsRepository applicationsRepository;

	@Scheduled(fixedRate = 300000)
	@Transactional
	public void evaluateCampaignStatusTransitions() {
		List<Campaigns> candidates = campaignsRepository.findTransitionableCampaigns();
		if (candidates == null || candidates.isEmpty()) {
			return;
		}

		LocalDate today = LocalDate.now();
		int transitionCount = 0;

		for (Campaigns campaign : candidates) {
			try {
				CampaignStatus currentStatus = CampaignStatus.fromValue(campaign.getCampaignStatus());
				CampaignStatus targetStatus = resolveTargetStatus(campaign, currentStatus, today);

				if (targetStatus != null && currentStatus.canTransitionTo(targetStatus)) {
					campaign.setCampaignStatus(targetStatus.getValue());
					campaign.setUpdatedAt(Utilities.getCurrentDate());
					campaign.setUpdatedBy(SYSTEM_ACTOR_USER_ID);
					campaign.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(campaign)));
					transitionCount++;
					log.info("Transition automatique campagne #" + campaign.getId()
							+ " : " + currentStatus.getValue() + " → " + targetStatus.getValue());
				}
			} catch (Exception e) {
				log.warning("Transition automatique ignorée pour la campagne "
						+ campaign.getId() + " : " + e.getMessage());
			}
		}

		if (transitionCount > 0) {
			campaignsRepository.saveAll(candidates);
			log.info("Transitions automatiques campagnes appliquées : " + transitionCount);
		}
	}

	private CampaignStatus resolveTargetStatus(Campaigns campaign, CampaignStatus currentStatus, LocalDate today) {
		LocalDate startDate = toLocalDate(campaign.getCampaignStart());
		LocalDate endDate = toLocalDate(campaign.getCampaignEnd());

		return switch (currentStatus) {
			case DRAFT -> {
				if (startDate != null && startDate.isAfter(today)) {
					yield CampaignStatus.PENDING;
				}
				yield null;
			}
			case PENDING -> {
				if (startDate != null && !startDate.isAfter(today)) {
					yield CampaignStatus.OPEN;
				}
				yield null;
			}
			case OPEN -> {
				if (endDate != null && endDate.isBefore(today)) {
					yield CampaignStatus.CLOSED;
				}
				if (campaign.getMaxApply() != null && campaign.getMaxApply() > 0) {
					Long appCount = applicationsRepository.countByCampaignId(campaign.getId(), false);
					if (appCount != null && appCount >= campaign.getMaxApply()) {
						yield CampaignStatus.CLOSED;
					}
				}
				yield null;
			}
			case PAUSED -> {
				if (endDate != null && endDate.isBefore(today)) {
					yield CampaignStatus.CLOSED;
				}
				yield null;
			}
			default -> null;
		};
	}

	private LocalDate toLocalDate(Date date) {
		if (date == null) {
			return null;
		}
		return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
	}
}
