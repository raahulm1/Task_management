package com.example.taskmanagement.repository;

import com.example.taskmanagement.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByProjectId(String projectId);
    List<Task> findBySectionId(String sectionId);
    List<Task> findByParentTaskId(String parentTaskId);
    List<Task> findByAssignedTo(String assignedTo);
}