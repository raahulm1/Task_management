package com.example.taskmanagement.service;

import com.example.taskmanagement.model.User;
import com.example.taskmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
