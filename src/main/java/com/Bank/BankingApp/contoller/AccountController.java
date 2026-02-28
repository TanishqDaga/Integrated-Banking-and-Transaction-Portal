package com.Bank.BankingApp.contoller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Bank.BankingApp.Dto.AccountDto;
import com.Bank.BankingApp.repository.AccountRepository;
import com.Bank.BankingApp.service.AccountService;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountRepository accountRepository;
	private AccountService accountService;

	public AccountController(AccountService accountService, AccountRepository accountRepository) {
		super();
		this.accountService = accountService;
		this.accountRepository = accountRepository;
	}
	
	//Add account REST API
	@PostMapping("/addAccount")
	public ResponseEntity<AccountDto> addAccount(@RequestBody AccountDto accountDto){
		return new ResponseEntity<>(accountService.createAccount(accountDto),HttpStatus.CREATED);
	}
	
	//Get account REST API
	@GetMapping("/getAccount/{id}")
	public ResponseEntity<AccountDto> getAccountById(@PathVariable Long id){
		AccountDto accountDto=accountService.getAccountById(id);
		return ResponseEntity.ok(accountDto);
		
	}
	//Deposit REST API
	@PutMapping("/deposit/{id}")
	public ResponseEntity<AccountDto> deposit(@PathVariable long id,@RequestBody Map<String,Double> request){
		
		double amount=request.get("amount");
		AccountDto accountDto=accountService.deposit(id,amount);
		return ResponseEntity.ok(accountDto);
		
	}
	//Withdraw REST API
	@PutMapping("/withdraw/{id}")
	public ResponseEntity<AccountDto> withdraw(@PathVariable long id,@RequestBody Map<String,Double> request){
		
		double amount=request.get("amount");
		AccountDto accountDto=accountService.withdraw(id,amount);
		return ResponseEntity.ok(accountDto);
		
	}
	
}
