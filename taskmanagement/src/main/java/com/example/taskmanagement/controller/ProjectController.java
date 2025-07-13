package com.example.taskmanagement.controller;

import com.example.taskmanagement.model.Project;
import com.example.taskmanagement.security.JwtUtil;
import com.example.taskmanagement.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {
    @Autowired
    private ProjectService projectService;
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public List<Project> getProjects(@RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.getUserIdFromJwt(authHeader.replace("Bearer ", ""));
        return projectService.getProjectsForUser(userId);
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable String id, @RequestHeader("Authorization") String authHeader) {
        // Optionally, you can check if the user is authorized to access this project
        return projectService.getProjectById(id);
    }

    @PostMapping
    public Project createProject(@RequestBody Project project, @RequestHeader("Authorization") String authHeader) {
        String userId = jwtUtil.getUserIdFromJwt(authHeader.replace("Bearer ", ""));
        project.setOwnerId(userId);
        return projectService.createProject(project);
    }
}