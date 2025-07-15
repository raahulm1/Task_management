package com.example.taskmanagement.repository;

import com.example.taskmanagement.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByTeamId(String teamId);
    List<Project> findByMetadataCreatedBy(String createdBy);
    List<Project> findByTeamIdIn(List<String> teamIds);
}