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
@Table(name = "reponse_inter_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReponseInterService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String titre;

    private String contenu;

    private LocalDate dateCreation;

    @OneToOne
    @JoinColumn(name = "requete_inter_service")
    @JsonIgnore
    private RequeteInterService requeteInterService;

    @ManyToOne
    @JoinColumn(name = "auteur")
    private Utilisateur auteur;

    @OneToMany(mappedBy = "reponseInterService", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<PieceJointe> pieceJointes;
}
