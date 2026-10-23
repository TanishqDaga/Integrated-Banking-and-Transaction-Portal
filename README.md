# Integrated Banking and Transaction Portal

A full-stack banking web application. Customers can open bank accounts, deposit and withdraw money, transfer funds to other accounts, and view their transaction history. Admins approve new account requests, manage banks and users, and see every transaction in the system.

It is built as two separate programs that talk to each other over HTTP:

| Folder | What it is | Technology |
| --- | --- | --- |
| `backend/` | The **server** — holds the data, enforces the rules | Java 17, Spring Boot, MySQL |
| `frontend-1/` | The **website** the user sees in the browser | React, Vite, plain CSS |

---

## Table of contents

- [How the pieces fit together](#how-the-pieces-fit-together)
- [What a user can actually do](#what-a-user-can-actually-do)
- [The data model](#the-data-model)
- [How login works](#how-login-works)
- [Walking through one feature end to end](#walking-through-one-feature-end-to-end)
- [The backend, folder by folder](#the-backend-folder-by-folder)
- [The frontend, folder by folder](#the-frontend-folder-by-folder)
- [Full API reference](#full-api-reference)
- [Running it on your machine](#running-it-on-your-machine)
- [Known issues and things to improve](#known-issues-and-things-to-improve)

---

## How the pieces fit together

```
   Browser (React app on :5173)
            │
            │  HTTP requests carrying a username + password
            │  e.g.  GET /accounts/my-accounts
            ▼
   Spring Boot server (:8080)
            │
            │  SQL
            ▼
      MySQL database
```

**The split matters.** The React app is just a screen — it can display anything it likes, but it cannot change a balance. Only the server can do that, because only the server talks to the database. Every time the website needs real data, it makes an HTTP request to the server and waits for a reply.

This is why security checks have to live on the *server*. If the React app hides the "Admin" menu for a customer, that only hides a button — a determined person could still send the HTTP request directly. The server is what actually refuses.

---

## What a user can actually do

### As a customer

1. **Register** — pick a username and password. You are automatically given the `CUSTOMER` role.
2. **Log in.**
3. **Request a bank account** — choose a bank from the list and give an account-holder name. The account is created with status `PENDING`.
4. **Wait for an admin to approve it.**
5. **Deposit** money into an account.
6. **Withdraw** money (refused if the balance is too low).
7. **Transfer** money to another account.
8. **View transactions** that involve any of your accounts.

### As an admin

1. See **all users**, **all accounts**, and **all transactions** in the system.
2. See **pending account requests** and approve them.
3. **Create banks** (name + branch) that customers can then open accounts with.
4. **Delete users.**

Admins are not created through the website. `/auth/register` always hands out the `CUSTOMER` role, so the first admin has to be made by editing the database directly — see [Running it on your machine](#running-it-on-your-machine).

---

## The data model

Four tables, created automatically by Hibernate from the Java classes in `entity/`.

```
   users                 banks
   ─────                 ─────
   userId                bank_id
   username              bankName
   password  (hashed)    branch
   role                      │
     │                       │
     │  one user has         │  one bank has
     │  many accounts        │  many accounts
     ▼                       ▼
            accounts
            ────────
            id
            account_holder_name
            balance
            status          (PENDING / APPROVED)
            user_id    ──┐
            bank_id      │
                 │       │
                 │  an account can be the source
                 │  or the target of a transaction
                 ▼
            transactions
            ────────────
            transactionId
            amount
            transactionType   (TRANSFER / DEPOSIT / WITHDRAW)
            transactionTime
            source_account_id
            target_account_id
```

**What `@Entity` means.** Each class in `entity/` is marked `@Entity`, which tells Hibernate (the library Spring Data JPA uses underneath) "this Java class corresponds to a database table." You write Java objects; Hibernate writes the SQL. `@ManyToOne` on `Account.user` means many accounts can belong to one user, and Hibernate turns that into a `user_id` foreign-key column.

**One setting worth knowing:**

```properties
spring.jpa.hibernate.ddl-auto=update
```

This tells Hibernate to look at your Java classes on startup and change the database tables to match. Convenient while learning — you never write a `CREATE TABLE` by hand. Not something to use on a real production database, because it will happily alter live tables based on a code change.

---

## How login works

This is the part most worth understanding, because it is unusual.

The app uses **HTTP Basic authentication**, not tokens. Here is what that means in practice:

**There is no session.** The server does not remember that you logged in. Instead, *every single request* carries your username and password in a header:

```
Authorization: Basic dGFuaXNocTpteXBhc3N3b3Jk
```

That long string is just `username:password` encoded in Base64. Base64 is **not encryption** — it is trivially reversible, and it only stays private because HTTPS encrypts the whole request in transit.

**So what does `POST /auth/login` do?** Less than you would expect. Look at `AuthController`:

```java
if (passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
    return "Login Successful";
}
return "Invalid Password";
```

It returns a plain string. It does not create a session, does not issue a token, and does not change anything. It is purely a check so the website can show "wrong password" on the login screen. The *real* authentication happens separately, on every later request, when Spring Security reads the `Authorization` header.

**Where passwords are stored.** Two different places, doing two different things:

- *In the database:* hashed with **BCrypt**. Hashing is one-way — you can check whether a password matches a hash, but you cannot turn the hash back into the password. `AuthController.register` does `passwordEncoder.encode(...)` before saving.
- *In the browser:* the **plaintext password** is kept in `localStorage` under the key `Integrated_auth`, because every subsequent request needs it to build the Basic header. This is a real weakness — see [Known issues](#known-issues-and-things-to-improve).

**How the app figures out if you are an admin.** There is no endpoint that reports your role, so `authService.js` works it out by experiment:

```js
try {
  await api.get('/admin/users');   // can I reach an admin-only endpoint?
  return 'ADMIN';                  // yes → I must be an admin
} catch (e) {
  if (e.response?.status === 403) return 'CUSTOMER';   // forbidden → not an admin
  throw e;
}
```

It tries to open an admin door and infers the role from whether it was slammed shut. It works, but the honest fix is for the server to return the role at login.

**What the server protects**, from `SecurityConfig`:

| Path | Who can reach it |
| --- | --- |
| `/auth/**` | Anyone (you must be able to register before you have credentials) |
| `/ping` | Anyone |
| `/admin/**` | Only users whose role is `ADMIN` |
| everything else | Any logged-in user |

Note that last row carefully: **"any logged-in user"** is not the same as "the owner of this account." That distinction is the source of the biggest bug in the project, covered below.

---

## Walking through one feature end to end

Following a single transfer through all the layers is the fastest way to understand the codebase.

**1. The user fills in the form** (`frontend-1/src/pages/Transfer.jsx`) and clicks Transfer.

**2. The page calls a service function** (`frontend-1/src/services/accountService.js`):

```js
export async function transferFunds({ sourceAccountId, targetAccountId, amount }) {
  const { data } = await api.post('/accounts/transfer', { sourceAccountId, targetAccountId, amount });
  return data;
}
```

The service layer exists so pages never build URLs themselves. If an endpoint is renamed, you change one file.

**3. Axios attaches credentials** (`frontend-1/src/api/axiosInstance.js`). An *interceptor* is a function that runs automatically before every request — this one reads the saved username and password and adds the `Authorization` header, so no page has to remember to do it.

**4. The request reaches the server** at `AccountController.transferFunds`, which unpacks the JSON into a `TransferRequest` object and calls the service.

**5. The service does the real work** (`AccountServiceImpl.transferFunds`):

```java
@Transactional
public void transferFunds(Long sourceAccountId, Long targetAccountId, double amount){

    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    User user = userRepository.findByUsername(username);

    // ... load both accounts ...

    if(!sourceAccount.getUser().getuserId().equals(user.getuserId())){
        throw new RuntimeException("You cannot transfer from another user's account");
    }
    if(sourceAccount.getBalance() < amount){
        throw new RuntimeException("Insufficient balance");
    }

    sourceAccount.setBalance(sourceAccount.getBalance() - amount);
    targetAccount.setBalance(targetAccount.getBalance() + amount);
    // ... save both, then save a Transaction record ...
}
```

Two ideas here are worth pausing on.

**`SecurityContextHolder`** is how the server knows *who is asking*. Spring Security has already verified the Basic credentials by this point and stashed the authenticated username where any code can read it. The method never trusts a user ID sent from the browser — it looks up who you actually are.

**`@Transactional`** is the one that matters most in banking. A transfer is two separate database writes: subtract from one account, add to another. If the server crashed between them, money would vanish. `@Transactional` wraps both in a database transaction — either both succeed, or neither does. There is no in-between state.

**6. The response comes back** and the page shows a confirmation.

---

## The backend, folder by folder

The backend follows the standard Spring Boot layering. Each layer has one job and only talks to the layer below it.

```
controller/   ← receives HTTP requests, returns HTTP responses
     ↓
service/      ← the business rules ("is the balance enough?")
     ↓
repository/   ← talks to the database
     ↓
entity/       ← the shape of each database table
```

**`controller/`** — the entry points. Each method is tagged with the URL and HTTP verb it answers (`@PostMapping("/deposit/{id}")`). Controllers should stay thin: read the request, call a service, return the result.

- `AuthController` — register, login, ping
- `AccountController` — create/view accounts, deposit, withdraw, transfer, list banks
- `TransactionController` — one endpoint, "my transactions"
- `AdminController` — admin-only management endpoints

**`service/`** — where the rules live. `AccountService` and `TransactionService` are *interfaces* (a list of method names with no code); `service/impl/` holds the classes that actually implement them. Splitting interface from implementation is a Spring convention that makes swapping or mocking an implementation easy.

**`repository/`** — database access, and this is the part that looks like magic. You write an empty interface:

```java
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserUserId(Long userId);
    List<Account> findByStatus(String status);
}
```

There is no SQL and no method body anywhere. Spring Data JPA reads the *method name* and generates the query: `findByStatus` becomes `SELECT * FROM accounts WHERE status = ?`. `findByUserUserId` walks the relationship — Account → user → userId — and produces a join. Extending `JpaRepository` also gives you `save`, `findById`, `findAll` and `deleteById` for free.

**`entity/`** — `User`, `Account`, `Bank`, `Transaction`. Plain Java classes with annotations mapping them to tables.

**`Dto/`** — DTO means **Data Transfer Object**: the shape of the data sent over the network, as opposed to the shape stored in the database. These differ on purpose. `User` has a password field; you never want that in an API response. `AccountDto` is a Java `record`, a compact way to declare an immutable data holder:

```java
public record AccountDto(Long id, String accountHolderName, double balance, Long bankId) { }
```

**`mapper/`** — converts entities to DTOs and back. `AccountMapper.mapToAccountDto` takes an `Account` and produces an `AccountDto`.

**`exception/`** — `AccountException` is a custom error type, and `GlobalExceptionHandler` is marked `@ControllerAdvice`, meaning it catches exceptions thrown anywhere in the app and converts them into a tidy JSON error response instead of a raw stack trace.

**`config/SecurityConfig`** — sets up BCrypt password hashing, CORS, and the URL access rules.

**About CORS.** Browsers block a page served from one origin (`localhost:5173`) from calling a different origin (`localhost:8080`) unless the server explicitly allows it. `SecurityConfig.corsConfigurationSource` is that permission slip, allow-listing `http://localhost:5173` and `https://integrated-banking.netlify.app`. **If you deploy the frontend somewhere new and every request suddenly fails, this list is the first place to look.**

---

## The frontend, folder by folder

A React single-page app. "Single-page" means the browser loads one HTML file, and JavaScript swaps the content as you navigate — no full page reloads.

**`pages/`** — one file per screen (`Login`, `Dashboard`, `Accounts`, `Deposit`, `Withdraw`, `Transfer`, `Transactions`, plus the `Admin*` screens).

**`components/`** — reusable building blocks used across pages: `Navbar`, `Sidebar`, `Modal`, `ConfirmDialog`, `Loader`, `Pagination`, `TransactionTable`, `EmptyState`, and so on.

**`context/`** — React Context shares data across the whole component tree without passing props down through every level.

- `AuthContext` — who is logged in, plus `login`, `logout`, `register`. Any component calls `useAuth()` to reach it.
- `ThemeContext` — light/dark mode, saved to `localStorage`.
- `ToastContext` — pop-up notifications.

**`services/`** — all the API calls, grouped by area (`authService`, `accountService`, `transactionService`, `adminService`). Pages call these; pages never call axios directly.

**`api/axiosInstance.js`** — one configured axios client with the two interceptors described earlier: a request interceptor that attaches credentials, and a response interceptor that turns HTTP status codes into friendly messages and bounces you to the login page on a 401.

**`hooks/`** — custom hooks, which are reusable chunks of stateful logic.

- `useFetch(fetcher, deps)` — handles the load/success/error cycle every data screen needs, so pages don't each rewrite it. It also guards against a common React bug: if the component unmounts while a request is still in flight, an `active` flag stops it writing to state that no longer exists.
- `usePagination(items, pageSize)` — slices an array into pages.

**`components/ProtectedRoute.jsx`** — wraps a route and redirects to `/login` if you are not signed in, or to `/dashboard` if a non-admin tries an `adminOnly` route. Again: this is convenience, not security. The server enforces the real rules.

**`public/_redirects`** — a Netlify configuration file. Because routing happens in JavaScript, a direct visit to `/dashboard` would otherwise 404 on the host. This line tells Netlify to serve `index.html` for every path and let React Router sort it out.

---

## Full API reference

Base URL is `http://localhost:8080` in development. 🔓 open to anyone, 🔒 any logged-in user, 👮 admins only.

### Auth

| Method | Endpoint | | What it does |
| --- | --- | --- | --- |
| POST | `/auth/register` | 🔓 | Create a user with the `CUSTOMER` role |
| POST | `/auth/login` | 🔓 | Check a password; returns a plain string |
| GET | `/auth/ping` | 🔓 | Returns `OK` |

### Accounts

| Method | Endpoint | | What it does |
| --- | --- | --- | --- |
| POST | `/accounts/addAccount` | 🔒 | Request an account (created as `PENDING`) |
| GET | `/accounts/my-accounts` | 🔒 | Your own accounts |
| GET | `/accounts/getAccount/{id}` | 🔒 | One account by id |
| GET | `/accounts/getAllAccounts` | 🔒 | **Every** account in the system |
| GET | `/accounts/banks` | 🔒 | List banks to choose from |
| POST | `/accounts/deposit/{id}` | 🔒 | Add money. Body: `{"amount": 500}` |
| POST | `/accounts/withdraw/{id}` | 🔒 | Take money out |
| POST | `/accounts/transfer` | 🔒 | Transfer. Body: `{sourceAccountId, targetAccountId, amount}` |
| POST | `/accounts/transferFund/{fromId}/{toId}` | 🔒 | Older transfer endpoint, body `{"amount": 500}` |
| DELETE | `/accounts/deleteAccount/{id}` | 🔒 | Delete an account |

There are two transfer endpoints because `/accounts/transfer` was written later. Only the newer one checks that you own the source account and records a `Transaction` row; `/transferFund/{fromId}/{toId}` does neither.

### Transactions

| Method | Endpoint | | What it does |
| --- | --- | --- | --- |
| GET | `/transactions/my` | 🔒 | Transactions where you own the source or target account |

### Admin

| Method | Endpoint | | What it does |
| --- | --- | --- | --- |
| GET | `/admin/users` | 👮 | All users |
| DELETE | `/admin/user/{userId}` | 👮 | Delete a user |
| GET | `/admin/accounts` | 👮 | All accounts |
| GET | `/admin/transactions` | 👮 | All transactions |
| GET | `/admin/account-requests` | 👮 | Accounts awaiting approval |
| PUT | `/admin/approve-account/{accountId}` | 👮 | Set status to `APPROVED` |
| GET | `/admin/banks` | 👮 | All banks |
| POST | `/admin/banks` | 👮 | Create a bank. Body: `{"bankName": "...", "branch": "..."}` |

A ready-made Postman collection sits at `backend/Postman/`.

---

## Running it on your machine

### You will need

- **Java 17** or newer
- **Node.js 18** or newer
- **MySQL** running locally

### 1. Create the database

```sql
CREATE DATABASE banking_app;
```

You do not need to create any tables — Hibernate builds them on first startup.

### 2. Configure and start the backend

`application.properties` reads three environment variables:

```properties
spring.datasource.url=${DATA_SOURCE_URL}
spring.datasource.username=${DATA_SOURCE_USERNAME}
spring.datasource.password=${DATA_SOURCE_PASSWORD}
```

Set them and run:

```bash
cd backend

export DATA_SOURCE_URL="jdbc:mysql://localhost:3306/banking_app"
export DATA_SOURCE_USERNAME="root"
export DATA_SOURCE_PASSWORD="your-mysql-password"

./mvnw spring-boot:run
```

The server starts on `http://localhost:8080`. Check it with `curl http://localhost:8080/auth/ping` — you should get `OK`.

Or with Docker:

```bash
cd backend
docker build -t banking-app .
docker run -p 8080:8080 \
  -e DATA_SOURCE_URL="jdbc:mysql://host.docker.internal:3306/banking_app" \
  -e DATA_SOURCE_USERNAME="root" \
  -e DATA_SOURCE_PASSWORD="your-mysql-password" \
  banking-app
```

### 3. Start the frontend

```bash
cd frontend-1
npm install
npm run dev
```

It opens at `http://localhost:5173`.

> **Important:** `src/api/axiosInstance.js` has the deployed server URL hard-coded as `baseURL`. To develop against your local backend, change that line to `http://localhost:8080` — otherwise your local website will quietly talk to the live deployed server.

### 4. Make yourself an admin

Register normally through the website, then promote that user in MySQL:

```sql
UPDATE user SET role = 'ADMIN' WHERE username = 'your-username';
```

Log out and back in — `probeRole` re-checks on each login.

### 5. Try the whole flow

1. Log in as the admin, go to **Banks**, create one (e.g. "HDFC", "Vellore").
2. Register a second user as a customer and log in as them.
3. Request an account, picking that bank.
4. Log back in as admin, open **Pending Requests**, approve it.
5. As the customer: deposit, withdraw, transfer, and check the transactions page.

---

## Known issues and things to improve

This is a learning project and these are the natural next steps rather than a list of failures. They are ordered by how much they matter.

### 🔴 Database credentials are committed to the repository

`backend/.env` is tracked by git and contains a real database URL, username and password. Anyone who can see this repository can read them, and deleting the file now will **not** help — git keeps history, so the old values stay recoverable.

What to do, in order:

1. **Change the database password immediately**, at the database. Assume the committed one is public.
2. Add `.env` to `.gitignore` so it is not committed again.
3. Remove it from the working tree with `git rm --cached backend/.env`.
4. If you want it gone from history too, rewrite the history with `git filter-repo` or the BFG Repo-Cleaner — but rotating the password in step 1 is what actually protects you.

`backend/Dockerfile` also hardcodes `ENV DATA_SOURCE_PASSWORD=password` as a default. Passing credentials at `docker run` time instead keeps them out of the image.

### 🔴 Most account operations do not check ownership

`SecurityConfig` requires you to be logged in, but it cannot know *which* account you are entitled to touch — only the service code can check that. Only `transferFunds` does:

```java
if(!sourceAccount.getUser().getuserId().equals(user.getuserId())){
    throw new RuntimeException("You cannot transfer from another user's account");
}
```

`deposit`, `withdraw`, `deleteAccount`, `getAccountById` and `transferFund(fromId, toId)` have no equivalent check. Since account ids are sequential numbers, any logged-in customer could withdraw from, or delete, someone else's account by changing a number in the URL.

The fix is the same shape in each: load the account, compare its `user.userId` against the authenticated user, and throw if they differ. It is worth pulling that into one private helper rather than repeating it five times.

### 🔴 `/admin/users` returns password hashes

`AdminController` returns `User` entities directly, and `User` includes the `password` field — so the BCrypt hashes go out over the network. BCrypt hashes are slow to crack, but they should never leave the server. This is exactly the problem DTOs solve: make a `UserDto` with id, username and role, and return that. The same applies to the other admin endpoints returning raw entities.

### 🟠 The plaintext password lives in `localStorage`

HTTP Basic needs the password on every request, so the frontend stores it unencrypted in the browser. Any cross-site-scripting flaw would hand an attacker the actual password — not just a session that can be revoked, but the credential itself, likely reused on other sites.

The standard fix is to move to **JWT**: the server issues a signed token at login, the browser stores only that token, and the token expires. The `frontend-1/README.md` already describes the system as using "JWT-style" tokens — this would make that true.

### 🟠 Account approval does not gate anything

Accounts start as `PENDING` and an admin can mark them `APPROVED`, but nothing checks that status afterwards. A `PENDING` account can deposit, withdraw and transfer normally. The approval step is currently decorative. Adding a status check to the money-moving methods would make the workflow real.

### 🟠 Money is stored as `double`

`Account.balance` and `Transaction.amount` are both `double`. Floating-point types cannot represent decimal fractions exactly — in Java, `0.1 + 0.2` is `0.30000000000000004`. Over many transactions those errors accumulate into balances that are genuinely wrong by a few paise.

Financial code should use `BigDecimal`, which does exact decimal arithmetic. This is a schema and code change, so it is easiest to do early.

### 🟡 The generic exception handler has a type bug

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorDetails> handleGenericException(AccountException exception, ...)
```

It is registered to catch every `Exception` but its parameter is typed `AccountException`. Any other exception type will fail to bind here, so unexpected errors won't be handled the way the method intends. The parameter should be `Exception exception`.

### 🟡 The Vite proxy is configured but unused

`vite.config.js` sets up a `/api` proxy, but `axiosInstance.js` hard-codes an absolute `baseURL`, so no request ever goes through it. The proxy target also has a stray leading space in the URL string. Either delete the proxy, or switch the axios `baseURL` to an environment variable (`import.meta.env.VITE_API_BASE_URL`) so local and deployed builds can differ without editing source.

### 🟡 Role detection by trial and error

`probeRole` discovers your role by calling an admin endpoint and watching for a 403. It costs an extra request on every login and breaks if the admin routes change. Returning the role from `/auth/login` would be simpler and faster.

### Smaller things

- `validatePassword` in `utils/validators.js` rejects passwords under 4 characters but the message says 6.
- `AccountServiceImpl` mixes constructor injection with `@Autowired` field injection; picking one (constructor injection is the recommended style) would be tidier.
- There are no tests beyond the generated `BankingAppApplicationTests` context-load check. The transfer logic — insufficient balance, wrong owner, exact balance — is the obvious first thing to cover.
- `spring-boot-devtools` is included, which is fine for development but worth excluding from production builds.
