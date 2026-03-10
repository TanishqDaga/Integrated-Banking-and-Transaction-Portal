package com.Bank.BankingApp.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.stream.Collectors;


import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.Bank.BankingApp.Dto.AccountDto;
import com.Bank.BankingApp.entity.Account;
import com.Bank.BankingApp.entity.Bank;
import com.Bank.BankingApp.entity.Transaction;
import com.Bank.BankingApp.entity.User;
import com.Bank.BankingApp.exception.AccountException;
import com.Bank.BankingApp.mapper.AccountMapper;
import com.Bank.BankingApp.repository.AccountRepository;
import com.Bank.BankingApp.repository.BankRepository;
import com.Bank.BankingApp.repository.TransactionRepository;
import com.Bank.BankingApp.repository.UserRepository;
import com.Bank.BankingApp.service.AccountService;

import jakarta.transaction.Transactional;

@Service
public class AccountServiceImpl implements AccountService {
	@Autowired
	private AccountRepository accountRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private TransactionRepository transactionRepository;
	@Autowired
	private BankRepository bankRepository;
	
	
	public AccountServiceImpl(AccountRepository accountRepository) {
		super();
		this.accountRepository = accountRepository;
	}

	@Override
	public AccountDto createAccount(AccountDto accountDto){

	    Authentication auth =
	            SecurityContextHolder.getContext().getAuthentication();

	    String username = auth.getName();

	    User user = userRepository.findByUsername(username);

	    Account account = AccountMapper.mapToAccount(accountDto);

	    account.setUser(user);

	    // attach bank
	    Bank bank = bankRepository.findById(accountDto.bankId())
	            .orElseThrow(() -> new RuntimeException("Bank not found"));

	    account.setBank(bank);

	    // account needs admin approval
	    account.setStatus("PENDING");

	    Account savedAccount = accountRepository.save(account);

	    return AccountMapper.mapToAccountDto(savedAccount);
	}
	
	@Override
	public AccountDto getAccountById(Long id) {
		Account account= accountRepository
				.findById(id)
				.orElseThrow(() -> new AccountException("Account does not exists"));
		return AccountMapper.mapToAccountDto(account);
	}

	@Override
	public AccountDto deposit(Long id, double amount) {
		Account account= accountRepository
				.findById(id)
				.orElseThrow(() -> new AccountException("Account does not exists"));
		double total =account.getBalance()+amount;
		account.setBalance(total);
		Account savedAccount=accountRepository.save(account);
		return AccountMapper.mapToAccountDto(savedAccount);
		
	}

	@Override
	public AccountDto withdraw(Long id, double amount) {
		Account account= accountRepository
				.findById(id)
				.orElseThrow(() -> new AccountException("Account does not exists"));
		if(account.getBalance()<amount) {
			throw new AccountException("Insufficient Balance ");
		}
		double total =account.getBalance()-amount;
		account.setBalance(total);
		Account savedAccount=accountRepository.save(account);
		return AccountMapper.mapToAccountDto(savedAccount);
		
	}

	@Override
	public List<AccountDto> getAllAccounts(){
		List<Account> accounts=accountRepository.findAll();
		return accounts.stream().map((account)->AccountMapper.mapToAccountDto(account))
				.collect(Collectors.toList());
	}

	@Override
	public void deleteAccount(Long id) {
		Account account= accountRepository
				.findById(id)
				.orElseThrow(() -> new AccountException("Account does not exists"));
		accountRepository.deleteById(id);
		
	}
	
	@Transactional 
	@Override
	public List<AccountDto> transferFund(Long fromId, Long toId, double amount) {
		Account senderAccount= accountRepository
				.findById(fromId)
				.orElseThrow(() -> new AccountException("Sender Account does not exists"));
		Account receiverAccount= accountRepository
				.findById(toId)
				.orElseThrow(() -> new AccountException("Receiver Account does not exists"));
		if (senderAccount.getBalance() < amount) {
	        throw new AccountException("Insufficient balance");
	    }

		double senderTotal =senderAccount.getBalance()-amount;
		senderAccount.setBalance(senderTotal);
		Account savedSenderAccount=accountRepository.save(senderAccount);
		
		double total =receiverAccount.getBalance()+amount;
		receiverAccount.setBalance(total);
		Account savedReceiverAccount=accountRepository.save(receiverAccount);
		
		AccountDto senderDto = AccountMapper.mapToAccountDto(savedSenderAccount);
	    AccountDto receiverDto = AccountMapper.mapToAccountDto(savedReceiverAccount);

	    return List.of(senderDto, receiverDto);
		
		
		
		
	}
	@Override
	public List<AccountDto> getAccountsOfLoggedInUser(){

	    Authentication auth =
	            SecurityContextHolder.getContext().getAuthentication();

	    String username = auth.getName();

	    User user = userRepository.findByUsername(username);

	    List<Account> accounts =
	    		accountRepository.findByUserUserId(user.getuserId());

	    return accounts.stream()
	            .map(AccountMapper::mapToAccountDto)
	            .toList();
	}
	
	@Transactional
	public void transferFunds(Long sourceAccountId,
	                          Long targetAccountId,
	                          double amount) {

	    Authentication auth =
	            SecurityContextHolder.getContext().getAuthentication();

	    String username = auth.getName();

	    User user = userRepository.findByUsername(username);

	    Account sourceAccount =
	            accountRepository.findById(sourceAccountId)
	                    .orElseThrow(() -> new RuntimeException("Source account not found"));

	    Account targetAccount =
	            accountRepository.findById(targetAccountId)
	                    .orElseThrow(() -> new RuntimeException("Target account not found"));

	    // SECURITY CHECK
	    if(!sourceAccount.getUser().getuserId().equals(user.getuserId())){
	        throw new RuntimeException("You cannot transfer from another user's account");
	    }

	    if(sourceAccount.getBalance() < amount){
	        throw new RuntimeException("Insufficient balance");
	    }

	    // update balances
	    sourceAccount.setBalance(sourceAccount.getBalance() - amount);
	    targetAccount.setBalance(targetAccount.getBalance() + amount);

	    accountRepository.save(sourceAccount);
	    accountRepository.save(targetAccount);

	    // save transaction
	    Transaction transaction = new Transaction();
	    transaction.setAmount(amount);
	    transaction.setTransactionType("TRANSFER");
	    transaction.setTransactionTime(LocalDateTime.now());
	    transaction.setSourceAccount(sourceAccount);
	    transaction.setTargetAccount(targetAccount);

	    transactionRepository.save(transaction);
	}

	
	

}
