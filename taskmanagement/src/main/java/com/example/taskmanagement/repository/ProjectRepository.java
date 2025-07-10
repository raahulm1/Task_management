package com.example.taskmanagement.repository;

import com.example.taskmanagement.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByOwnerId(String ownerId);
}