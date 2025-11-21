const express = require('express');
const router = express.Router(); 
const carsController = require('../controllers/cars');

router.get('/', carsController.getAllCars);
router.get('/:id', carsController.getCarById);
router.post('/', carsController.createCar);
router.put('/:id', carsController.updateCar);
router.delete('/:id', carsController.deleteCar);


module.exports = router;
