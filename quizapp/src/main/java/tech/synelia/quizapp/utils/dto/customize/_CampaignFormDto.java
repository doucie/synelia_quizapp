package tech.synelia.quizapp.utils.dto.customize;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class _CampaignFormDto {
	private String campaignName;
	private String formName;
	private String formDesc;
	private Boolean formActive;

	public String getCampaignName() {
		return campaignName;
	}

	public void setCampaignName(String campaignName) {
		this.campaignName = campaignName;
	}

	public String getFormName() {
		return formName;
	}

	public void setFormName(String formName) {
		this.formName = formName;
	}

	public String getFormDesc() {
		return formDesc;
	}

	public void setFormDesc(String formDesc) {
		this.formDesc = formDesc;
	}

	public Boolean getFormActive() {
		return formActive;
	}

	public void setFormActive(Boolean formActive) {
		this.formActive = formActive;
	}
}