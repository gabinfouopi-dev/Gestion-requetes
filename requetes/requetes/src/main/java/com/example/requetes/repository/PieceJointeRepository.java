package com.example.requetes.repository;

import com.example.requetes.entity.PieceJointe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PieceJointeRepository extends JpaRepository<PieceJointe, Integer> {

    @Query(value = "SELECT * FROM pieceJointe WHERE requete =:ReqId", nativeQuery = true)
    List<PieceJointe> findAllByReqId(@Param("ReqId") Integer ReqId);

    @Query(value = "SELECT * FROM pieceJointe WHERE reponse =:ReqId", nativeQuery = true)
    List<PieceJointe> findAllByRepId(@Param("ReqId") Integer ReqId);

    @Query(value = "SELECT * FROM pieceJointe WHERE requete_inter_service =:ReqId", nativeQuery = true)
    List<PieceJointe> findAllByIsReqId(@Param("ReqId") Integer ReqId);

    @Query(value = "SELECT * FROM pieceJointe WHERE reponse_inter_service =:ReqId", nativeQuery = true)
    List<PieceJointe> findAllByIsRepId(@Param("ReqId") Integer ReqId);
}
