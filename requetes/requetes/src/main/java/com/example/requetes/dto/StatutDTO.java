package com.example.requetes.dto;

import com.example.requetes.enums.StatutRequete;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatutDTO {

    @NotBlank(message = "Le statut est obligatoire")
    private StatutRequete statut;
}
