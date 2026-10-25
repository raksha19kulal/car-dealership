# Car Dealership Inventory System

## 1. Project Overview

The Car Dealership Inventory System is a web application that allows users to browse available vehicles, search the inventory, and purchase vehicles. Administrators can manage the dealership's inventory through a dashboard.

## 2. Features

### User Features
- User registration and login
- JWT-based authentication
- View available vehicles
- Search vehicles by make, model, and category
- Purchase vehicles
- Prevent purchasing vehicles that are out of stock

### Administrator Features
- Add new vehicles
- Edit vehicle details
- Delete vehicles
- Restock vehicles
- Manage vehicle inventory

## 3. Technologies Used

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- SQLite
- JSON Web Tokens (JWT)
- bcryptjs

**Testing**
- Jest
- Supertest

## 4. Project Structure

```text
car-dealership/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── dealership.db
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── README.md
└── PROMPTS.md
```

## 5. Installation and Setup

### Prerequisites
- Node.js
- npm
- Git

### Step 1: Install Backend Dependencies

Open a terminal in the project directory and run:

```bash
cd backend
npm install
```

### Step 2: Start the Backend

```bash
npm start
```

The backend runs on port 5000, provided the port is available and the application is configured accordingly.

### Step 3: Install Frontend Dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### Step 4: Start the Frontend

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## 6. Automated Testing

Backend tests are executed using:

```bash
cd backend
npm test
```

### Latest Test Results

- Test suites passed: 3
- Tests passed: 14
- Tests failed: 0

All 14 backend tests passed in the latest test run.

## 7. AI Usage

AI tools were used to assist with coding, debugging, and project documentation. The AI prompts and relevant assistance will be documented in `PROMPTS.md`.

## 8. Future Improvements

- Add automated frontend tests.
- Improve input validation and error handling.
- Add additional vehicle filtering and sorting.
- Improve deployment and production security.