package com.Bank.BankingApp.mapper;

import com.Bank.BankingApp.entity.Transaction;
import com.Bank.BankingApp.Dto.TransactionDto;

public class TransactionMapper {

    public static TransactionDto mapToTransactionDto(Transaction transaction) {

        return new TransactionDto(
                transaction.getTransactionId(),
                transaction.getAmount(),
                transaction.getSourceAccount().getId(),
                transaction.getTargetAccount().getId(),
                transaction.getTransactionType(),
                transaction.getTransactionTime().toString()
        );
    }
}