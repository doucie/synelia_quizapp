package tech.synelia.quizapp.utils.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for returning dependency information before delete/restore operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DependencyInfoDto {

    /** The entity type being checked */
    private String entityType;

    /** The entity ID being checked */
    private Integer entityId;

    /** Overall severity: NORMAL (no deps), WARNING (deps but not critical), CRITICAL (candidate data linked) */
    private String level;

    /** Total count of all dependent records */
    private int totalDependencies;

    /** List of dependencies grouped by child entity type */
    private List<DependencyGroup> dependencies = new ArrayList<>();

    /** For restore checks: parent info if parent is deleted */
    private List<DeletedParent> deletedParents = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DependencyGroup {
        /** Child entity type name (e.g., "specialities", "questions") */
        private String entityType;

        /** French label for display (e.g., "Spécialités", "Questions") */
        private String label;

        /** Number of active (non-deleted) child records */
        private int count;

        /** Whether this dependency involves candidate data (CRITICAL) */
        private boolean critical;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeletedParent {
        /** Parent entity type */
        private String entityType;

        /** French label */
        private String label;

        /** Parent entity ID */
        private Integer parentId;

        /** Parent display name */
        private String parentName;
    }
}
