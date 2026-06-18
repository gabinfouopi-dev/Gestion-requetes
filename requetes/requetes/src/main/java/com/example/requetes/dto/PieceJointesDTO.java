package com.example.requetes.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PieceJointesDTO {

    @NotBlank
    private String nomFichier;

    @NotBlank
    private String chemin;

    private Integer requeteId;

    private Integer reponseId;

    private Integer requeteInterServiceId;

    private Integer reponseInterServiceId;
}
