package com.Bank.BankingApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.Bank.BankingApp.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

}