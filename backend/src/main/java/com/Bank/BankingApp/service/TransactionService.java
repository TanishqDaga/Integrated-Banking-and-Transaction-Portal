package com.Bank.BankingApp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Bank.BankingApp.Dto.TransactionDto;
import com.Bank.BankingApp.entity.Transaction;

public interface TransactionService {
	List<TransactionDto> getMyTransactions();
}
