package com.example.requetes.controller;

import com.example.requetes.dto.LoginReponse;
import com.example.requetes.dto.LoginRequest;
//import com.example.demoApp4.DTO.RegisterRequest;
import com.example.requetes.service.impl.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

//    @PostMapping("/register")
//    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
//
//        authService.register(request);
//
//        return ResponseEntity.ok(
//                "Utilisateur créé"
//        );
//    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        System.out.println("EMAIL = " + request.getEmail());

        System.out.println("MOTDEPASSE = " + request.getMotDePasse());

        LoginReponse loginReponse = authService.login(request);

        System.out.println("TOKEN GENERE = " + loginReponse.getToken());


        return ResponseEntity.ok(loginReponse);
    }
}
