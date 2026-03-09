package com.Bank.BankingApp.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.Bank.BankingApp.Dto.TransactionDto;
import com.Bank.BankingApp.entity.Transaction;
import com.Bank.BankingApp.entity.User;
import com.Bank.BankingApp.mapper.TransactionMapper;
import com.Bank.BankingApp.repository.TransactionRepository;
import com.Bank.BankingApp.repository.UserRepository;
import com.Bank.BankingApp.service.TransactionService;

@Service
public class TransactionServiceImpl implements TransactionService {
	
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private TransactionRepository transactionRepository;
	@Override
	public List<TransactionDto> getMyTransactions() {

	    Authentication auth =
	            SecurityContextHolder.getContext().getAuthentication();

	    String username = auth.getName();

	    User user = userRepository.findByUsername(username);

	    List<Transaction> transactions =
	            transactionRepository
	            .findBySourceAccountUserUserIdOrTargetAccountUserUserId(
	                    user.getuserId(),
	                    user.getuserId());
	    return transactions.stream()
	            .map(TransactionMapper::mapToTransactionDto)
	            .toList();
	}
}
