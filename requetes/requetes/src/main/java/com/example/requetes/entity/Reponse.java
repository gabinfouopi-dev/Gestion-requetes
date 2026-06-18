package com.example.requetes.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "reponse")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String titre;

    private String contenu;

    private LocalDate dateCreation;

    @OneToOne
    @JoinColumn(name = "requete")
    @JsonIgnore
    private Requete requete;

    @ManyToOne
    @JoinColumn(name = "auteur")
    private Utilisateur auteur;

    @OneToMany(mappedBy = "reponse", cascade = CascadeType.ALL)
//    @JsonIgnore
    private List<PieceJointe> pieceJointes;
}
