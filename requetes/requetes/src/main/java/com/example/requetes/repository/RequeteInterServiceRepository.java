package com.example.requetes.repository;

import com.example.requetes.entity.RequeteInterService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RequeteInterServiceRepository extends JpaRepository<RequeteInterService, Integer> {

    @Query(value = "SELECT * FROM `requete_inter_service` WHERE emetteur =:Emetteur", nativeQuery = true)
    List<RequeteInterService> findByEmetteurId(@Param("Emetteur") Integer serviceId);

    @Query(value = "SELECT * FROM `requete_inter_service` WHERE recepteur =:Recepteur", nativeQuery = true)
    List<RequeteInterService> findByRecepteurId(@Param("Recepteur") Integer serviceId);
}
