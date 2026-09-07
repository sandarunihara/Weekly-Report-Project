package com.example.weeklyreport.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.weeklyreport.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(User.UserRole role);

    Page<User> findByRole(User.UserRole role, Pageable pageable);

    List<User> findAllByIsActiveTrue();

    long countByRole(User.UserRole role);
}
