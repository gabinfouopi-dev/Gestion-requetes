package com.example.requetes.dto;

import com.example.requetes.entity.Categorie;
import com.example.requetes.entity.Utilisateur;
import com.example.requetes.enums.StatutRequete;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequeteDTO {

    private Integer id;

    @NotBlank(message = "L'objet est obligatoire")
    private String objet;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    private LocalDate dateCreation;

    private LocalDate dateSoumission;

    private StatutRequete statut;

    @NotNull(message = "L'utilisateur est obligatoire")
    private Integer utilisateurId;

    private String utilisateurNom;

    @NotNull(message = "La categorie est obligatoire")
    private Integer categorieId;

    private String categorieNom;

    private Categorie categorie;
    private Utilisateur utilisateur;
}
