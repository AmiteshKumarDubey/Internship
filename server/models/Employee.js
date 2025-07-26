const mongoose = require('mongoose');
const validator = require('validator');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  age: {
    type: Number,
    min: 18,
    max: 70
  },
  attrition: {
    type: Boolean,
    default: false
  },
  businessTravel: {
    type: String,
    enum: ["Non-Travel", "Travel_Rarely", "Travel_Frequently"],
    default: "Non-Travel"
  },
  dailyRate: Number,
  department: {
    type: String,
    enum: ["Sales", "Research & Development", "Human Resources"],
    required: true
  },
  distanceFromHome: Number,
  education: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  educationField: {
    type: String,
    enum: ["Life Sciences", "Medical", "Marketing", "Technical Degree", "Other"]
  },
  employeeCount: {
    type: Number,
    default: 1
  },
  environmentSatisfaction: {
    type: Number,
    min: 1,
    max: 4
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  },
  hourlyRate: Number,
  jobInvolvement: {
    type: Number,
    min: 1,
    max: 4
  },
  jobLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  jobRole: {
    type: String,
    enum: [
      "Sales Executive", "Research Scientist", "Laboratory Technician",
      "Manufacturing Director", "Healthcare Representative", "Manager",
      "Sales Representative", "Research Director", "Human Resources"
    ]
  },
  jobSatisfaction: {
    type: Number,
    min: 1,
    max: 4
  },
  maritalStatus: {
    type: String,
    enum: ["Single", "Married", "Divorced"]
  },
  monthlyIncome: Number,
  monthlyRate: Number,
  numCompaniesWorked: {
    type: Number,
    min: 0
  },
  overTime: Boolean,
  percentSalaryHike: Number,
  performanceRating: {
    type: Number,
    min: 1,
    max: 4
  },
  relationshipSatisfaction: {
    type: Number,
    min: 1,
    max: 4
  },
  standardHours: {
    type: Number,
    default: 80
  },
  stockOptionLevel: {
    type: Number,
    min: 0,
    max: 3
  },
  totalWorkingYears: Number,
  trainingTimesLastYear: Number,
  workLifeBalance: {
    type: Number,
    min: 1,
    max: 4
  },
  yearsAtCompany: Number,
  yearsInCurrentRole: Number,
  yearsSinceLastPromotion: Number,
  yearsWithCurrManager: Number,
  joiningDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for frequently queried fields
employeeSchema.index({ department: 1, jobRole: 1 });
employeeSchema.index({ age: 1, gender: 1 });
employeeSchema.index({ monthlyIncome: -1 });
employeeSchema.index({ yearsAtCompany: -1 });

// Virtual for formatted employee profile
employeeSchema.virtual('profileSummary').get(function() {
  return `${this.name} (${this.employeeId}) - ${this.jobRole} in ${this.department}`;
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;