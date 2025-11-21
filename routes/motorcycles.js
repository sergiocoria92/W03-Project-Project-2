const express = require('express');
const router = express.Router();
const motorcyclesController = require('../controllers/motorcycles');

router.get('/', motorcyclesController.getAllMotorcycles);
router.get('/:id', motorcyclesController.getMotorcycleById);
router.post('/', motorcyclesController.createMotorcycle);
router.put('/:id', motorcyclesController.updateMotorcycle);
router.delete('/:id', motorcyclesController.deleteMotorcycle);


module.exports = router;
