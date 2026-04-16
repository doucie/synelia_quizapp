package tech.synelia.quizapp.dao.repository;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.customize._BusinessGroupRepository;

@Repository
public interface BusinessGroupRepository extends JpaRepository<BusinessGroup, Integer>, _BusinessGroupRepository {

	@Query("select e from BusinessGroup e where e.id = :id and e.isDeleted = :isDeleted")
	BusinessGroup findOne(@Param("id") Integer id, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from BusinessGroup e where e.groupName = :groupName and e.isDeleted = :isDeleted")
	List<BusinessGroup> findByGroupName(@Param("groupName") String groupName, @Param("isDeleted") Boolean isDeleted);

	@Query("select e from BusinessGroup e where e.isDeleted = :isDeleted")
	List<BusinessGroup> findByIsDeleted(@Param("isDeleted") Boolean isDeleted);
}
