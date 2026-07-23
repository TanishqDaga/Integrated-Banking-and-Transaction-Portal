# Nimbus Bank — Digital Banking Frontend

A production-quality React frontend for a Spring Boot banking backend, built with React, React Router, Axios, and Context API. No UI frameworks — every pixel is custom CSS.

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and expects your Spring Boot backend at `http://localhost:8080` (configured in `src/api/axiosInstance.js`).

## What's inside

- **Auth**: Login & Register pages, JWT-style token persisted in `localStorage`, auto-attached to every request.
- **Dashboard**: Balance overview, quick actions, recent activity.
- **Accounts**: Search/sort/paginate, deposit/withdraw/transfer/delete from inline cards.
- **Deposit / Withdraw / Transfer**: Full flows with confirmation dialogs and success receipts.
- **Transactions**: Search, filter (credit/debit), sort, paginate.
- **Admin panel**: Overview stats + CSS-only bar chart, Users, Accounts, Transactions, Pending account requests (approve inline), Banks (create/list).
- **Dark mode toggle**, responsive down to mobile, custom scrollbars, toast notifications, skeleton loaders, floating action button, back-to-top button, 404 page.

## Backend endpoints expected

See `src/services/*.js` for the full list of endpoints this frontend calls — they match the spec exactly (`/auth/login`, `/accounts/getAllAccounts`, `/admin/users`, etc.), including both transfer endpoint shapes (`/accounts/transfer` and `/accounts/transferFund/{fromId}/{toId}`, with automatic fallback).

## Notes

- If your backend's login/register response shapes differ slightly (e.g. field names for the JWT or user object), adjust the mapping in `src/context/AuthContext.jsx`.
- CORS: make sure your Spring Boot backend allows requests from `http://localhost:5173`.
