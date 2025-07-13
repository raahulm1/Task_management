package com.example.taskmanagement.service;

import com.example.taskmanagement.model.Task;
import com.example.taskmanagement.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getTasksForProject(String projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public Task addTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(String id, Task task) {
        Task existing = taskRepository.findById(id).orElseThrow();
        
        // Only update fields that are not null to preserve existing data
        if (task.getTitle() != null) {
            existing.setTitle(task.getTitle());
        }
        if (task.getDescription() != null) {
            existing.setDescription(task.getDescription());
        }
        if (task.getPriority() != null) {
            existing.setPriority(task.getPriority());
        }
        if (task.getAssignee() != null) {
            existing.setAssignee(task.getAssignee());
        }
        if (task.getDueDate() != null) {
            existing.setDueDate(task.getDueDate());
        }
        if (task.getStatus() != null) {
            existing.setStatus(task.getStatus());
        }
        
        return taskRepository.save(existing);
    }

    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }
}