
	package com.Bank.BankingApp.entity;

	import jakarta.persistence.*;

	@Entity
	public class User {

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name="userId")
	    private Long userId;
	    

	    private String username;

	    private String password;

	    private String role; // CUSTOMER or ADMIN

		public Long getuserId() {
			return userId;
		}

		public void setuserId(Long userId) {
			this.userId = userId;
		}

		public String getUsername() {
			return username;
		}

		public void setUsername(String username) {
			this.username = username;
		}

		public String getPassword() {
			return password;
		}

		public void setPassword(String password) {
			this.password = password;
		}

		public String getRole() {
			return role;
		}

		public void setRole(String role) {
			this.role = role;
		}

	    // getters and setters
	}

