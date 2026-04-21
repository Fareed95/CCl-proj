const express = require('express');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const env = require('./config/env');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api', fileRoutes);

app.get('/file/:fileId', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'file.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
