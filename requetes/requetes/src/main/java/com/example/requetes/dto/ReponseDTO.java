package com.example.requetes.dto;

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
public class ReponseDTO {

    private Integer id;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "Le contenu est obligatoire")
    private String contenu;

    private LocalDate dateCreation;

    @NotNull(message = "La requete est obligatoire")
    private Integer requeteId;

    @NotNull(message = "L'auteur est obligatoire")
    private Integer auteurId;

    private String auteurNom;

    private UtilisateurDTO auteur;
}
