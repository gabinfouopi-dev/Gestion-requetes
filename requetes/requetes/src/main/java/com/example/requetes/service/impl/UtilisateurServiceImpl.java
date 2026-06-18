package com.example.requetes.service.impl;

import com.example.requetes.dto.UtilisateurDTO;
import com.example.requetes.entity.Service;
import com.example.requetes.entity.Utilisateur;
import com.example.requetes.exception.ResourceNotFoundException;
import com.example.requetes.repository.ServiceRepository;
import com.example.requetes.repository.UtilisateurRepository;
import com.example.requetes.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final ServiceRepository serviceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UtilisateurDTO> getAll() {
        return utilisateurRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UtilisateurDTO getById(Integer id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'id : " + id));
        return toDTO(utilisateur);
    }

    @Override
    public UtilisateurDTO getByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'id : " + email));
        return toDTO(utilisateur);
    }

    @Override
    public UtilisateurDTO create(UtilisateurDTO dto) {
        Utilisateur utilisateur = toEntity(dto);
        utilisateur.setMotDePasse(
                passwordEncoder.encode(
                        dto.getMotDePasse()
                )
        );

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return toDTO(saved);
    }

    @Override
    public UtilisateurDTO update(Integer id, UtilisateurDTO dto) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'id : " + id));

        utilisateur.setNom(dto.getNom());
        utilisateur.setPrenom(dto.getPrenom());
        utilisateur.setEmail(dto.getEmail());
        utilisateur.setMotDePasse(dto.getMotDePasse());
        utilisateur.setRole(dto.getRole());
        utilisateur.setTel(dto.getTel());

        if (dto.getServiceId() != null) {
            Service service = serviceRepository.findById(dto.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service non trouve avec l'id : " + dto.getServiceId()));
            utilisateur.setService(service);
        } else {
            utilisateur.setService(null);
        }

        Utilisateur updated = utilisateurRepository.save(utilisateur);
        return toDTO(updated);
    }

    @Override
    public void delete(Integer id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'id : " + id));
        utilisateurRepository.delete(utilisateur);
    }

    private UtilisateurDTO toDTO(Utilisateur utilisateur) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setEmail(utilisateur.getEmail());
        dto.setMotDePasse(utilisateur.getMotDePasse());
        dto.setRole(utilisateur.getRole());
        dto.setTel(utilisateur.getTel());

        if (utilisateur.getService() != null) {
            dto.setServiceId(utilisateur.getService().getId());
            dto.setServiceNom(utilisateur.getService().getNom());
        }

        return dto;
    }

    private Utilisateur toEntity(UtilisateurDTO dto) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(dto.getId());
        utilisateur.setNom(dto.getNom());
        utilisateur.setPrenom(dto.getPrenom());
        utilisateur.setEmail(dto.getEmail());
        utilisateur.setMotDePasse(dto.getMotDePasse());
        utilisateur.setRole(dto.getRole());
        utilisateur.setTel(dto.getTel());

        if (dto.getServiceId() != null) {
            Service service = serviceRepository.findById(dto.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service non trouve avec l'id : " + dto.getServiceId()));
            utilisateur.setService(service);
        }

        return utilisateur;
    }
}
