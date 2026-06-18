package com.example.requetes.repository;

import com.example.requetes.entity.ReponseInterService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReponseInterServiceRepository extends JpaRepository<ReponseInterService, Integer> {
    @Query(value = "SELECT * FROM `reponse_inter_service` WHERE requete_inter_service =:RequeteInterServiceId", nativeQuery = true)
    Optional<ReponseInterService> findByRequeteInterServiceId(@Param("RequeteInterServiceId") Integer requeteInterServiceId);
}
