package tech.synelia.quizapp.business;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

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
    
    private static final String ROLE_ADMIN = "admin";
    private static final String ROLE_RECRUITER = "recruiter";
    
    /**
     * Récupère toutes les statistiques QEEL en une seule requête GROUP BY
     */
    @Cacheable("qeelStats")
    public OnlineStatsDto getOnlineStats() {
        logger.debug("Récupération des statistiques QEEL depuis la base de données");
        
        try {
            OnlineStatsDto stats = new OnlineStatsDto();
            stats.setTotalUsers(0L);
            stats.setOnlineUsers(0L);
            stats.setTotalAdmins(0L);
            stats.setOnlineAdmins(0L);
            stats.setTotalRecruiters(0L);
            stats.setOnlineRecruiters(0L);
            
            List<Object[]> rows = userRepository.countUsersGroupedByRole();
            for (Object[] row : rows) {
                String role = (String) row[0];
                Long total = (Long) row[1];
                Long online = (Long) row[2];
                
                stats.setTotalUsers(stats.getTotalUsers() + total);
                stats.setOnlineUsers(stats.getOnlineUsers() + online);
                
                if (ROLE_ADMIN.equalsIgnoreCase(role)) {
                    stats.setTotalAdmins(total);
                    stats.setOnlineAdmins(online);
                } else if (ROLE_RECRUITER.equalsIgnoreCase(role)) {
                    stats.setTotalRecruiters(total);
                    stats.setOnlineRecruiters(online);
                }
            }
            
            stats.calculateAllPercentages();
            
            logger.debug("Statistiques QEEL récupérées: {} utilisateurs total, {} en ligne", 
                       stats.getTotalUsers(), stats.getOnlineUsers());
            
            return stats;
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques QEEL", e);
            return getFallbackStats();
        }
    }
    
    /**
     * Récupère uniquement le nombre d'utilisateurs en ligne
     */
    public Long getOnlineUsersCount() {
        logger.debug("Récupération du nombre d'utilisateurs en ligne");
        
        try {
            OnlineStatsDto stats = getOnlineStats();
            return stats.getOnlineUsers();
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du nombre d'utilisateurs en ligne", e);
            return 0L;
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
