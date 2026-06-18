package com.example.requetes.repository;

import com.example.requetes.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    @Query(value = "SELECT * FROM `utilisateur` WHERE email =:Email", nativeQuery = true)
    Optional<Utilisateur> findByEmail(@Param("Email") String Email);
}
