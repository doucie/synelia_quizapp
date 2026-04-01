package tech.synelia.quizapp.dao.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

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

    @Column(name = "logo_html", columnDefinition = "TEXT")
    private String logoHtml;

    @Column(name = "primary_color", nullable = false, length = 7)
    private String primaryColor;

    @Column(name = "color_scheme", nullable = false, length = 30)
    private String colorScheme;

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
