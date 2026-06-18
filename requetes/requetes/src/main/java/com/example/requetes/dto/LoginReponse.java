package com.example.requetes.dto;

import com.example.requetes.entity.Utilisateur;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LoginReponse {

    private String token;
    private Utilisateur user;

}
