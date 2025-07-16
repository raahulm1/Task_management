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

    public List<Task> getTasksForSection(String sectionId) {
        return taskRepository.findBySectionId(sectionId);
    }

    public Task addTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(String id, Task task) {
        Task existing = taskRepository.findById(id).orElseThrow();
        
        // Only update fields that are not null to preserve existing data
        if (task.getName() != null) {
            existing.setName(task.getName());
        }
        if (task.getDescription() != null) {
            existing.setDescription(task.getDescription());
        }
        if (task.getPriority() != null) {
            existing.setPriority(task.getPriority());
        }
        if (task.getAssignedTo() != null) {
            existing.setAssignedTo(task.getAssignedTo());
        }
        if (task.getAssignedBy() != null) {
            existing.setAssignedBy(task.getAssignedBy());
        }
        if (task.getDueDate() != null) {
            existing.setDueDate(task.getDueDate());
        }
        if (task.getStatus() != null) {
            existing.setStatus(task.getStatus());
        }
        if (task.getSectionId() != null) {
            existing.setSectionId(task.getSectionId());
        }
        if (task.getSubtasks() != null) {
            existing.setSubtasks(task.getSubtasks());
        }
        
        return taskRepository.save(existing);
    }

    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }
}