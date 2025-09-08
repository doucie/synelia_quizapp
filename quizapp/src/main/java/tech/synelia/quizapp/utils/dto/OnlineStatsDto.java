package tech.synelia.quizapp.utils.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO pour les statistiques d'utilisateurs en ligne (QEEL)
 * Contient toutes les informations nécessaires pour l'affichage du dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnlineStatsDto {
    
    // Statistiques générales
    private Long totalUsers;
    private Long onlineUsers;
    private Double onlinePercentage;
    
    // Statistiques des administrateurs
    private Long totalAdmins;
    private Long onlineAdmins;
    private Double adminOnlinePercentage;
    
    // Statistiques des recruteurs
    private Long totalRecruiters;
    private Long onlineRecruiters;
    private Double recruiterOnlinePercentage;
    
    /**
     * Calcule un pourcentage en évitant la division par zéro
     * @param online Nombre d'utilisateurs en ligne
     * @param total Nombre total d'utilisateurs
     * @return Le pourcentage arrondi à 1 décimale
     */
    public static Double calculatePercentage(Long online, Long total) {
        if (total == null || total == 0) {
            return 0.0;
        }
        if (online == null) {
            online = 0L;
        }
        return Math.round((online.doubleValue() / total.doubleValue()) * 1000.0) / 10.0;
    }
    
    /**
     * Calcule automatiquement tous les pourcentages
     */
    public void calculateAllPercentages() {
        this.onlinePercentage = calculatePercentage(this.onlineUsers, this.totalUsers);
        this.adminOnlinePercentage = calculatePercentage(this.onlineAdmins, this.totalAdmins);
        this.recruiterOnlinePercentage = calculatePercentage(this.onlineRecruiters, this.totalRecruiters);
    }
}
