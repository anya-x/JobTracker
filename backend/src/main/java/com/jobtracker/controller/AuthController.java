package com.jobtracker.controller;

import com.jobtracker.dto.AuthResponseDTO;
import com.jobtracker.dto.LoginDTO;
import com.jobtracker.dto.RegisterDTO;
import com.jobtracker.model.User;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterDTO signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponseDTO(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody RegisterDTO loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponseDTO(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        ));
    }
}
