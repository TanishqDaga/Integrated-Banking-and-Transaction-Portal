package com.Bank.BankingApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.Bank.BankingApp.entity.Bank;

public interface BankRepository extends JpaRepository<Bank, Long> {
}
