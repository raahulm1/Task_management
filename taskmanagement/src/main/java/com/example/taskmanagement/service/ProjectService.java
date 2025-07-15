package com.example.taskmanagement.service;

import com.example.taskmanagement.model.Project;
import com.example.taskmanagement.model.Team;
import com.example.taskmanagement.repository.ProjectRepository;
import com.example.taskmanagement.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private TeamRepository teamRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsForUser(String keycloakId) {
        // Projects created by the user
        List<Project> createdProjects = projectRepository.findByMetadataCreatedBy(keycloakId);
        // Teams where the user is a member
        List<Team> teams = teamRepository.findByMembersUserId(keycloakId);
        List<String> teamIds = teams.stream().map(Team::getId).collect(Collectors.toList());
        List<Project> teamProjects = teamIds.isEmpty() ? Collections.emptyList() : projectRepository.findByTeamIdIn(teamIds);
        // Combine and return unique projects
        Set<Project> allProjects = new HashSet<>(createdProjects);
        allProjects.addAll(teamProjects);
        return new ArrayList<>(allProjects);
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id).orElse(null);
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public Project updateProject(String id, Project project) {
        project.setId(id);
        return projectRepository.save(project);
    }

    public void deleteProject(String id) {
        projectRepository.deleteById(id);
    }
}