# DFD — Student Management System

## Context Diagram (Level 0)

```
┌──────────┐   Credentials    ┌──────────────────────────┐   JWT Token     ┌──────────────┐
│          │ ───────────────▶ │                          │ ──────────────▶ │              │
│  Admin / │                  │   Student Management     │                  │  React SPA   │
│  User    │ ◀─────────────── │       Backend            │ ◀────────────── │ (localhost:  │
│          │  Token / Data    │   (ASP.NET MVC + API)    │   Student Data   │   5173)      │
└──────────┘                  └──────────────────────────┘                  └──────────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │   MySQL DB  │
                                  │  StudentDB  │
                                  └─────────────┘
```

---

## Level 1 DFD — Main Processes

```
External Entity: User/Admin
Data Stores:     D1 = Users table, D2 = Students table

┌─────────────────────────────────────────────────────────────────────┐
│  P1 · Authentication                                                │
│  POST /api/auth/login                                               │
│                                                                     │
│  User ──[username+password]──▶ P1 ──[lookup]──▶ D1 (Users)        │
│                                  └──[JWT token]──▶ User             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  P2 · Student Registration                                          │
│  POST /api/students          (API, requires Authorize header)       │
│  POST /Students/Create       (MVC form, session-optional)           │
│                                                                     │
│  User ──[Student data]──▶ P2 ──[validate]──▶ D2 (Students)        │
│                            │                                        │
│                            └── [201 Created / Redirect] ──▶ User   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  P3 · Student Retrieval / Search                                    │
│  GET /api/students?query=… (API, requires Authorize header)         │
│  GET /Students/Index?query=…(MVC, shows HTML table)                 │
│                                                                     │
│  User ──[query string]──▶ P3 ──[EF LIKE query]──▶ D2 (Students)   │
│                            └──[filtered results]──▶ User            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Endpoint Reference

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| `POST` | `/api/auth/login` | None | Validate credentials → return JWT + expiry |
| `GET`  | `/api/students` | JWT | List all / search by Name or Phone (partial, case-insensitive) |
| `GET`  | `/api/students/{id}` | JWT | Get single student by ID |
| `POST` | `/api/students` | JWT | Create student (validates all DFD fields) |
| `PUT`  | `/api/students/{id}` | JWT | Update student |
| `DELETE` | `/api/students/{id}` | JWT | Delete student |
| `GET`  | `/Students/Index` | Session | MVC list + search |
| `GET`  | `/Students/Create` | Session | MVC create form |
| `POST` | `/Students/Create` | CSRF | MVC create submit |

---

## Student Data Model (DFD Fields)

| Field | Type | Validation |
|-------|------|-----------|
| `Id` | `int` | Auto (PK) |
| `Name` | `string` | Required, max 100 chars |
| `Age` | `int` | Required, range 1–120 |
| `Gender` | `string` | Required, max 10 |
| `Phone` | `string` | Required, exactly 10 digits (`^\d{10}$`) |
| `Email` | `string` | Required, valid email format |
| `Address` | `string` | Required, max 500 chars |

---

## Authentication Flow (P1 — Detail)

```
1. Client POSTs { username, password } to /api/auth/login
2. Server looks up User in D1 (Users table)
3. BCrypt.Verify(password, storedHash) is called
4. If OK → JwtSecurityToken issued with:
     - sub: user.Id
     - unique_name: user.Username
     - role: user.Role
     - exp: now + Jwt:ExpiryMinutes
5. Token returned: { token, expiresAt, role, username }
6. Client stores token; sends as Authorization: Bearer <token> on all subsequent requests
```

---

## Startup Seed

On first launch, if no user with username `admin` exists in D1, the server:
1. Reads credentials from `appsettings.json → AdminUser`
2. BCrypt-hashes the password
3. Inserts the admin user

Default: `admin / Admin@1234` — **change in production**.

---

## CORS

Requests from `http://localhost:5173` (React Vite dev server) are allowed with any header and method via the `ReactPolicy` CORS policy.
