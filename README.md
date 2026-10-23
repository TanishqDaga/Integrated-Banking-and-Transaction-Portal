# Integrated Banking and Transaction Portal

A full-stack banking application where customers can request bank accounts, deposit and withdraw money, transfer funds, and view transaction history. Admins can approve accounts, manage banks and users, and view system-wide transactions.

## Tech Stack

- **Backend:** Java 17, Spring Boot, Spring Data JPA, Hibernate
- **Database:** MySQL
- **Frontend:** React, Vite, JavaScript, CSS
- **API communication:** REST over HTTP
- **Authentication:** Spring Security with HTTP Basic authentication
- **Deployment:** Docker and Netlify

## Features

### Customer
- Register and log in
- Request a bank account
- View personal accounts and available banks
- Deposit and withdraw money
- Transfer funds between accounts
- View related transaction history

### Admin
- View users, accounts, and transactions
- Approve pending account requests
- Create banks and branches
- Delete users

## Project Structure

```text
.
├── backend/
│   └── src/main/java/
│       ├── controller/   # REST endpoints
│       ├── service/      # Business logic
│       ├── repository/   # Database operations
│       ├── entity/       # Database entities
│       ├── Dto/          # API data objects
│       ├── mapper/       # Entity/DTO conversions
│       ├── exception/    # Error handling
│       └── config/       # Security and CORS
└── frontend-1/
    └── src/
        ├── pages/        # Customer and admin screens
        ├── components/   # Reusable UI components
        ├── context/      # Authentication, theme, and toast state
        ├── services/     # API calls
        ├── api/          # Axios configuration
        └── hooks/        # Reusable React logic
```

## How It Works

1. The React frontend sends HTTP requests to the Spring Boot backend.
2. Controllers receive requests and call the service layer.
3. Services apply banking rules and use repositories to access MySQL.
4. Spring Data JPA and Hibernate map Java entities to database tables.
5. The backend returns a response for the frontend to display.

## Database Model

The application uses four main entities:

- **User:** username, hashed password, and role (`CUSTOMER` or `ADMIN`)
- **Bank:** bank name and branch
- **Account:** account holder, balance, bank, owner, and status (`PENDING` or `APPROVED`)
- **Transaction:** amount, type, timestamp, source account, and target account

Hibernate creates or updates tables from the entity classes when the backend starts.

## Authentication and Access

The application uses HTTP Basic authentication. The browser sends credentials with protected API requests, and Spring Security checks them. Passwords are stored in the database using BCrypt hashing.

- `/auth/**` and `/ping` are public.
- `/admin/**` requires the `ADMIN` role.
- Other protected endpoints require authentication.

## API Overview

Base URL: `http://localhost:8080`

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Register a customer |
| `POST` | `/auth/login` | Check login credentials |
| `GET` | `/auth/ping` | Check backend availability |
| `POST` | `/accounts/addAccount` | Request an account |
| `GET` | `/accounts/my-accounts` | List your accounts |
| `GET` | `/accounts/banks` | List available banks |
| `POST` | `/accounts/deposit/{id}` | Deposit money |
| `POST` | `/accounts/withdraw/{id}` | Withdraw money |
| `POST` | `/accounts/transfer` | Transfer funds |
| `GET` | `/transactions/my` | View your related transactions |
| `GET` | `/admin/users` | List users (admin) |
| `GET` | `/admin/accounts` | List all accounts (admin) |
| `GET` | `/admin/transactions` | List all transactions (admin) |
| `GET` | `/admin/account-requests` | List pending requests (admin) |
| `PUT` | `/admin/approve-account/{accountId}` | Approve an account (admin) |
| `GET` | `/admin/banks` | List banks (admin) |
| `POST` | `/admin/banks` | Create a bank (admin) |
| `DELETE` | `/admin/user/{userId}` | Delete a user (admin) |

For the full set of endpoints and request bodies, see the controllers and the Postman collection in `backend/Postman/`.

## Run Locally

### Prerequisites

- Java 17 or newer
- Node.js 18 or newer
- MySQL
- Maven (or use the included Maven wrapper)

### 1. Create the database

In MySQL, run:

```sql
CREATE DATABASE banking_app;
```

### 2. Configure and run the backend

Set these environment variables to match your MySQL setup:

```bash
DATA_SOURCE_URL="jdbc:mysql://localhost:3306/banking_app"
DATA_SOURCE_USERNAME="root"
DATA_SOURCE_PASSWORD="your-mysql-password"
```

Then start the backend:

```bash
cd backend
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd spring-boot:run`.

The backend runs at `http://localhost:8080`. Test it with:

```bash
curl http://localhost:8080/auth/ping
```

Expected response: `OK`.

### 3. Run the frontend

```bash
cd frontend-1
npm install
npm run dev
```

Open `http://localhost:5173`.

If you want to use your local backend, make sure the Axios `baseURL` in `src/api/axiosInstance.js` points to `http://localhost:8080`.

### 4. Create an admin account

Register a user through the app, then promote that user in MySQL:

```sql
UPDATE user SET role = 'ADMIN' WHERE username = 'your-username';
```

Log out and log back in to refresh the role detection.

## Try the Application

1. Log in as an admin and create a bank.
2. Register a separate customer account.
3. Log in as the customer and request a bank account.
4. Log in as the admin and approve the request.
5. Log in as the customer to try deposits, withdrawals, transfers, and transaction history.

## Docker

To build and run the backend container:

```bash
cd backend
docker build -t banking-app .
docker run -p 8080:8080 \
  -e DATA_SOURCE_URL="jdbc:mysql://host.docker.internal:3306/banking_app" \
  -e DATA_SOURCE_USERNAME="root" \
  -e DATA_SOURCE_PASSWORD="your-mysql-password" \
  banking-app
```

Pass database credentials through environment variables rather than hardcoding them into the image.
