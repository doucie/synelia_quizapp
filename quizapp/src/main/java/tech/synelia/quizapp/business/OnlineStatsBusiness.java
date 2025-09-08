package tech.synelia.quizapp.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.dto.OnlineStatsDto;

/**
 * Service métier pour les statistiques d'utilisateurs en ligne (QEEL)
 * Gère la récupération et le calcul des statistiques depuis la base de données
 */
@Service
public class OnlineStatsBusiness {
    
    private static final Logger logger = LoggerFactory.getLogger(OnlineStatsBusiness.class);
    
    @Autowired
    private UserRepository userRepository;
    
    // Constants pour les rôles utilisateurs
    private static final String ROLE_ADMIN = "admin";
    private static final String ROLE_RECRUITER = "recruiter";
    
    /**
     * Récupère toutes les statistiques d'utilisateurs en ligne depuis la base de données
     * @return OnlineStatsDto avec toutes les statistiques calculées
     */
    public OnlineStatsDto getOnlineStats() {
        logger.info("Récupération des statistiques QEEL depuis la base de données");
        
        try {
            OnlineStatsDto stats = new OnlineStatsDto();
            
            // Statistiques générales
            stats.setTotalUsers(userRepository.countTotalUsers());
            stats.setOnlineUsers(userRepository.countOnlineUsers());
            
            // Statistiques des administrateurs
            stats.setTotalAdmins(userRepository.countUsersByRole(ROLE_ADMIN));
            stats.setOnlineAdmins(userRepository.countOnlineUsersByRole(ROLE_ADMIN));
            
            // Statistiques des recruteurs
            stats.setTotalRecruiters(userRepository.countUsersByRole(ROLE_RECRUITER));
            stats.setOnlineRecruiters(userRepository.countOnlineUsersByRole(ROLE_RECRUITER));
            
            // Calcul automatique des pourcentages
            stats.calculateAllPercentages();
            
            logger.info("Statistiques QEEL récupérées: {} utilisateurs total, {} en ligne", 
                       stats.getTotalUsers(), stats.getOnlineUsers());
            
            return stats;
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques QEEL", e);
            // Retourner des statistiques par défaut en cas d'erreur
            return getFallbackStats();
        }
    }
    
    /**
     * Récupère uniquement le nombre d'utilisateurs en ligne
     * @return Le nombre d'utilisateurs connectés
     */
    public Long getOnlineUsersCount() {
        logger.info("Récupération du nombre d'utilisateurs en ligne");
        
        try {
            Long count = userRepository.countOnlineUsers();
            logger.info("Nombre d'utilisateurs en ligne: {}", count);
            return count;
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du nombre d'utilisateurs en ligne", e);
            return 0L; // Valeur par défaut en cas d'erreur
        }
    }
    
    /**
     * Statistiques de fallback en cas d'erreur de base de données
     * @return OnlineStatsDto avec des valeurs par défaut
     */
    private OnlineStatsDto getFallbackStats() {
        logger.warn("Utilisation des statistiques de fallback");
        
        OnlineStatsDto fallback = new OnlineStatsDto();
        fallback.setTotalUsers(0L);
        fallback.setOnlineUsers(0L);
        fallback.setTotalAdmins(0L);
        fallback.setOnlineAdmins(0L);
        fallback.setTotalRecruiters(0L);
        fallback.setOnlineRecruiters(0L);
        fallback.calculateAllPercentages();
        
        return fallback;
    }
}
