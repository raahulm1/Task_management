package com.example.taskmanagement.service;

import com.example.taskmanagement.model.Project;
import com.example.taskmanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    public List<Project> getProjectsForUser(String userId) {
        return projectRepository.findByOwnerId(userId);
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }
}