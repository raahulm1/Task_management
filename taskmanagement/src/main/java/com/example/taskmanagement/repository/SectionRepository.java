package com.example.taskmanagement.repository;

import com.example.taskmanagement.model.Section;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SectionRepository extends MongoRepository<Section, String> {
    List<Section> findByProjectId(String projectId);
} 