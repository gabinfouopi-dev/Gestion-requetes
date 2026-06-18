package com.example.requetes.repository;

import com.example.requetes.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategorieRepository extends JpaRepository<Categorie, Integer> {
    List<Categorie> findByServiceId(Integer serviceId);
}
