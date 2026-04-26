package tech.synelia.quizapp.dao.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.EmailTemplatePreset;

@Repository
public interface EmailTemplatePresetRepository extends JpaRepository<EmailTemplatePreset, Integer> {

    @Query("select e from EmailTemplatePreset e where e.isDeleted = :isDeleted")
    List<EmailTemplatePreset> findByIsDeleted(@Param("isDeleted") Boolean isDeleted);

    @Query("select e from EmailTemplatePreset e where e.id = :id and e.isDeleted = :isDeleted")
    EmailTemplatePreset findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

    @Query("select e from EmailTemplatePreset e where e.category = :category and e.isDeleted = :isDeleted")
    List<EmailTemplatePreset> findByCategory(@Param("category") String category, @Param("isDeleted") Boolean isDeleted);
}
