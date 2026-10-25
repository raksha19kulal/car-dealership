const express = require('express');
const cors = require('cors');
const authRouter = require('./auth');
const vehiclesRouter = require('./vehicles');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);

module.exports = app;