package com.example.requetes.service.impl;

import com.example.requetes.dto.ReponseInterServiceDTO;
import com.example.requetes.entity.ReponseInterService;
import com.example.requetes.entity.RequeteInterService;
import com.example.requetes.entity.Utilisateur;
import com.example.requetes.enums.StatutRequete;
import com.example.requetes.exception.ResourceNotFoundException;
import com.example.requetes.repository.ReponseInterServiceRepository;
import com.example.requetes.repository.RequeteInterServiceRepository;
import com.example.requetes.repository.UtilisateurRepository;
import com.example.requetes.service.ReponseInterServiceService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ReponseInterServiceServiceImpl implements ReponseInterServiceService {

    private final ReponseInterServiceRepository reponseInterServiceRepository;
    private final RequeteInterServiceRepository requeteInterServiceRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public List<ReponseInterServiceDTO> getAll() {
        return reponseInterServiceRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReponseInterServiceDTO getById(Integer id) {
        ReponseInterService reponse = reponseInterServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reponse inter-service non trouvee avec l'id : " + id));
        return toDTO(reponse);
    }

    @Override
    public ReponseInterServiceDTO getByRequeteInterServiceId(Integer requeteInterServiceId) {
        ReponseInterService reponse = reponseInterServiceRepository.findByRequeteInterServiceId(requeteInterServiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune reponse pour la requete inter-service avec l'id : " + requeteInterServiceId));
        return toDTO(reponse);
    }

    @Override
    public ReponseInterServiceDTO create(ReponseInterServiceDTO dto) {
        ReponseInterService reponse = new ReponseInterService();

        reponse.setTitre(dto.getTitre());
        reponse.setContenu(dto.getContenu());
        reponse.setDateCreation(dto.getDateCreation() != null ? dto.getDateCreation() : LocalDate.now());

        RequeteInterService requete = requeteInterServiceRepository.findById(dto.getIsrequeteId())
                .orElseThrow(() -> new ResourceNotFoundException("Requete inter-service non trouvee avec l'id : " + dto.getIsrequeteId()));
        reponse.setRequeteInterService(requete);

        Utilisateur auteur = utilisateurRepository.findById(dto.getAuteurId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'id : " + dto.getAuteurId()));
        reponse.setAuteur(auteur);

        ReponseInterService saved = reponseInterServiceRepository.save(reponse);

        requete.setStatut(StatutRequete.TRAITE);
        requeteInterServiceRepository.save(requete);

        return toDTO(saved);
    }

    @Override
    public void delete(Integer id) {
        ReponseInterService reponse = reponseInterServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reponse inter-service non trouvee avec l'id : " + id));
        reponseInterServiceRepository.delete(reponse);
    }

    private ReponseInterServiceDTO toDTO(ReponseInterService reponse) {
        ReponseInterServiceDTO dto = new ReponseInterServiceDTO();
        dto.setId(reponse.getId());
        dto.setTitre(reponse.getTitre());
        dto.setContenu(reponse.getContenu());
        dto.setDateCreation(reponse.getDateCreation());

        if (reponse.getRequeteInterService() != null) {
            dto.setIsrequeteId(reponse.getRequeteInterService().getId());
        }

        if (reponse.getAuteur() != null) {
            dto.setAuteurId(reponse.getAuteur().getId());
            dto.setAuteurNom(reponse.getAuteur().getNom() + " " + reponse.getAuteur().getPrenom());
        }

        return dto;
    }
}
