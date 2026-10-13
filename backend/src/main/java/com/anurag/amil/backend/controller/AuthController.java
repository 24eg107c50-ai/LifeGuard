package com.anurag.amil.backend.controller;

import com.anurag.amil.backend.model.User;
import com.anurag.amil.backend.repository.UserRepository;
import com.anurag.amil.backend.service.SmsService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository repository;
    private final SmsService smsService;

    private final BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder();

    public AuthController(
            UserRepository repository,
            SmsService smsService) {

        this.repository = repository;
        this.smsService = smsService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (user.getFullName() == null
                || user.getEmail() == null
                || user.getMobile() == null
                || user.getPassword() == null) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "All fields are required.")
            );
        }

        if (user.getFullName().isBlank()
                || user.getEmail().isBlank()
                || user.getMobile().isBlank()
                || user.getPassword().length() < 8) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Enter valid details and a password of at least 8 characters."
                    )
            );
        }

        String email = user.getEmail().trim().toLowerCase();
        String mobile = user.getMobile().trim();

        if (repository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email already registered.")
            );
        }

        if (repository.existsByMobile(mobile)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Mobile number already registered.")
            );
        }

        user.setFullName(user.getFullName().trim());
        user.setEmail(email);
        user.setMobile(mobile);
        user.setPassword(encoder.encode(user.getPassword()));

        User savedUser = repository.save(user);

        String smsStatus = "NOT_SENT";

        try {
            smsService.sendSms(
                    savedUser.getMobile(),
                    "Welcome to LifeGuard! Your registration was successful."
            );

            smsStatus = "REQUEST_ACCEPTED";

        } catch (Exception e) {
            System.err.println(
                    "SMS sending failed: " + e.getMessage()
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Registration successful.",
                        "smsStatus", smsStatus
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> data) {

        String email = data.get("email");
        String password = data.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required.")
            );
        }

        User user = repository
                .findByEmail(email.trim().toLowerCase())
                .orElse(null);

        if (user == null
                || !encoder.matches(password, user.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password.")
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful.",
                        "fullName", user.getFullName(),
                        "email", user.getEmail()
                )
        );
    }
}