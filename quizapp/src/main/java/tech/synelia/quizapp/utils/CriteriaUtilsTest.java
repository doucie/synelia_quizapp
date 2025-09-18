package tech.synelia.quizapp.utils;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;

import tech.synelia.quizapp.utils.contract.SearchParam;
import tech.synelia.quizapp.utils.enums.OperatorEnum;

/**
 * Test class pour vérifier la logique de CriteriaUtils
 */
public class CriteriaUtilsTest {

    public static void main(String[] args) {
        System.out.println("🧪 TEST DE CriteriaUtils.generateCriteria()");

        try {
            // Test 1: Date objects (comme ils arrivent du frontend)
            System.out.println("\n📅 TEST 1: Objets Date JavaScript (désérialisés)");
            testDateObjects();

            // Test 2: String dates (fallback)
            System.out.println("\n📝 TEST 2: Chaînes de caractères (fallback)");
            testStringDates();

        } catch (Exception e) {
            System.out.println("❌ ERREUR LORS DU TEST: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testDateObjects() throws Exception {
        System.out.println("🔍 Test avec des objets Date (comme ils arrivent du frontend)");

        // Simuler les objets Date qui arrivent du frontend
        Date startDate = new SimpleDateFormat("yyyy-MM-dd").parse("2025-09-01");
        Date endDate = new SimpleDateFormat("yyyy-MM-dd").parse("2025-09-18");

        System.out.println("📅 startDate: " + startDate + " (type: " + startDate.getClass().getName() + ")");
        System.out.println("📅 endDate: " + endDate + " (type: " + endDate.getClass().getName() + ")");

        // Créer le SearchParam comme le fait le frontend
        SearchParam<Date> dateParam = new SearchParam<>();
        dateParam.setOperator("BETWEEN");
        dateParam.setStart(startDate);
        dateParam.setEnd(endDate);

        // Tester generateCriteria
        HashMap<String, Object> params = new HashMap<>();
        String result = CriteriaUtils.generateCriteria(
            "createdAt",           // fieldName
            "",                    // fieldValue
            "e.createdAt",         // jpqlFieldName
            "Date",                // fieldType
            dateParam,             // fieldParam
            params,                // params
            0,                     // index
            Locale.FRANCE          // locale
        );

        System.out.println("✅ RÉSULTAT: " + result);
        System.out.println("📊 PARAMÈTRES GÉNÉRÉS:");
        params.forEach((key, value) -> System.out.println("  - " + key + ": " + value));
    }

    private static void testStringDates() throws Exception {
        System.out.println("🔍 Test avec des chaînes de caractères (ancienne méthode)");

        // Simuler des chaînes de caractères
        SearchParam<String> dateParam = new SearchParam<>();
        dateParam.setOperator("BETWEEN");
        dateParam.setStart("01/09/2025");
        dateParam.setEnd("18/09/2025");

        // Tester generateCriteria
        HashMap<String, Object> params = new HashMap<>();
        String result = CriteriaUtils.generateCriteria(
            "createdAt",           // fieldName
            "",                    // fieldValue
            "e.createdAt",         // jpqlFieldName
            "Date",                // fieldType
            dateParam,             // fieldParam
            params,                // params
            0,                     // index
            Locale.FRANCE          // locale
        );

        System.out.println("✅ RÉSULTAT: " + result);
        System.out.println("📊 PARAMÈTRES GÉNÉRÉS:");
        params.forEach((key, value) -> System.out.println("  - " + key + ": " + value));
    }
}