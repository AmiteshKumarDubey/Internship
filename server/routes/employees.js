const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  getDepartmentEmployees,
  getEmployeesByAgeRange,
  getEmployeesBySalaryRange,
  getEmployeesByJobRole
} = require('../controllers/employeeController');

// Modified to support search by name (query param)
router.route('/')
  .get(getEmployees) // now supports ?name=xyz
  .post(createEmployee);

// Employee statistics
router.route('/stats')
  .get(getEmployeeStats);

// Department filter
router.route('/department/:department')
  .get(getDepartmentEmployees);

// Age filter
router.route('/age/:minAge/:maxAge')
  .get(getEmployeesByAgeRange);

// Salary filter
router.route('/salary/:minSalary/:maxSalary')
  .get(getEmployeesBySalaryRange);

// Job role filter
router.route('/jobrole/:role')
  .get(getEmployeesByJobRole);

// Get/Update/Delete single employee by ID
router.route('/:id')
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
