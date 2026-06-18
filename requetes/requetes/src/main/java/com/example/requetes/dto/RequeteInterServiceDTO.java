package com.example.requetes.dto;

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
public class RequeteInterServiceDTO {

    private Integer id;

    @NotBlank(message = "L'objet est obligatoire")
    private String objet;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    private LocalDate dateCreation;

    private LocalDate dateSoumission;

    private StatutRequete statut;

    @NotNull(message = "L'auteur est obligatoire")
    private Integer auteurId;

    private String auteurNom;

    @NotNull(message = "Le service emetteur est obligatoire")
    private Integer emetteurId;

    private String emetteurNom;

    @NotNull(message = "Le service recepteur est obligatoire")
    private Integer recepteurId;

    private String recepteurNom;

    private String infosDemandees;
}
