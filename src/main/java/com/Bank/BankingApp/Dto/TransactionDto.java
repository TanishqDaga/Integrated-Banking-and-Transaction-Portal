package com.Bank.BankingApp.Dto;

public class TransactionDto {
	    private Long transactionId;
	    private double amount;
	    private Long sourceAccountId;
	    private Long targetAccountId;
	    private String transactionType;
	    private String transactionTime;

	    public TransactionDto(Long transactionId,
	                          double amount,
	                          Long sourceAccountId,
	                          Long targetAccountId,
	                          String transactionType,
	                          String transactionTime) {

	        this.transactionId = transactionId;
	        this.amount = amount;
	        this.sourceAccountId = sourceAccountId;
	        this.targetAccountId = targetAccountId;
	        this.transactionType = transactionType;
	        this.transactionTime = transactionTime;
	    }

	    public Long getTransactionId() {
	        return transactionId;
	    }

	    public double getAmount() {
	        return amount;
	    }

	    public Long getSourceAccountId() {
	        return sourceAccountId;
	    }

	    public Long getTargetAccountId() {
	        return targetAccountId;
	    }

	    public String getTransactionType() {
	        return transactionType;
	    }

	    public String getTransactionTime() {
	        return transactionTime;
	    }
}

