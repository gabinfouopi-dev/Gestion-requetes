package com.example.requetes.service.impl;

import com.example.requetes.dto.RequeteInterServiceDTO;
import com.example.requetes.dto.StatutDTO;
import com.example.requetes.entity.Requete;
import com.example.requetes.entity.RequeteInterService;
import com.example.requetes.entity.Service;
import com.example.requetes.entity.Utilisateur;
import com.example.requetes.enums.StatutRequete;
import com.example.requetes.exception.ResourceNotFoundException;
import com.example.requetes.repository.RequeteInterServiceRepository;
import com.example.requetes.repository.ServiceRepository;
import com.example.requetes.repository.UtilisateurRepository;
import com.example.requetes.service.RequeteInterServiceService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class RequeteInterServiceServiceImpl implements RequeteInterServiceService {

    private final RequeteInterServiceRepository requeteInterServiceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ServiceRepository serviceRepository;

    @Override
    public List<RequeteInterServiceDTO> getAll() {
        return requeteInterServiceRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RequeteInterServiceDTO getById(Integer id) {
        RequeteInterService requete = requeteInterServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete inter-service non trouvee avec l'id : " + id));
        return toDTO(requete);
    }

    @Override
    public List<RequeteInterServiceDTO> getByEmetteurId(Integer serviceId) {
        return requeteInterServiceRepository.findByEmetteurId(serviceId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RequeteInterServiceDTO> getByRecepteurId(Integer serviceId) {
        return requeteInterServiceRepository.findByRecepteurId(serviceId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RequeteInterServiceDTO create(RequeteInterServiceDTO dto) {
        RequeteInterService requete = new RequeteInterService();

        requete.setObjet(dto.getObjet());
        requete.setDescription(dto.getDescription());
        requete.setInfosDemandees(dto.getInfosDemandees());
        requete.setDateCreation(dto.getDateCreation() != null ? dto.getDateCreation() : LocalDate.now());
        requete.setDateSoumission(LocalDate.now());
        requete.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutRequete.EN_ATTENTE);

        Utilisateur auteur = utilisateurRepository.findById(dto.getAuteurId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'id : " + dto.getAuteurId()));
        requete.setAuteur(auteur);

        Service emetteur = serviceRepository.findById(dto.getEmetteurId())
                .orElseThrow(() -> new ResourceNotFoundException("Service emetteur non trouve avec l'id : " + dto.getEmetteurId()));
        requete.setEmetteur(emetteur);

        Service recepteur = serviceRepository.findById(dto.getRecepteurId())
                .orElseThrow(() -> new ResourceNotFoundException("Service recepteur non trouve avec l'id : " + dto.getRecepteurId()));
        requete.setRecepteur(recepteur);

        RequeteInterService saved = requeteInterServiceRepository.save(requete);
        return toDTO(saved);
    }

    @Override
    public RequeteInterServiceDTO update(Integer id, RequeteInterServiceDTO dto) {
        RequeteInterService requete = requeteInterServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete inter-service non trouvee avec l'id : " + id));

        requete.setObjet(dto.getObjet());
        requete.setDescription(dto.getDescription());

        if (dto.getStatut() != null) {
            requete.setStatut(dto.getStatut());
        }

        RequeteInterService updated = requeteInterServiceRepository.save(requete);
        return toDTO(updated);
    }

    @Override
    public void delete(Integer id) {
        RequeteInterService requete = requeteInterServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete inter-service non trouvee avec l'id : " + id));
        requeteInterServiceRepository.delete(requete);
    }

    @Override
    public RequeteInterServiceDTO changerStatut(Integer id, StatutDTO statut) {
        RequeteInterService requete = requeteInterServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete non trouvee avec l'id : " + id));

        requete.setStatut(statut.getStatut());

        RequeteInterService updated = requeteInterServiceRepository.save(requete);
        return toDTO(updated);
    }

    private RequeteInterServiceDTO toDTO(RequeteInterService requete) {
        RequeteInterServiceDTO dto = new RequeteInterServiceDTO();
        dto.setId(requete.getId());
        dto.setObjet(requete.getObjet());
        dto.setDescription(requete.getDescription());
        dto.setDateCreation(requete.getDateCreation());
        dto.setDateSoumission(requete.getDateSoumission());
        dto.setStatut(requete.getStatut());
        dto.setInfosDemandees(requete.getInfosDemandees());

        if (requete.getAuteur() != null) {
            dto.setAuteurId(requete.getAuteur().getId());
            dto.setAuteurNom(requete.getAuteur().getNom() + " " + requete.getAuteur().getPrenom());
        }

        if (requete.getEmetteur() != null) {
            dto.setEmetteurId(requete.getEmetteur().getId());
            dto.setEmetteurNom(requete.getEmetteur().getNom());
        }

        if (requete.getRecepteur() != null) {
            dto.setRecepteurId(requete.getRecepteur().getId());
            dto.setRecepteurNom(requete.getRecepteur().getNom());
        }

        return dto;
    }
}
