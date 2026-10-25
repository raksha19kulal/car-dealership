# Car Dealership Website

## 1. Project Overview

The Car Dealership Website is a full-stack web application that allows users to register, log in, browse available vehicles, search for vehicles, and purchase vehicles based on available stock.

The project has a React frontend and a Node.js and Express backend. SQLite is used to store user and vehicle information.

## 2. Technologies Used

### Frontend
- React
- Vite
- JavaScript
- CSS
- Tailwind CSS

### Backend
- Node.js
- Express.js
- SQLite
- better-sqlite3
- JSON Web Tokens (JWT)
- bcryptjs

### Testing
- Jest
- Supertest

## 3. Features

- User registration and login
- Password hashing
- Token-based authentication
- Vehicle listing and searching
- Vehicle stock management
- Vehicle purchase functionality
- Admin-only vehicle management endpoints

## 4. Project Structure

```text
car-dealership/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── database.js
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   └── middleware.js
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── README.md
└── PROMPTS.md
```

## 5. Local Setup and Installation

### Prerequisites

Install Node.js and npm before running the application.

### Step 1: Clone the repository

```bash
git clone https://github.com/raksha19kulal/car-dealership.git
cd car-dealership
```

### Step 2: Start the backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
npm start
```

The backend runs on:

`http://localhost:5000`

### Step 3: Configure the frontend

Ensure the API URL in the frontend points to the backend you intend to use.

For local development, the API URL should be:

```js
const API_URL = 'http://localhost:5000/api'
```

For the deployed application, use the deployed backend URL instead.

### Step 4: Start the frontend

Open a second terminal in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually `http://localhost:5173`.

## 6. Database

The application uses SQLite to store user and vehicle records. The database tables are created automatically when the backend initializes the database.

The `users` table stores account details, including hashed passwords and user roles. The `vehicles` table stores vehicle information such as make, model, category, price, and available quantity.

## 7. Running the Tests

From the project root, run:

```bash
cd backend
npm install
npm test
```

The project test suite uses Jest and Supertest.

**Test results:** Add the final test results here after running the test command. Include the number of test suites and tests passed or failed.

## 8. Application Screenshots

Add screenshots of the actual application after testing its features.

Suggested screenshots:
1. Registration page
2. Login page
3. Vehicle dashboard
4. Vehicle search results
5. Purchase confirmation
6. Test results in the terminal

Save the screenshots in a folder such as `screenshots/` and embed them below. For example:

```markdown
![Login Page](screenshots/login.png)
```

## 9. My AI Usage

AI tools were used as development assistants during this project. They helped with understanding errors, troubleshooting deployment, reviewing code, and providing guidance on implementation and testing.

I reviewed and tested the project changes during development. The final description of AI usage should accurately reflect the assistance received and the work completed independently.

## 10. AI Prompt Logs

The raw AI conversation logs or public conversation links are maintained separately in the root-level `PROMPTS.md` file, as required by the assignment.

The prompt log should contain the original, unedited conversations or public chat links rather than AI-generated summaries.

## 11. Live Application

- **Frontend:** https://car-dealership-frontend-hx2p.onrender.com
- **Backend API:** https://car-dealership-backend-p6k0.onrender.com

The deployed frontend and backend can be tested through their respective public URLs. The backend API is not the website's user interface.

## 12. Author

Developed as an academic full-stack web development project.
