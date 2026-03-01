package com.Bank.BankingApp.mapper;

import com.Bank.BankingApp.Dto.AccountDto;
import com.Bank.BankingApp.entity.Account;

public class AccountMapper {
	public static Account mapToAccount(AccountDto accountDto) {
		Account account =new Account();
		account.setAccountHolderName(accountDto.accountHolderName());
		account.setBalance(accountDto.balance());
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
