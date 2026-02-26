package com.Bank.BankingApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Bank.BankingApp.entity.Account;

public interface AccountRepository extends JpaRepository<Account,Long> {
		

}
