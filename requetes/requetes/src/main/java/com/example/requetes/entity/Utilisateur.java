package com.example.requetes.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.requetes.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "utilisateur")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nom;

    private String prenom;

    private String email;

    @Column(name = "mot_de_passe")
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String tel;

    @ManyToOne
    @JoinColumn(name = "service")
    private Service service;

    @OneToMany(mappedBy = "utilisateur")
    @JsonIgnore
    private List<Requete> requetes;

    @OneToMany(mappedBy = "auteur")
    @JsonIgnore
    private List<Reponse> reponses;

    @OneToMany(mappedBy = "auteur")
    @JsonIgnore
    private List<RequeteInterService> requetesInterServices;

    @OneToMany(mappedBy = "auteur")
    @JsonIgnore
    private List<ReponseInterService> reponsesInterServices;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return motDePasse;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

}
