package com.example.taskmanagement.repository;

import com.example.taskmanagement.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByName(String name);
}