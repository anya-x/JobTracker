package com.jobtracker.repository;

import com.jobtracker.model.JobApplication;
import com.jobtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByLastName(String lastName);

    List<User> findByFirstName(String firstName);

}
