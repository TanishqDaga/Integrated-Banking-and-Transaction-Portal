package com.Bank.BankingApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Bank.BankingApp.entity.Account;
import com.Bank.BankingApp.entity.Bank;
import com.Bank.BankingApp.entity.Transaction;
import com.Bank.BankingApp.entity.User;
import com.Bank.BankingApp.repository.AccountRepository;
import com.Bank.BankingApp.repository.BankRepository;
import com.Bank.BankingApp.repository.TransactionRepository;
import com.Bank.BankingApp.repository.UserRepository;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
	private BankRepository bankRepository;

    @GetMapping("/users")
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    @GetMapping("/accounts")
    public List<Account> getAllAccounts(){
        return accountRepository.findAll();
    }

    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions(){
        return transactionRepository.findAll();
    }
    @GetMapping("/account-requests")
    public List<Account> getPendingAccounts(){
        return accountRepository.findByStatus("PENDING");
    }
    @PutMapping("/approve-account/{accountId}")
    public String approveAccount(@PathVariable Long accountId){

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setStatus("APPROVED");

        accountRepository.save(account);

        return "Account approved successfully";
    }
    @PostMapping("/banks")
    public Bank createBank(@RequestBody Bank bank){
        return bankRepository.save(bank);
    }
    @GetMapping("/banks")
    public List<Bank> getAllBanks(){
        return bankRepository.findAll();
    }
}
