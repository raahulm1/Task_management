package com.example.taskmanagement.controller;

import com.example.taskmanagement.model.Task;
import com.example.taskmanagement.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @GetMapping("/{projectId}")
    public List<Task> getTasks(@PathVariable String projectId) {
        return taskService.getTasksForProject(projectId);
    }

    @PostMapping
    public Task addTask(@RequestBody Task task) {
        return taskService.addTask(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable String id, @RequestBody Task task) {
        return taskService.updateTask(id, task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
    }

    @PatchMapping("/{id}")
    public Task patchTask(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return taskService.patchTask(id, updates);
    }

    @GetMapping("/task/{id}")
    public ResponseEntity<?> getTaskWithSubtasks(@PathVariable String id) {
        Task task = taskService.taskRepository.findById(id).orElse(null);
        if (task == null) return ResponseEntity.notFound().build();
        // Fetch subtasks
        java.util.List<Task> subtasks = taskService.getSubtasks(id);
        // Return as DTO
        java.util.Map<String, Object> dto = new HashMap<>();
        dto.put("task", task);
        dto.put("subtasks", subtasks);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/user/{userId}")
    public List<Task> getTasksForUser(@PathVariable String userId) {
        return taskService.getTasksForUser(userId);
    }
}