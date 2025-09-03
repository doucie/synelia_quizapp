package tech.synelia.quizapp.dao.repository.customize;

import java.util.Date;
import java.util.List;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Locale;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import org.springframework.dao.DataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.*;

/**
 * Repository customize : Applications.
 */
@Repository
public interface _ApplicationsRepository {
	default List<String> _generateCriteria(ApplicationsDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();

		// PUT YOUR RIGHT CUSTOM CRITERIA HERE

		return listOfQuery;
	}
}
