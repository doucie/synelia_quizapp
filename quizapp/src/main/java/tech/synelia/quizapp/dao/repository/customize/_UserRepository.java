package tech.synelia.quizapp.dao.repository.customize;

import java.util.Date;
import java.util.List;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Locale;

import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;

/**
 * Repository customize : User.
 */
@Repository
public interface _UserRepository {
	default List<String> _generateCriteria(UserDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
		List<String> listOfQuery = new ArrayList<String>();

		// Recherche globale (searchString)
		if (Utilities.notBlank(dto.getSearchString())) {
			String sv = "%" + dto.getSearchString().toLowerCase() + "%";
			String sp = "searchAll_" + (index != null ? index : "");
			param.put(sp, sv);
			listOfQuery.add("(" + "LOWER(e.firstName) LIKE :" + sp + " OR LOWER(e.lastName) LIKE :" + sp + " OR LOWER(e.email) LIKE :" + sp + " OR LOWER(e.userRole) LIKE :" + sp + ")");
		}

		// Traitement des intervalles de dates pour la recherche avancée
		if (Utilities.notBlank(dto.getDateCreationDe())) {
			try {
				Date startDate = java.sql.Date.valueOf(dto.getDateCreationDe());
				String dateParam = "dateCreationDe" + (index != null ? index : "");
				param.put(dateParam, startDate);
				listOfQuery.add("e.createdAt >= :" + dateParam);
			} catch (Exception e) {
				System.out.println("❌ BACKEND: Erreur parsing DateCreationDe: " + e.getMessage());
			}
		}
		if (Utilities.notBlank(dto.getDateCreationA())) {
			try {
				// Pour la date de fin, on ajoute 1 jour et on utilise < pour inclure toute la journée
				Date endDate = java.sql.Date.valueOf(dto.getDateCreationA());
				Date nextDay = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
				String dateParam = "dateCreationA" + (index != null ? index : "");
				param.put(dateParam, nextDay);
				listOfQuery.add("e.createdAt < :" + dateParam);
			} catch (Exception e) {
				System.out.println("❌ BACKEND: Erreur parsing DateCreationA: " + e.getMessage());
			}
		}
		if (Utilities.notBlank(dto.getDateModificationDe())) {
			try {
				Date startDate = java.sql.Date.valueOf(dto.getDateModificationDe());
				String dateParam = "dateModificationDe" + (index != null ? index : "");
				param.put(dateParam, startDate);
				listOfQuery.add("e.updatedAt >= :" + dateParam);
			} catch (Exception e) {
				System.out.println("❌ BACKEND: Erreur parsing DateModificationDe: " + e.getMessage());
			}
		}
		if (Utilities.notBlank(dto.getDateModificationA())) {
			try {
				// Pour la date de fin, on ajoute 1 jour et on utilise < pour inclure toute la journée
				Date endDate = java.sql.Date.valueOf(dto.getDateModificationA());
				Date nextDay = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
				String dateParam = "dateModificationA" + (index != null ? index : "");
				param.put(dateParam, nextDay);
				listOfQuery.add("e.updatedAt < :" + dateParam);
			} catch (Exception e) {
				System.out.println("❌ BACKEND: Erreur parsing DateModificationA: " + e.getMessage());
			}
		}

		// PUT YOUR RIGHT CUSTOM CRITERIA HERE

		return listOfQuery;
	}
}
