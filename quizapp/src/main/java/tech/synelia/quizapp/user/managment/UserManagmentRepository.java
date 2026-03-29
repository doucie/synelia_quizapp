package tech.synelia.quizapp.user.managment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.dao.entity.User;

@Repository
public interface UserManagmentRepository extends JpaRepository<User, Integer>{
	
	@Query("select e from User e where e.email = :email and e.password = :password and e.isDeleted = :isDeleted")
	User findByEmailAndPassword(@Param("email")String login, @Param("password")String password, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from User e where e.email = :email and e.isDeleted = :isDeleted")
	List<User> findByEmail(@Param("email")String email, @Param("isDeleted")Boolean isDeleted);

	@Query("select e from User e where e.username = :username and e.isDeleted = :isDeleted")
	List<User> findByUsername(@Param("username")String username, @Param("isDeleted")Boolean isDeleted);

}