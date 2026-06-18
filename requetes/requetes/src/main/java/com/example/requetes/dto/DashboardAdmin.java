package com.example.requetes.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAdmin {

    private Integer utilisateurs;
    private Integer etudiants;
    private Integer agents;
    private Integer services;
    private Integer categories;
    private Integer requetes;

}
