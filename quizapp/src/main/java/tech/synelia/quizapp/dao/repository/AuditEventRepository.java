package tech.synelia.quizapp.dao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.AuditEvent;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Integer> {
}