package tech.synelia.quizapp.dao.repository.customize;

import java.util.Date;
import java.util.List;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Locale;

import org.springframework.stereotype.Repository;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;

@Repository
public interface _ApplicationsRepository {
default List<String> _generateCriteria(ApplicationsDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
List<String> listOfQuery = new ArrayList<String>();

// Recherche globale (searchString)
if (Utilities.notBlank(dto.getSearchString())) {
String sv = "%" + dto.getSearchString().toLowerCase() + "%";
String sp = "searchAll_" + (index != null ? index : "");
param.put(sp, sv);
listOfQuery.add("(" + "LOWER(e.candidateFirstName) LIKE :" + sp + " OR LOWER(e.candidateLastName) LIKE :" + sp + " OR LOWER(e.candidateEmail) LIKE :" + sp + " OR LOWER(e.currentPipelineProgressStatus) LIKE :" + sp + ")");
}
// Intervalles de dates
if (Utilities.notBlank(dto.getDateCreationDe())) {
try {
Date d = java.sql.Date.valueOf(dto.getDateCreationDe());
String p = "dateCreDe_" + (index != null ? index : "");
param.put(p, d);
listOfQuery.add("e.createdAt >= :" + p);
} catch (Exception ignored) {}
}
if (Utilities.notBlank(dto.getDateCreationA())) {
try {
Date d = java.sql.Date.valueOf(dto.getDateCreationA());
Date n = new Date(d.getTime() + 86400000L);
String p = "dateCreA_" + (index != null ? index : "");
param.put(p, n);
listOfQuery.add("e.createdAt < :" + p);
} catch (Exception ignored) {}
}
if (Utilities.notBlank(dto.getDateModificationDe())) {
try {
Date d = java.sql.Date.valueOf(dto.getDateModificationDe());
String p = "dateModDe_" + (index != null ? index : "");
param.put(p, d);
listOfQuery.add("e.updatedAt >= :" + p);
} catch (Exception ignored) {}
}
if (Utilities.notBlank(dto.getDateModificationA())) {
try {
Date d = java.sql.Date.valueOf(dto.getDateModificationA());
Date n = new Date(d.getTime() + 86400000L);
String p = "dateModA_" + (index != null ? index : "");
param.put(p, n);
listOfQuery.add("e.updatedAt < :" + p);
} catch (Exception ignored) {}
}

return listOfQuery;
}
}