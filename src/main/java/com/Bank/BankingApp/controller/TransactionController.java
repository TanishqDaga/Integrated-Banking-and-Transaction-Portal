package com.Bank.BankingApp.controller;

import com.Bank.BankingApp.Dto.TransactionDto;

import com.Bank.BankingApp.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    // Get all transactions related to the logged-in user
    @GetMapping("/my")
    public List<TransactionDto> getMyTransactions() {
        return transactionService.getMyTransactions();
    }
}