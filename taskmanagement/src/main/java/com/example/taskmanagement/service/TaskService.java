package com.example.taskmanagement.service;

import com.example.taskmanagement.model.Task;
import com.example.taskmanagement.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.text.ParseException;
import java.text.SimpleDateFormat;

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

    public Task patchTask(String id, Map<String, Object> updates) {
        Task existing = taskRepository.findById(id).orElseThrow();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        if (updates.containsKey("name")) {
            existing.setName((String) updates.get("name"));
        }
        if (updates.containsKey("description")) {
            existing.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("priority")) {
            existing.setPriority((String) updates.get("priority"));
        }
        if (updates.containsKey("assignedTo")) {
            existing.setAssignedTo((String) updates.get("assignedTo"));
        }
        if (updates.containsKey("assignedBy")) {
            existing.setAssignedBy((String) updates.get("assignedBy"));
        }
        if (updates.containsKey("dueDate")) {
            Object dueDateObj = updates.get("dueDate");
            if (dueDateObj instanceof String) {
                try {
                    existing.setDueDate(sdf.parse((String) dueDateObj));
                } catch (ParseException e) {
                    throw new RuntimeException("Invalid date format for dueDate", e);
                }
            } else if (dueDateObj instanceof java.util.Date) {
                existing.setDueDate((java.util.Date) dueDateObj);
            }
        }
        if (updates.containsKey("status")) {
            existing.setStatus((String) updates.get("status"));
        }
        if (updates.containsKey("sectionId")) {
            existing.setSectionId((String) updates.get("sectionId"));
        }
        if (updates.containsKey("subtasks")) {
            Object subtasksObj = updates.get("subtasks");
            if (subtasksObj instanceof List<?>) {
                try {
                    @SuppressWarnings("unchecked")
                    List<Task> subtasks = (List<Task>) subtasksObj;
                    existing.setSubtasks(subtasks);
                } catch (ClassCastException e) {
                    throw new RuntimeException("Invalid type for subtasks", e);
                }
            }
        }
        return taskRepository.save(existing);
    }

    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }
}