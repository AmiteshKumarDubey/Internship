const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  addEmployeeDetail,
  getDepartmentEmployees
} = require('../controllers/employeeController');
router
  .route('/')
  .get(getEmployees)        // GET /api/employees?search=xyz (optional)
  .post(createEmployee);    // POST /api/employees

router
  .route('/department/:department')
  .get(getDepartmentEmployees); // GET /api/employees/department/IT
router
  .route('/:id')
  .get(getEmployeeById)     // GET /api/employees/:id
  .put(updateEmployee);     // PUT /api/employees/:id


router
  .patch('/:id/details', addEmployeeDetail); // PATCH /api/employees/:id/details

module.exports = router;
