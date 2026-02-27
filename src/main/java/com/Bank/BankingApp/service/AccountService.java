package com.Bank.BankingApp.service;

import com.Bank.BankingApp.Dto.AccountDto;

public interface AccountService {
	AccountDto createAccount(AccountDto accountDto);
	
	AccountDto getAccountById(Long id);
	
	
	AccountDto deposit(Long id,double amount);
}
