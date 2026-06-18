package com.example.requetes.repository;

import com.example.requetes.entity.Reponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReponseRepository extends JpaRepository<Reponse, Integer> {
    @Query(value = "SELECT * FROM `reponse` WHERE requete =:RequeteId", nativeQuery = true)
    Optional<Reponse> findByRequeteId(@Param("RequeteId") Integer requeteId);

    @Query(value = "SELECT reponse.* FROM reponse, requete WHERE reponse.requete = requete.id AND requete.utilisateur =:UserId", nativeQuery = true)
    List<Reponse> findByUserId(@Param("UserId") Integer userId);
}
