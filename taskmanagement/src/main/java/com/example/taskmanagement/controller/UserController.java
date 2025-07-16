package com.example.taskmanagement.controller;

import com.example.taskmanagement.model.User;
import com.example.taskmanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{keycloakId}")
    public User getUserByKeycloakId(@PathVariable String keycloakId) {
        return userService.getUserByKeycloakId(keycloakId);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PutMapping("/{keycloakId}")
    public User updateUser(@PathVariable String keycloakId, @RequestBody User user) {
        return userService.updateUser(keycloakId, user);
    }

    @DeleteMapping("/{keycloakId}")
    public void deleteUser(@PathVariable String keycloakId) {
        userService.deleteUser(keycloakId);
    }
} 