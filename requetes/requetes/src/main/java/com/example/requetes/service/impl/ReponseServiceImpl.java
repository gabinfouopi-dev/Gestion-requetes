package com.example.requetes.service.impl;

import com.example.requetes.dto.ReponseDTO;
import com.example.requetes.entity.Reponse;
import com.example.requetes.entity.Requete;
import com.example.requetes.entity.Utilisateur;
import com.example.requetes.enums.StatutRequete;
import com.example.requetes.exception.ResourceNotFoundException;
import com.example.requetes.repository.ReponseRepository;
import com.example.requetes.repository.RequeteRepository;
import com.example.requetes.repository.UtilisateurRepository;
import com.example.requetes.service.ReponseService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ReponseServiceImpl implements ReponseService {

    private final ReponseRepository reponseRepository;
    private final RequeteRepository requeteRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public List<ReponseDTO> getAll() {
        return reponseRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Reponse> getMyReponses(Integer userId) {
        return reponseRepository.findByUserId(userId)
                .stream()
                .collect(Collectors.toList());
    }

    @Override
    public ReponseDTO getById(Integer id) {
        Reponse reponse = reponseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reponse non trouvee avec l'id : " + id));
        return toDTO(reponse);
    }

    @Override
    public ReponseDTO getByRequeteId(Integer requeteId) {
        Reponse reponse = reponseRepository.findByRequeteId(requeteId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune reponse pour la requete avec l'id : " + requeteId));
        return toDTO(reponse);
    }

    @Override
    public ReponseDTO create(ReponseDTO dto) {
        Reponse reponse = new Reponse();

        reponse.setTitre(dto.getTitre());
        reponse.setContenu(dto.getContenu());
        reponse.setDateCreation(dto.getDateCreation() != null ? dto.getDateCreation() : LocalDate.now());

        Requete requete = requeteRepository.findById(dto.getRequeteId())
                .orElseThrow(() -> new ResourceNotFoundException("Requete non trouvee avec l'id : " + dto.getRequeteId()));
        reponse.setRequete(requete);

        Utilisateur auteur = utilisateurRepository.findById(dto.getAuteurId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'id : " + dto.getAuteurId()));
        reponse.setAuteur(auteur);

        Reponse saved = reponseRepository.save(reponse);

        requete.setStatut(StatutRequete.TRAITE);
        requeteRepository.save(requete);

        return toDTO(saved);
    }

    @Override
    public void delete(Integer id) {
        Reponse reponse = reponseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reponse non trouvee avec l'id : " + id));
        reponseRepository.delete(reponse);
    }

    private ReponseDTO toDTO(Reponse reponse) {
        ReponseDTO dto = new ReponseDTO();
        dto.setId(reponse.getId());
        dto.setTitre(reponse.getTitre());
        dto.setContenu(reponse.getContenu());
        dto.setDateCreation(reponse.getDateCreation());

        if (reponse.getRequete() != null) {
            dto.setRequeteId(reponse.getRequete().getId());
        }

        if (reponse.getAuteur() != null) {
            dto.setAuteurId(reponse.getAuteur().getId());
            dto.setAuteurNom(reponse.getAuteur().getNom() + " " + reponse.getAuteur().getPrenom());
        }

        return dto;
    }
}
