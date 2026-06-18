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
@Table(name = "requete_inter_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequeteInterService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String objet;

    private String description;

    @Column(name = "infos_demandees")
    private String infosDemandees;

    private LocalDate dateCreation;

    @Column(name = "dateSoumssion")
    private LocalDate dateSoumission;

    @Enumerated(EnumType.STRING)
    private StatutRequete statut;

    @ManyToOne
    @JoinColumn(name = "auteur")
    private Utilisateur auteur;

    @ManyToOne
    @JoinColumn(name = "emetteur")
    private Service emetteur;

    @ManyToOne
    @JoinColumn(name = "recepteur")
    private Service recepteur;

    @OneToOne(mappedBy = "requeteInterService", cascade = CascadeType.ALL)
    @JsonIgnore
    private ReponseInterService reponse;

    @OneToMany(mappedBy = "requeteInterService", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<PieceJointe> pieceJointes;
}
