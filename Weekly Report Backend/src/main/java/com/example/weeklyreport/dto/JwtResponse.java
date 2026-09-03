package com.example.weeklyreport.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class JwtResponse {
    
    private String token;
    private UUID id;
    private String fullName;
    private String email;
    private String role;

}
