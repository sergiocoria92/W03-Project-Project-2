const carsRoutes = require('./routes/cars');
const motorcyclesRoutes = require('./routes/motorcycles');
const mongo = require('./db/conn');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/cars', carsRoutes);
app.use('/motorcycles', motorcyclesRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((req, res) => {
  res.status(404).json('Sorry, page not found');
});

mongo.connectToServer((err) => {
  if (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
});
