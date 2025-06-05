# auth-api

Node.js Express API with JWT Authentication and Role-Based Authorization

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Environment Variables](#environment-variables)
- [Error Handling](#error-handling)
- [Database](#database)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm (comes with Node.js)
- PostgreSQL

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/polodev-com/node-auth-api.git
    cd node-auth-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the `.env.example` file (if provided) or by creating a new one.
    Populate it with the necessary environment variables (see [Environment Variables](#environment-variables) section).
    Example `.env` structure:
    ```env
    NODE_ENV=development
    PORT=3000
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    DB_DIALECT=postgres
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRES_IN=1h
    ```
4.  **Initialize the database:**
    Ensure your PostgreSQL server is running and accessible.
    Run the database initialization script:
    ```bash
    npm run db:init
    ```
    This script will typically create the necessary tables and may seed initial data.

## Available Scripts

In the project directory, you can run the following commands:

-   `npm start`: Runs the app in production mode.
-   `npm run dev`: Runs the app in development mode using `nodemon`, which automatically restarts the server on file changes.
-   `npm run db:init`: Initializes the database by running the `scripts/initDb.js` script. This usually involves creating tables and potentially seeding data.

## API Endpoints

The API is structured with base paths `/api/auth` and `/api/users`.

-   **Root:**
    -   `GET /`: Health check and API information.
        -   Response:
            ```json
            {
              "message": "Auth API is running successfully!",
              "status": "OK",
              "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ",
              "documentation": "/api-docs"
            }
            ```
-   **Authentication Routes (`/api/auth`):**
    -   Handles user login and logout. (Details to be added based on `authRoutes.js` and `authController.js`)
    -   `POST /api/auth/login`: User login.
    -   `POST /api/auth/logout`: User logout (if implemented).
    -   `POST /api/auth/register`: User registration (if this functionality is part of authController or a separate register route).
-   **User Management Routes (`/api/users`):**
    -   Handles creating, retrieving, and listing users. (Details to be added based on `userRoutes.js` and `userController.js`)
    -   `POST /api/users`: Create a new user.
    -   `GET /api/users`: List all users.
    -   `GET /api/users/:id`: Get a specific user by ID.
    -   `PUT /api/users/:id`: Update a specific user by ID.
    -   `DELETE /api/users/:id`: Delete a specific user by ID.

*(Note: Specific request/response formats for each endpoint should be documented further, potentially using API documentation tools like Swagger/OpenAPI.)*

## Project Structure

```
nodejs-authentication-v3/
├── Dockerfile
├── package.json
├── server.js         # Main application entry point
├── config/
│   └── database.js   # Sequelize database configuration
├── controllers/
│   ├── authController.js # Logic for authentication routes
│   └── userController.js # Logic for user management routes
├── k8s/                # Kubernetes deployment files (if applicable)
├── middleware/
│   └── authMiddleware.js # JWT authentication and authorization middleware
├── models/
│   ├── role.js         # Sequelize model for Roles
│   └── user.js         # Sequelize model for Users
├── routes/
│   ├── authRoutes.js   # Defines authentication-related API routes
│   └── userRoutes.js   # Defines user management API routes
├── scripts/
│   └── initDb.js       # Script to initialize the database (create tables, seed data)
└── README.md
```

## Technologies Used

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Web application framework for Node.js.
-   **Sequelize**: Promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server.
-   **PostgreSQL**: Powerful, open-source object-relational database system.
-   **JSON Web Tokens (JWT)**: For securing API endpoints and managing user sessions.
-   **bcryptjs**: Library for hashing passwords.
-   **dotenv**: Module to load environment variables from a `.env` file.
-   **Nodemon**: Utility that monitors for changes in your source and automatically restarts your server (for development).

## Environment Variables

This project uses `dotenv` to manage environment variables. Create a `.env` file in the root of the project and add the following variables:

-   `NODE_ENV`: Application environment (e.g., `development`, `production`, `test`).
-   `PORT`: The port on which the server will listen (e.g., `3000`).
-   `DB_HOST`: Database host (e.g., `localhost`).
-   `DB_USER`: Database username.
-   `DB_PASSWORD`: Database password.
-   `DB_NAME`: Database name.
-   `DB_DIALECT`: Database dialect (e.g., `postgres`).
-   `JWT_SECRET`: Secret key used to sign JWTs. This should be a long, random, and strong string.
-   `JWT_EXPIRES_IN`: Expiration time for JWTs (e.g., `1h`, `7d`).

## Error Handling

The application includes a global error handler (`server.js`) that catches unhandled errors from route handlers and middleware.
-   In development (`NODE_ENV !== 'production'`), the error response includes the error message and stack trace.
-   In production (`NODE_ENV === 'production'`), if the error is a 500 Internal Server Error, a generic message ("An unexpected error occurred on the server.") is sent to the client to avoid leaking sensitive information. Otherwise, the specific error message is sent.

The error response format is:
```json
{
  "status": "error",
  "statusCode": <HTTP_STATUS_CODE>,
  "message": "<ERROR_MESSAGE>",
  "stack": "<STACK_TRACE>" // (Only in development)
}
```

## Database

The application uses Sequelize ORM to interact with a PostgreSQL database.
-   **Configuration**: Database connection details are managed in `config/database.js` and are sourced from environment variables.
-   **Models**:
    -   `User`: Defined in `models/user.js`. Represents users in the system.
    -   `Role`: Defined in `models/role.js`. Represents user roles for authorization.
    (Relationships between User and Role, e.g., User belongs to Role or User has many Roles, should be defined in the models.)
-   **Initialization**: The `scripts/initDb.js` script is used to set up the database schema. It typically involves:
    -   Connecting to the database.
    -   Synchronizing Sequelize models with the database (creating tables if they don't exist).
    -   Potentially seeding initial data (e.g., default roles, admin user).


## License

This project is licensed under the MIT License. See the LICENSE file for details (if a LICENSE file is present).

