const Employee = require('../models/Employee');

// GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const { search, name } = req.query;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    } else if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    const employees = await Employee.find(query);
    res.status(200).json({ success: true, data: employees }); // ✅ _id is included by default
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json({ success: true, data: newEmployee });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: updatedEmployee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ FIXED: PATCH /api/employees/:id/details to accept { key, value }
// ✅ FIXED: PATCH /api/employees/:id/details to accept { key, value }
const addEmployeeDetail = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { key, value } = req.body;

    if (!employeeId || !key || value === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing key or value' 
      });
    }

    // Build update object
    const update = { $set: { [key]: value } };

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      update,
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: updatedEmployee 
    });

  } catch (err) {
    console.error("❌ Add Detail Error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};
// GET /api/employees/department/:department
const getDepartmentEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ department: req.params.department });
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ EXPORT ALL
module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  addEmployeeDetail,
  getDepartmentEmployees
};
