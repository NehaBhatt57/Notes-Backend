# Backend README (Multi-Tenant Subscription & User Invitation API)

# Multi-Tenant Subscription & User Invitation Backend API

## Overview  
This backend API handles multi-tenant user management, subscription plans (Free and Pro), user invitation with predefined roles, and notes scoped per user and tenant. It is built with Node.js, Express, MongoDB, and JWT-based authentication.

---

## Features

- JWT-based authentication and role-based authorization (Admin, Member)  
- Multi-tenant data separation and security  
- Tenant subscription upgrade from Free to Pro by admins  
- User invitation with default password `"password"` and role assignment  
- Notes CRUD per tenant and user with subscription-based limits  
- Secure API endpoints with middleware checks

---

## Tech Stack

- Node.js  
- Express.js  
- MongoDB with Mongoose ODM  
- JSON Web Tokens (JWT) for auth  
- bcryptjs for password hashing

---

## Setup

### Prerequisites

- Node.js 16+  
- MongoDB (local or cloud)  
- npm or yarn  

### Installation

git clone <repo-url>
cd backend
npm install

text

### Environment Variables

Create `.env` file in backend root:

MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret-key>
PORT=3000

### Running Locally

npm run dev

Server runs on http://localhost:3000

---

## API Endpoints

| Path                          | Method | Access        | Description                                |
|-------------------------------|--------|---------------|--------------------------------------------|
| `/api/auth/login`              | POST   | Public        | Login user, returns JWT and user info      |
| `/api/auth/me`                | GET    | Authenticated | Get current user and tenant info           |
| `/api/tenants/:slug/upgrade`  | POST   | Admin only    | Upgrade tenant subscription to Pro         |
| `/api/tenants/:slug/invite`   | POST   | Admin only    | Invite new user with role and default pass |
| `/api/notes`                  | GET    | Authenticated | Get notes for the authenticated user       |
| `/api/notes`                  | POST   | Authenticated | Create note (respects subscription limits)|
| `/api/notes/:id`              | GET    | Authenticated | Get note by ID (tenant isolation enforced) |
| `/api/notes/:id`              | PUT    | Authenticated | Update note by ID                           |
| `/api/notes/:id`              | DELETE | Authenticated | Delete note by ID                           |

---

## User Invitation Details

- Invited users receive a default password: `"password"` (hashed in DB).  
- Admins assign role as "member" or "admin" during invitation.  
- New users are scoped to the tenant of the inviting admin.

---

## Subscription

- Tenant subscription stored in tenant document, either `"free"` or `"pro"`.  
- Admins can upgrade tenant to `"pro"` unlocking expanded features.

---

## Middleware

- `authMiddleware` verifies JWT token and populates user and tenant info.  
- `adminOnly` restricts certain routes to tenant admins only.

---

## Scripts

- `start` — Start production server.  
- `dev` — Run development server with nodemon.

---

## Testing

Use Postman or CURL to test authenticated endpoints; include JWT Bearer token.

---

## Contributing

Pull requests and issues are welcome.

---

## License

MIT License

---

## Contact

For support and questions, contact [Your Email].