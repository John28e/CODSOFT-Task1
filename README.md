# E-Commerce App

A full-stack e-commerce web application.

## Tech Stack

| Layer        | Technology                  |
| ------------ | --------------------------- |
| Frontend     | React (Vite), Tailwind CSS v4 |
| Backend      | Node.js, Express            |
| Database     | MongoDB Atlas (Mongoose)    |
| Auth         | JWT (httpOnly cookies)      |
| File Uploads | Cloudinary                  |
| Payments     | Stripe (test mode)          |
| Hosting      | Vercel (client) + Render (server) |

## Project Structure

```
ecommerce-app/
├── client/          # React frontend
└── server/          # Express API backend
```

## Setup

### Prerequisites

- Node.js >= 18
- npm or yarn
- MongoDB Atlas account
- Cloudinary account
- Stripe account (test mode)

### Server

```bash
cd server
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

### Client

```bash
cd client
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

## Environment Variables

See `server/.env.example` and `client/.env.example` for required variables.

---

> 🚧 **Work in progress** — setup instructions will be expanded as features are built.
