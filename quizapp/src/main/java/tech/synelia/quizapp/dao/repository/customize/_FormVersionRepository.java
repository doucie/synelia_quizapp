package tech.synelia.quizapp.dao.repository.customize;

import java.util.List;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Locale;

import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.dto.*;

/**
 * Repository customize : FormVersion.
 */
@Repository
public interface _FormVersionRepository {
	default List<String> _generateCriteria(FormVersionDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();
		return listOfQuery;
	}
}
