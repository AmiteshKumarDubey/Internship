const Employee = require('../models/Employee');
const asyncHandler = require('express-async-handler');

// @desc    Get all employees or search by name or ID
// @route   GET /api/employees?name=xyz
// @access  Public
exports.getEmployees = asyncHandler(async (req, res) => {
  const { name } = req.query;
  let query = {};

  if (name) {
    query.$or = [
      { employeeID: { $regex: new RegExp(name, 'i') } },
      { ["Full Name"]: { $regex: new RegExp(name, 'i') } }
    ];
  }

  const employees = await Employee.find(query);

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// @desc    Get single employee by MongoDB ID or employeeID
// @route   GET /api/employees/:id
// @access  Public
exports.getEmployee = asyncHandler(async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeID: req.params.id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error("Error fetching employee:", error); // 🔍 log actual error
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});


// @desc    Create employee
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json({
    success: true,
    data: employee
  });
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
exports.updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found'
    });
  }

  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ employeeID: req.params.id });


  if (!employee) {
    return res.status(404).json({
      success: false,
      error: 'Employee not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get employee statistics by department
// @route   GET /api/employees/stats
// @access  Public
exports.getEmployeeStats = asyncHandler(async (req, res) => {
  const stats = await Employee.aggregate([
    {
      $group: {
        _id: '$Department',
        count: { $sum: 1 },
        avgSalary: { $avg: '$Annual Salary' },
        minSalary: { $min: '$Annual Salary' },
        maxSalary: { $max: '$Annual Salary' },
        avgAge: { $avg: '$Age' }
      }
    },
    { $sort: { avgSalary: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get employees by department
// @route   GET /api/employees/department/:department
// @access  Public
exports.getDepartmentEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ Department: req.params.department });

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// @desc    Get employees by age range
// @route   GET /api/employees/age/:minAge/:maxAge
// @access  Public
exports.getEmployeesByAgeRange = asyncHandler(async (req, res) => {
  const employees = await Employee.find({
    Age: { $gte: parseInt(req.params.minAge), $lte: parseInt(req.params.maxAge) }
  });

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// @desc    Get employees by salary range
// @route   GET /api/employees/salary/:minSalary/:maxSalary
// @access  Public
exports.getEmployeesBySalaryRange = asyncHandler(async (req, res) => {
  const employees = await Employee.find({
    "Annual Salary": {
      $gte: parseInt(req.params.minSalary),
      $lte: parseInt(req.params.maxSalary)
    }
  });

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// @desc    Get employees by job role
// @route   GET /api/employees/jobrole/:role
// @access  Public
exports.getEmployeesByJobRole = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ "Job Title": req.params.role });

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});
