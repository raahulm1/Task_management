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
    public TaskRepository taskRepository;

    public List<Task> getTasksForProject(String projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksForSection(String sectionId) {
        return taskRepository.findBySectionId(sectionId);
    }

    public List<Task> getTasksForUser(String userId) {
        return taskRepository.findByAssignedTo(userId);
    }

    public Task addTask(Task task) {
        Task savedTask = taskRepository.save(task);
        // If this is a subtask, update parent
        if (savedTask.getParentTaskId() != null) {
            Task parent = taskRepository.findById(savedTask.getParentTaskId()).orElse(null);
            if (parent != null) {
                List<String> subtaskIds = parent.getSubtaskIds();
                if (subtaskIds == null) subtaskIds = new java.util.ArrayList<>();
                subtaskIds.add(savedTask.getId());
                parent.setSubtaskIds(subtaskIds);
                taskRepository.save(parent);
            }
        }
        return savedTask;
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
        if (task.getSubtaskIds() != null) {
            existing.setSubtaskIds(task.getSubtaskIds());
        }
        if (task.getParentTaskId() != null) {
            existing.setParentTaskId(task.getParentTaskId());
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
        if (updates.containsKey("subtaskIds")) {
            Object subtaskIdsObj = updates.get("subtaskIds");
            if (subtaskIdsObj instanceof List<?>) {
                try {
                    @SuppressWarnings("unchecked")
                    List<String> subtaskIds = (List<String>) subtaskIdsObj;
                    existing.setSubtaskIds(subtaskIds);
                } catch (ClassCastException e) {
                    throw new RuntimeException("Invalid type for subtaskIds", e);
                }
            }
        }
        if (updates.containsKey("parentTaskId")) {
            existing.setParentTaskId((String) updates.get("parentTaskId"));
        }
        return taskRepository.save(existing);
    }

    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }

    public List<Task> getSubtasks(String parentTaskId) {
        return taskRepository.findByParentTaskId(parentTaskId);
    }
}