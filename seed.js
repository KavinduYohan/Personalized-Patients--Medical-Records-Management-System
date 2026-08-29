const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const Patient = require('./model/patient');
const Doctor = require('./model/Doctors');
const Clinic = require('./model/Clinicadd');
const Reservation = require('./model/reservation');
const AdminTest = require('./model/AdminTest');
const Voter = require('./model/Voter');
const UserProfile = require('./model/userprofile');

const mongoUri = process.env.mongodburl;

if (!mongoUri) {
  console.error('Error: mongodburl is not defined in config.env');
  process.exit(1);
}

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    // Clear existing collections
    console.log('Clearing old data...');
    await Promise.all([
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Clinic.deleteMany({}),
      Reservation.deleteMany({}),
      AdminTest.deleteMany({}),
      Voter.deleteMany({}),
      UserProfile.deleteMany({})
    ]);

    console.log('Inserting seed records...');

    // 1. Seed Users (Admin, Doctors, Patients)
    const adminUser = await Patient.create({
      name: 'System Admin',
      email: 'admin@medicare.com',
      password: 'admin123',
      cpassword: 'admin123',
      role: 'admin',
      month: 'August'
    });

    const doctorUser1 = await Patient.create({
      name: 'Dr. Johnathan Smith',
      email: 'dr.smith@medicare.com',
      password: 'doctor123',
      cpassword: 'doctor123',
      role: 'doctor',
      month: 'August'
    });

    const doctorUser2 = await Patient.create({
      name: 'Dr. Sarah Connor',
      email: 'dr.sarah@medicare.com',
      password: 'doctor123',
      cpassword: 'doctor123',
      role: 'doctor',
      month: 'August'
    });

    const doctorUser3 = await Patient.create({
      name: 'Dr. Michael Chen',
      email: 'dr.chen@medicare.com',
      password: 'doctor123',
      cpassword: 'doctor123',
      role: 'doctor',
      month: 'August'
    });

    const patientUser1 = await Patient.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'patient123',
      cpassword: 'patient123',
      role: 'patient',
      month: 'August'
    });

    const patientUser2 = await Patient.create({
      name: 'Bob Williams',
      email: 'bob@example.com',
      password: 'patient123',
      cpassword: 'patient123',
      role: 'patient',
      month: 'August'
    });

    // 2. Seed Doctors
    const doc1 = await Doctor.create({
      name: 'Dr. Johnathan Smith',
      clinic: 'A',
      specialization: 'Cardiologist',
      about: 'Senior Consultant Cardiologist with over 15 years of clinical experience in interventional cardiology.',
      slmcNumber: 'SLMC-78901',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      email: 'dr.smith@medicare.com',
      docID: doctorUser1._id
    });

    const doc2 = await Doctor.create({
      name: 'Dr. Sarah Connor',
      clinic: 'B',
      specialization: 'Neurologist',
      about: 'Specialist in neurological disorders, migraine treatments, and central nervous system rehabilitation.',
      slmcNumber: 'SLMC-45231',
      image: 'https://images.unsplash.com/photo-1594824813684-28a2a89042b5?w=400&auto=format&fit=crop&q=80',
      email: 'dr.sarah@medicare.com',
      docID: doctorUser2._id
    });

    const doc3 = await Doctor.create({
      name: 'Dr. Michael Chen',
      clinic: 'A',
      specialization: 'Pediatrician',
      about: 'Dedicated pediatrician providing comprehensive child wellness care and developmental diagnostics.',
      slmcNumber: 'SLMC-99120',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
      email: 'dr.chen@medicare.com',
      docID: doctorUser3._id
    });

    // 3. Seed Clinics
    await Clinic.create([
      {
        clinicName: 'ABC',
        location: 'Colombo 03, Sri Lanka',
        licenceNumber: 'MED-LIC-2024-001',
        description: 'Premier multi-specialty healthcare and wellness clinic with modern diagnostics.',
        services: 'Cardiology, Neurology, General Medicine, ECG, Ultrasound',
        doctors: [doc1._id, doc3._id]
      },
      {
        clinicName: 'Apex Health Center',
        location: 'Kandy Road, Kurunegala',
        licenceNumber: 'MED-LIC-2024-002',
        description: 'Comprehensive outpatient clinic and rehabilitation facility.',
        services: 'Pediatrics, ENT, Dermatology, Blood Lab Services',
        doctors: [doc2._id]
      }
    ]);

    // 4. Seed Reservations
    await Reservation.create([
      {
        doctorId: doctorUser1._id,
        patientId: patientUser1._id,
        date: new Date(Date.now() + 86400000 * 2), // 2 days from now
        timeSlot: 'morning',
        message: 'Routine cardiovascular follow-up checkup.',
        status: 'pending'
      },
      {
        doctorId: doctorUser1._id,
        patientId: patientUser2._id,
        date: new Date(Date.now() + 86400000 * 4), // 4 days from now
        timeSlot: 'afternoon',
        message: 'Chest discomfort assessment.',
        status: 'accepted'
      },
      {
        doctorId: doctorUser2._id,
        patientId: patientUser1._id,
        date: new Date(Date.now() + 86400000 * 3), // 3 days from now
        timeSlot: 'evening',
        message: 'Frequent migraine consultation.',
        status: 'accepted'
      }
    ]);

    // 5. Seed Admin Tests
    await AdminTest.create([
      { testname: 'Full Blood Count (FBC)' },
      { testname: 'Lipid Profile' },
      { testname: 'Fasting Blood Sugar (FBS)' },
      { testname: 'ECG Stress Test' },
      { testname: 'Liver Function Test (LFT)' }
    ]);

    // 6. Seed Voters (if used by module)
    await Voter.create([
      {
        fullName: 'Kamal Perera',
        nameWithInitial: 'K. Perera',
        nic: '199512345678',
        gender: 'Male',
        address: 'No 45, Temple Road, Colombo',
        district: 'Colombo',
        zonal: 'Colombo Central'
      },
      {
        fullName: 'Nimali Fernando',
        nameWithInitial: 'N. Fernando',
        nic: '199854321098',
        gender: 'Female',
        address: 'No 12, Kandy Road, Gampaha',
        district: 'Gampaha',
        zonal: 'Gampaha North'
      }
    ]);

    // 7. Seed User Profiles
    await UserProfile.create([
      {
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        dob: new Date('1996-05-14'),
        nic: '199613500987',
        civilStatus: 'single',
        gender: 'female',
        religion: 'Christian',
        occupation: 'Software Engineer',
        address: 'No 18, Lake Crescent, Colombo',
        mobileNo: '+94771234567',
        birthPlace: 'Colombo',
        bloodGroup: 'O+',
        patientId: patientUser1._id
      }
    ]);

    console.log('\n=========================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('=========================================');
    console.log('\nTest Accounts for Login:');
    console.log('Admin:   admin@medicare.com    / Password:  admin123');
    console.log('Doctor:  dr.smith@medicare.com / Password:  doctor123');
    console.log('Doctor:  dr.sarah@medicare.com / Password:  doctor123');
    console.log('Patient: alice@example.com     / Password:  patient123');
    console.log('Patient: bob@example.com       / Password:  patient123');
    console.log('=========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
