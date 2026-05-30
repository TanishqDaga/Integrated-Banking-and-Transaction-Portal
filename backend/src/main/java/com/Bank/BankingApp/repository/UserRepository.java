package com.Bank.BankingApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.Bank.BankingApp.entity.User;

public interface UserRepository extends JpaRepository<User,Long>{

    User findByUsername(String username);

}