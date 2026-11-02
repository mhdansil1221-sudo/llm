import { Employee } from '../models/Employee.js';

export const INITIAL_EMPLOYEES = [
  {
    employeeId: 'EMP-001',
    name: 'Alice Smith',
    email: 'alice.smith@enterprise-corp.com',
    department: 'Cybersecurity',
    role: 'Lead SecOps Engineer',
    password: 'P@ssw0rd_Alice#99',
    salary: 135000,
    accessLevel: 'ADMIN'
  },
  {
    employeeId: 'EMP-002',
    name: 'Bob Miller',
    email: 'bob.miller@enterprise-corp.com',
    department: 'Cloud Infrastructure',
    role: 'DevOps Lead',
    password: 'Dev0ps!Root_2026',
    salary: 128000,
    accessLevel: 'ADMIN'
  },
  {
    employeeId: 'EMP-003',
    name: 'Charlie Davis',
    email: 'charlie.davis@enterprise-corp.com',
    department: 'Finance',
    role: 'Senior Financial Analyst',
    password: 'Fin@nce$Davis24',
    salary: 95000,
    accessLevel: 'MANAGER'
  },
  {
    employeeId: 'EMP-004',
    name: 'David Clark',
    email: 'david.clark@enterprise-corp.com',
    department: 'Software Engineering',
    role: 'Senior Backend Developer',
    password: 'NodeJs_D@vid99',
    salary: 115000,
    accessLevel: 'USER'
  },
  {
    employeeId: 'EMP-005',
    name: 'Emma Wilson',
    email: 'emma.wilson@enterprise-corp.com',
    department: 'Human Resources',
    role: 'HR Director',
    password: 'HRP@ss_Emma#44',
    salary: 105000,
    accessLevel: 'MANAGER'
  },
  {
    employeeId: 'EMP-006',
    name: 'Frank Thomas',
    email: 'frank.thomas@enterprise-corp.com',
    department: 'Software Engineering',
    role: 'Frontend Architect',
    password: 'Fr@nkReact2026!',
    salary: 118000,
    accessLevel: 'USER'
  },
  {
    employeeId: 'EMP-007',
    name: 'Grace Hopper',
    email: 'grace.hopper@enterprise-corp.com',
    department: 'IT Systems',
    role: 'Principal System Administrator',
    password: 'SysAdmin#Gr@ce91',
    salary: 142000,
    accessLevel: 'ROOT'
  },
  {
    employeeId: 'EMP-008',
    name: 'Hannah Abbott',
    email: 'hannah.abbott@enterprise-corp.com',
    department: 'Product Marketing',
    role: 'Marketing Manager',
    password: 'M@rket!ng_H@nnah',
    salary: 88000,
    accessLevel: 'USER'
  },
  {
    employeeId: 'EMP-009',
    name: 'Ian Wright',
    email: 'ian.wright@enterprise-corp.com',
    department: 'Legal & Compliance',
    role: 'Corporate Counsel',
    password: 'L3gal_C0mpli@nce',
    salary: 130000,
    accessLevel: 'MANAGER'
  },
  {
    employeeId: 'EMP-010',
    name: 'Julia Roberts',
    email: 'julia.roberts@enterprise-corp.com',
    department: 'Executive Leadership',
    role: 'Chief Executive Officer',
    password: 'CE0_M@sterKey!77',
    salary: 220000,
    accessLevel: 'ROOT'
  }
];

export async function seedEmployees() {
  try {
    const count = await Employee.countDocuments();
    if (count < 10) {
      await Employee.deleteMany({});
      await Employee.insertMany(INITIAL_EMPLOYEES);
      console.log(`[SeedEmployees] Successfully inserted 10 enterprise employee records into MongoDB.`);
    } else {
      console.log(`[SeedEmployees] MongoDB already contains ${count} employee records.`);
    }
  } catch (err) {
    console.warn(`[SeedEmployees] Error seeding employees: ${err.message}`);
  }
}
