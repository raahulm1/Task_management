package com.example.taskmanagement.repository;

import com.example.taskmanagement.model.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
    List<Team> findByMembersUserId(String userId);
} 