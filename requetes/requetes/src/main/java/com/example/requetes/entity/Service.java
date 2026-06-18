package com.example.requetes.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nom;

    private String description;

    @OneToMany(mappedBy = "service")
    @JsonIgnore
    private List<Utilisateur> utilisateurs;

    @OneToMany(mappedBy = "service")
    @JsonIgnore
    private List<Categorie> categories;

    @OneToMany(mappedBy = "emetteur")
    @JsonIgnore
    private List<RequeteInterService> requetesEmises;

    @OneToMany(mappedBy = "recepteur")
    @JsonIgnore
    private List<RequeteInterService> requetesRecues;
}
