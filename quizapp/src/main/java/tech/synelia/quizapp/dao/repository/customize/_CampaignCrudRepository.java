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
public interface _CampaignCrudRepository {
default List<String> _generateCriteria(CampaignCrudDto dto, HashMap<String, java.lang.Object> param, Integer index, Locale locale) throws Exception {
List<String> listOfQuery = new ArrayList<String>();

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