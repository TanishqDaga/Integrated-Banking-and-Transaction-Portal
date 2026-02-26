package com.Bank.BankingApp.mapper;

import com.Bank.BankingApp.Dto.AccountDto;
import com.Bank.BankingApp.entity.Account;

public class AccountMapper {
	public static Account mapToAccount(AccountDto accountDto) {
		Account account =new Account();
		account.setAccountHolderName(accountDto.getAccountHolderName());
		account.setBalance(accountDto.getBalance());
		return account;
	}
	public static AccountDto mapToAccountDto(Account account) {
		AccountDto accountDto =new AccountDto(
				account.getId(),
				account.getAccountHolderName(),
				account.getBalance()
		);
		return accountDto;
	}
}
