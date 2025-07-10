package com.example.taskmanagement.service;

import com.example.taskmanagement.model.User;
import com.example.taskmanagement.repository.UserRepository;
import com.example.taskmanagement.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;

    public User register(User user) {
        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        return userRepository.save(user);
    }

    public String login(String name, String password) {
        Optional<User> userOpt = userRepository.findByName(name);
        if (userOpt.isPresent() && BCrypt.checkpw(password, userOpt.get().getPassword())) {
            return jwtUtil.generateToken(userOpt.get().getId());
        }
        throw new RuntimeException("Invalid credentials");
    }
}