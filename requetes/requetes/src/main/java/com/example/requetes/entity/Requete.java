package com.example.requetes.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.requetes.enums.StatutRequete;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "requete")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Requete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String objet;

    private String description;

    private LocalDate dateCreation;

    @Column(name = "dateSoumssion")
    private LocalDate dateSoumission;

    @Enumerated(EnumType.STRING)
    private StatutRequete statut;

    @ManyToOne
    @JoinColumn(name = "utilisateur")
    private Utilisateur utilisateur;

    @ManyToOne
    @JoinColumn(name = "categorie")
    private Categorie categorie;

    @OneToOne(mappedBy = "requete", cascade = CascadeType.ALL)
    @JsonIgnore
    private Reponse reponse;

    @OneToMany(mappedBy = "requete", cascade = CascadeType.ALL)

    private List<PieceJointe> pieceJointes;
}
