package com.example.requetes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategorieDTO {

    private Integer id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String description;

    private String priorite;

    @NotNull(message = "Le service est obligatoire")
    private Integer serviceId;

    private String serviceNom;
}
