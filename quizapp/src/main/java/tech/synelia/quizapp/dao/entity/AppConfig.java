package tech.synelia.quizapp.dao.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Data
@Entity
@Table(name = "app_config")
public class AppConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_name", nullable = false, length = 100)
    private String configName;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "app_link", length = 500)
    private String appLink;

    @Column(name = "logo_html", columnDefinition = "TEXT")
    private String logoHtml;

    @Column(name = "primary_color", nullable = false, length = 7)
    private String primaryColor;

    @Column(name = "color_scheme", nullable = false, length = 30)
    private String colorScheme;

    @Column(name = "candidate_accounts_enabled", nullable = false)
    private Boolean candidateAccountsEnabled;

    @Column(name = "anti_cheat_enabled", nullable = false)
    private Boolean antiCheatEnabled;

    @Column(name = "screening_policy", nullable = false, length = 10)
    private String screeningPolicy;

    @Column(name = "tab_switch_max_warnings")
    private Integer tabSwitchMaxWarnings;

    @Column(name = "tab_switch_max_actions")
    private Integer tabSwitchMaxActions;

    @Column(name = "fullscreen_required", nullable = false)
    private Boolean fullscreenRequired;

    @Column(name = "block_shortcuts", nullable = false)
    private Boolean blockShortcuts;

    @Column(name = "block_copy_paste", nullable = false)
    private Boolean blockCopyPaste;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "is_deleted")
    private Boolean isDeleted;
}
