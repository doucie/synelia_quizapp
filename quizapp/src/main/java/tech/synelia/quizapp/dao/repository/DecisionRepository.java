package tech.synelia.quizapp.dao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.Decision;

/**
 * Repository : Decision.
 */
@Repository
public interface DecisionRepository extends JpaRepository<Decision, Integer> {

    /**
     * Finds Decision by using id as a search criteria.
     *
     * @param id
     * @return An Object Decision whose id is equals to the given id. If
     *         no Decision is found, this method returns null.
     */
    @Query("select e from Decision e where e.id = :id and e.isDeleted = :isDeleted")
    Decision findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

    /**
     * Finds Decisions by using applicationId as a search criteria.
     *
     * @param applicationId
     * @return List of Decision whose applicationId is equals to the given applicationId.
     */
    @Query("select e from Decision e where e.application.id = :applicationId and e.isDeleted = :isDeleted order by e.createdAt desc")
    List<Decision> findByApplicationId(@Param("applicationId") Integer applicationId, @Param("isDeleted") Boolean isDeleted);

    /**
     * Finds Decisions by using userId as a search criteria.
     *
     * @param userId
     * @return List of Decision whose userId is equals to the given userId.
     */
    @Query("select e from Decision e where e.user.id = :userId and e.isDeleted = :isDeleted order by e.createdAt desc")
    List<Decision> findByUserId(@Param("userId") Integer userId, @Param("isDeleted") Boolean isDeleted);

    /**
     * Finds Decisions by using decisionType as a search criteria.
     *
     * @param decisionType
     * @return List of Decision whose decisionType is equals to the given decisionType.
     */
    @Query("select e from Decision e where e.decisionType = :decisionType and e.isDeleted = :isDeleted order by e.createdAt desc")
    List<Decision> findByDecisionType(@Param("decisionType") String decisionType, @Param("isDeleted") Boolean isDeleted);

    /**
     * Finds Decisions by using isCancel as a search criteria.
     *
     * @param isCancel
     * @return List of Decision whose isCancel is equals to the given isCancel.
     */
    @Query("select e from Decision e where e.isCancel = :isCancel and e.isDeleted = :isDeleted order by e.createdAt desc")
    List<Decision> findByIsCancel(@Param("isCancel") Boolean isCancel, @Param("isDeleted") Boolean isDeleted);

    /**
     * Finds all non-deleted decisions
     *
     * @return List of all Decision where isDeleted = false
     */
    @Query("select e from Decision e where e.isDeleted = false order by e.createdAt desc")
    List<Decision> findAllActive();
}