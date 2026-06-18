package com.example.requetes.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "piecejointe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PieceJointe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nomFichier")
    private String nomFichier;

    private String chemin;

    @ManyToOne
    @JoinColumn(name = "requete")
    @JsonIgnore
    private Requete requete;

    @ManyToOne
    @JoinColumn(name = "reponse")
    @JsonIgnore
    private Reponse reponse;

    @ManyToOne
    @JoinColumn(name = "requete_inter_service")
    @JsonIgnore
    private RequeteInterService requeteInterService;

    @ManyToOne
    @JoinColumn(name = "reponse_inter_service")
    @JsonIgnore
    private ReponseInterService reponseInterService;
}
