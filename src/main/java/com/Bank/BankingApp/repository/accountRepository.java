package com.Bank.BankingApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Bank.BankingApp.entity.Account;
import java.util.*;

public interface AccountRepository extends JpaRepository<Account,Long> {
	List<Account> findByUserUserId(Long userId);
	List<Account> findByStatus(String status);
		

}
