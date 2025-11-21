const { ObjectId } = require('mongodb');
const { getDb } = require('../db/conn');

function validateMotorcycle(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Body must be a JSON object');
    return errors;
  }

  if (!data.brand || typeof data.brand !== 'string') {
    errors.push('brand is required and must be a string');
  }

  if (!data.model || typeof data.model !== 'string') {
    errors.push('model is required and must be a string');
  }

  if (data.year === undefined || typeof data.year !== 'number') {
    errors.push('year is required and must be a number');
  }

  if (data.engineCC === undefined || typeof data.engineCC !== 'number') {
    errors.push('engineCC is required and must be a number');
  }

  if (data.price === undefined || typeof data.price !== 'number') {
    errors.push('price is required and must be a number');
  }

  if (data.isUsed !== undefined && typeof data.isUsed !== 'boolean') {
    errors.push('isUsed must be boolean if provided');
  }


  if (typeof data.year === 'number' && data.year <= 0) {
    errors.push('year must be greater than 0');
  }


  if (typeof data.engineCC === 'number' && data.engineCC <= 0) {
    errors.push('engineCC must be greater than 0');
  }


  if (typeof data.price === 'number' && data.price < 0) {
    errors.push('price cannot be negative');
  }

  return errors;
}

async function getAllMotorcycles(req, res) {
  try {
    const db = getDb();
    const motos = await db.collection('motorcycles').find({}).toArray();
    res.status(200).json(motos);
  } catch (err) {
    console.error('Error in getAllMotorcycles:', err);
    res.status(500).json({ error: 'Error getting motorcycles' });
  }
}

async function getMotorcycleById(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    const db = getDb();
    const moto = await db
      .collection('motorcycles')
      .findOne({ _id: new ObjectId(id) });

    if (!moto) {
      return res.status(404).json({ error: 'Motorcycle not found' });
    }

    res.status(200).json(moto);
  } catch (err) {
    console.error('Error in getMotorcycleById:', err);
    res.status(500).json({ error: 'Error getting motorcycle by id' });
  }
}

async function createMotorcycle(req, res) {
  try {
    const motoData = req.body;
    const errors = validateMotorcycle(motoData);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = getDb();
    const result = await db.collection('motorcycles').insertOne(motoData);

    res.status(201).json({
      message: 'Motorcycle created',
      id: result.insertedId
    });
  } catch (err) {
    console.error('Error in createMotorcycle:', err);
    res.status(500).json({ error: 'Error creating motorcycle' });
  }
}

async function updateMotorcycle(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id for update' });
    }

    const motoData = req.body;
    const errors = validateMotorcycle(motoData);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = getDb();
    const result = await db
      .collection('motorcycles')
      .updateOne({ _id: new ObjectId(id) }, { $set: motoData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Motorcycle not found to update' });
    }

    res.status(200).json({ message: 'Motorcycle updated' });
  } catch (err) {
    console.error('Error in updateMotorcycle:', err);
    res.status(500).json({ error: 'Error updating motorcycle' });
  }
}

async function deleteMotorcycle(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id for delete' });
    }

    const db = getDb();
    const result = await db
      .collection('motorcycles')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Motorcycle not found to delete' });
    }

    res.status(200).json({ message: 'Motorcycle deleted' });
  } catch (err) {
    console.error('Error in deleteMotorcycle:', err);
    res.status(500).json({ error: 'Error deleting motorcycle' });
  }
}

module.exports = {
  getAllMotorcycles,
  getMotorcycleById,
  createMotorcycle,
  updateMotorcycle,
  deleteMotorcycle
};
