package com.example.taskmanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "teams")
public class Team {
    @Id
    private String id;
    private String name;
    private List<Member> members;
    private List<String> projects;

    public static class Member {
        private String userId;
        private List<String> projectsAccess;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public List<String> getProjectsAccess() { return projectsAccess; }
        public void setProjectsAccess(List<String> projectsAccess) { this.projectsAccess = projectsAccess; }
    }

    // getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<Member> getMembers() { return members; }
    public void setMembers(List<Member> members) { this.members = members; }
    public List<String> getProjects() { return projects; }
    public void setProjects(List<String> projects) { this.projects = projects; }
} 