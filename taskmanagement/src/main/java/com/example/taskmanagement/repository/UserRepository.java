package com.example.taskmanagement.repository;

import com.example.taskmanagement.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByKeycloakId(String keycloakId);
}