package com.example.requetes.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardEtudiant {

    private Integer total;
    private Integer enAttente;
    private Integer enCours;
    private Integer traite;
    private Integer Reponses;
}
