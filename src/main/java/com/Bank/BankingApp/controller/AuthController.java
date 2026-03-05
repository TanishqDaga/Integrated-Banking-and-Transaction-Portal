package com.Bank.BankingApp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.Bank.BankingApp.entity.User;
import com.Bank.BankingApp.repository.UserRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public User register(@RequestBody User user){

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("CUSTOMER");

        return userRepository.save(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user){

        User existingUser = userRepository.findByUsername(user.getUsername());

        if(existingUser == null){
            return "User not found";
        }

        if(passwordEncoder.matches(user.getPassword(), existingUser.getPassword())){
            return "Login Successful";
        }

        return "Invalid Password";
    }
}