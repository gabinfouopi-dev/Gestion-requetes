package com.example.requetes.repository;

import com.example.requetes.entity.Requete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RequeteRepository extends JpaRepository<Requete, Integer> {

    @Query(value = "SELECT * FROM `requete` WHERE utilisateur =:UtilisateurId", nativeQuery = true)
    List<Requete> findByUtilisateurId(@Param("UtilisateurId")Integer utilisateurId);

    @Query(value = "SELECT requete.* FROM `requete`, categorie WHERE requete.categorie = categorie.id AND categorie.service =:ServiceId", nativeQuery = true)
    List<Requete> findByCategorie_ServiceId(@Param("ServiceId")Integer serviceId);
}
