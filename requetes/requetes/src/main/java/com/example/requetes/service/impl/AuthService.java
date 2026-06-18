package com.example.requetes.service.impl;


import com.example.requetes.dto.LoginReponse;
import com.example.requetes.dto.LoginRequest;
import com.example.requetes.entity.Utilisateur;
import com.example.requetes.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

//    public void register(RegisterRequest request) {
//
//        Utilisateur user = new Utilisateur();
//
//        user.setNom(request.getNom());
//        user.setEmail(request.getEmail());
//        user.setUsername(request.getEmail());
//        user.setStock(request.getStock());
//        user.setActif(true);
//
//        user.setMotDePasse(
//                passwordEncoder.encode(
//                        request.getPassword()
//                )
//        );
//
//        user.setRole(request.getRole());
//
//        userRepository.save(user);
//    }

    public LoginReponse login(LoginRequest request) {

        Utilisateur user = userRepository.findByEmail(request.getEmail())
                .or(() -> userRepository.findByEmail(request.getEmail()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email incorrects"));

//        if (!user.isActif()) {
//            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Compte désactivé");
//        }

        if (!(request.getMotDePasse().equals(user.getMotDePasse())) && !passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mot de passe incorrects");
        }

        String token = jwtService.generateToken(user);
        LoginReponse loginReponse = new LoginReponse();
        loginReponse.setToken(token);
        loginReponse.setUser(user);
        return loginReponse;
    }
}
