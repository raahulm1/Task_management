package com.example.taskmanagement.service;

import com.example.taskmanagement.model.User;
import com.example.taskmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User findOrCreateUser(String keycloakId, String name, String email) {
        User user = userRepository.findByKeycloakId(keycloakId);
        if (user == null) {
            user = new User();
            user.setId(keycloakId);
            user.setKeycloakId(keycloakId);
            user.setName(name);
            user.setEmail(email);
            userRepository.save(user);
        }
        return user;
    }

    public User getUserByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(String keycloakId, User user) {
        User existing = userRepository.findByKeycloakId(keycloakId);
        if (existing == null) return null;
        if (user.getName() != null) existing.setName(user.getName());
        if (user.getEmail() != null) existing.setEmail(user.getEmail());
        return userRepository.save(existing);
    }

    public void deleteUser(String keycloakId) {
        User existing = userRepository.findByKeycloakId(keycloakId);
        if (existing != null) userRepository.delete(existing);
    }
}
