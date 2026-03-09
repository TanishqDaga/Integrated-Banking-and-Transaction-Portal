package com.Bank.BankingApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.Bank.BankingApp.entity.Transaction;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
	List<Transaction> findBySourceAccountUserUserIdOrTargetAccountUserUserId(Long sourceUserId, Long targetUserId);
}