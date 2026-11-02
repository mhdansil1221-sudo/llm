import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  accessLevel: {
    type: String,
    enum: ['USER', 'MANAGER', 'ADMIN', 'ROOT'],
    default: 'USER'
  }
}, {
  timestamps: true
});

export const Employee = mongoose.model('Employee', EmployeeSchema);
