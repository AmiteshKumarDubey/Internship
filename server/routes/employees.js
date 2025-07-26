const express = require('express');
const router = express.Router();

const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  addEmployeeDetail,
  getDepartmentEmployees
} = require('../controllers/employeeController');

// Main employee routes
router.route('/')
  .get(getEmployees)
  .post(createEmployee);

// Department route
router.route('/department/:department')
  .get(getDepartmentEmployees);

// Get or update employee by ID
router.route('/:id')
  .get(getEmployeeById)
  .put(updateEmployee);

// Add dynamic field to employee
router.patch('/:id/details', addEmployeeDetail);

module.exports = router;
