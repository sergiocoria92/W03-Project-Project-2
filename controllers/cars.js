const { ObjectId } = require('mongodb');
const { getDb } = require('../db/conn');

function validateCar(data) {
  const errors = [];

  if (!data.make || typeof data.make !== 'string') {
    errors.push('make is required and must be a string');
  }

  if (!data.model || typeof data.model !== 'string') {
    errors.push('model is required and must be a string');
  }

  if (data.year === undefined || typeof data.year !== 'number') {
    errors.push('year is required and must be a number');
  }

  if (data.price === undefined || typeof data.price !== 'number') {
    errors.push('price is required and must be a number');
  }




  if (typeof data.year === 'number' && data.year <= 0) {
    errors.push('year must be greater than 0');
  }

  if (typeof data.price === 'number' && data.price < 0) {
    errors.push('price cannot be negative');
  }

  if (data.mileage !== undefined) {
    if (typeof data.mileage !== 'number') {
      errors.push('mileage must be a number if provided');
    } else if (data.mileage < 0) {
      errors.push('mileage cannot be negative');
    }
  }


  if (data.owners !== undefined) {
    if (typeof data.owners !== 'number') {
      errors.push('owners must be a number if provided');
    } else if (data.owners < 0) {
      errors.push('owners cannot be negative');
    }
  }

  return errors;
}

async function getAllCars(req, res) {
  try {
    const db = getDb();
    const cars = await db.collection('cars').find({}).toArray();

    res.status(200).json(cars);
  } catch (error) {
    console.error('Error in getAllCars:', error);

    res.status(500).json({ error: 'Error getting cars' });
  }
}

async function getCarById(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID (not a valid ObjectId)' });
    }

    const db = getDb();
    const car = await db
      .collection('cars')
      .findOne({ _id: new ObjectId(id) });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.status(200).json(car);
  } catch (error) {
    console.error('Error in getCarById:', error);
    res.status(500).json({ error: 'Error getting car by id' });
  }
}

async function createCar(req, res) {
  try {
    const carData = req.body;

    const errors = validateCar(carData);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = getDb();
    const result = await db.collection('cars').insertOne(carData);

    res.status(201).json({
      message: 'Car created successfully',
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error in createCar:', error);
    res.status(500).json({ error: 'Error creating car' });
  }
}

async function updateCar(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID for update' });
    }

    const carData = req.body;

    const errors = validateCar(carData);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = getDb();
    const result = await db
      .collection('cars')
      .updateOne({ _id: new ObjectId(id) }, { $set: carData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Car not found for update' });
    }

    res.status(200).json({ message: 'Car updated successfully' });
  } catch (error) {
    console.error('Error in updateCar:', error);
    res.status(500).json({ error: 'Error updating car' });
  }
}

async function deleteCar(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID for delete' });
    }

    const db = getDb();
    const result = await db
      .collection('cars')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Car not found for delete' });
    }

    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCar:', error);
    res.status(500).json({ error: 'Error deleting car' });
  }
}

module.exports = {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};
