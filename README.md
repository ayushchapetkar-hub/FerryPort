# FerryPort

FerryPort is a full-stack ferry schedule and booking project built with React, Express, and MongoDB.

## Project structure

```text
ferryport/
├── server/                 Express API and MongoDB models
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   └── utils/
├── src/                    React frontend
│   ├── components/
│   ├── data/
│   ├── pages/
│   └── services/
├── .env.example
└── package.json
```

## Setup

### One-time setup

```powershell
npm run setup
```

The first `npm run dev` creates `server/.env` automatically when it is missing. Edit that file and set a real MongoDB Atlas connection string, a long random JWT secret, and a secure admin password.

```powershell
npm run seed:admin
npm run seed:data
```

### Run frontend and backend together

From the project root:

```powershell
npm run dev
```

This starts the frontend and backend together. The API runs at `http://localhost:5000`. Its health endpoint is:

```text
http://localhost:5000/api/health
```

The frontend runs at `http://localhost:5173`.

## Security

- The frontend never connects directly to MongoDB.
- Passwords are hashed with bcrypt.
- Protected APIs require a JWT bearer token.
- Admin APIs require an active user with the `admin` role.
- Secrets belong only in `server/.env`, which is ignored by Git.
- Demo payments do not communicate with a real bank.

## Admin

Create the admin account with `npm run seed:admin` inside `server/`. The configured admin email is:

```text
ayushchapetkar@gmail.com
```

The password is read only from `ADMIN_PASSWORD` in `server/.env`.
