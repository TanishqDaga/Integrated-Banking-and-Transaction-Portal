package com.Bank.BankingApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Bank.BankingApp.entity.Account;
import com.Bank.BankingApp.entity.Transaction;
import com.Bank.BankingApp.entity.User;
import com.Bank.BankingApp.repository.AccountRepository;
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
}
