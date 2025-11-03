// server/routes/admin.js
const router = require('express').Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Public routes (no authentication required)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username, role: 'admin' } });
    if (!user) return res.status(404).json({ message: 'User not found or role mismatch' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ 
      token, 
      role: user.role,
      id: user.id,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected routes (authentication required)
// Apply authentication middleware to all routes below this point
const authenticateAdmin = [verifyToken, verifyRole('admin')];
router.use(authenticateAdmin);

// Doctor Management
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['id', 'username', 'name', 'phone', 'email', 'specialization', 'experience', 'createdAt']
    });

    // Get statistics for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's appointments
        const appointmentsToday = await Appointment.count({
          where: {
            doctorId: doctor.id,
            date: {
              [Op.gte]: today
            },
            status: {
              [Op.in]: ['booked', 'completed']
            }
          }
        });

        // Get total appointments
        const totalAppointments = await Appointment.count({
          where: {
            doctorId: doctor.id,
            status: {
              [Op.in]: ['booked', 'completed']
            }
          }
        });

        // Get unique patients today
        const patientsToday = await Appointment.count({
          where: {
            doctorId: doctor.id,
            date: {
              [Op.gte]: today
            },
            status: {
              [Op.in]: ['booked', 'completed']
            }
          },
          distinct: true,
          col: 'patientId'
        });

        // Get total unique patients
        const totalPatients = await Appointment.count({
          where: {
            doctorId: doctor.id,
            status: {
              [Op.in]: ['booked', 'completed']
            }
          },
          distinct: true,
          col: 'patientId'
        });

        return {
          ...doctor.toJSON(),
          appointmentsToday,
          totalAppointments,
          patientsToday,
          totalPatients
        };
      })
    );

    res.json(doctorsWithStats);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/doctors', async (req, res) => {
  try {
    const { username, password, name, email, phone, specialization, experience } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const newDoctor = await User.create({
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      specialization,
      experience,
      role: 'doctor'
    });

    // Remove password from response
    const { password: _, ...doctorData } = newDoctor.toJSON();

    res.status(201).json(doctorData);
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ 
      message: err.message || 'Error adding doctor',
      details: err.errors?.map(e => e.message) || []
    });
  }
});

router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    // Check if doctor exists and is actually a doctor
    const doctor = await User.findOne({
      where: { id: doctorId, role: 'doctor' }
    });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Delete doctor's appointments first
    await Appointment.destroy({
      where: { doctorId }
    });

    // Then delete the doctor
    await User.destroy({
      where: { id: doctorId }
    });

    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({ message: err.message });
  }
});

// Patient Management
router.get('/patients', async (req, res) => {
  try {
    const patients = await User.findAll({
      where: { role: 'patient' },
      attributes: ['id', 'username', 'name', 'phone', 'email', 'createdAt']
    });
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/patients', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient
    const newPatient = await User.create({
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      role: 'patient'
    });

    // Remove password from response
    const { password: _, ...patientData } = newPatient.toJSON();

    res.status(201).json(patientData);
  } catch (err) {
    console.error('Error adding patient:', err);
    res.status(500).json({ 
      message: err.message || 'Error adding patient',
      details: err.errors?.map(e => e.message) || []
    });
  }
});

router.delete('/patients/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Check if patient exists and is actually a patient
    const patient = await User.findOne({
      where: { id: patientId, role: 'patient' }
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Delete patient's appointments first
    await Appointment.destroy({
      where: { patientId }
    });

    // Then delete the patient
    await User.destroy({
      where: { id: patientId }
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get patient details with appointment counts
router.get('/patients/:patientId', async (req, res) => {
  try {
    console.log('Fetching details for patient:', req.params.patientId);
    
    const patient = await User.findOne({
      where: { id: req.params.patientId, role: 'patient' },
      attributes: ['id', 'name', 'email', 'phone', 'username']
    });

    if (!patient) {
      console.log('Patient not found:', req.params.patientId);
      return res.status(404).json({ message: 'Patient not found' });
    }

    console.log('Found patient:', patient.id);

    // Get appointment counts
    const totalAppointments = await Appointment.count({
      where: { patientId: req.params.patientId }
    });

    const completedAppointments = await Appointment.count({
      where: { 
        patientId: req.params.patientId,
        status: 'completed'
      }
    });

    const pendingAppointments = await Appointment.count({
      where: { 
        patientId: req.params.patientId,
        status: 'booked'
      }
    });

    console.log('Appointment counts:', {
      total: totalAppointments,
      completed: completedAppointments,
      pending: pendingAppointments
    });

    const response = {
      ...patient.toJSON(),
      totalAppointments,
      completedAppointments,
      pendingAppointments
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('Error fetching patient details:', err);
    res.status(500).json({ message: 'Failed to fetch patient details' });
  }
});

// Get Statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total counts
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });
    const totalAppointments = await Appointment.count();

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentsToday = await Appointment.count({
      where: {
        date: {
          [Op.gte]: today
        }
      }
    });

    // Generate last 12 months
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // Format: YYYY-MM
    }).reverse();

    // Get appointments by month for the last 12 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    const appointments = await Appointment.findAll({
      where: {
        date: {
          [Op.gte]: startDate
        }
      },
      attributes: ['date']
    });

    // Process appointments to group by month
    const appointmentsByMonth = appointments.reduce((acc, appointment) => {
      try {
        const date = appointment.date;
        if (date) {
          const month = date.toISOString().slice(0, 7);
          acc[month] = (acc[month] || 0) + 1;
        }
      } catch (error) {
        console.error('Error processing appointment date:', error);
      }
      return acc;
    }, {});

    // Fill in missing months with zero counts for appointments
    const filledAppointmentsByMonth = last12Months.map(month => ({
      month,
      count: appointmentsByMonth[month] || 0
    }));

    // Get doctors by specialization
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['specialization']
    });

    // Process doctors to group by specialization
    const doctorsBySpecializationMap = doctors.reduce((acc, doctor) => {
      const spec = doctor.specialization || 'No Specialization';
      acc[spec] = (acc[spec] || 0) + 1;
      return acc;
    }, {});

    const doctorsBySpecialization = Object.entries(doctorsBySpecializationMap).map(([specialization, count]) => ({
      specialization,
      count
    }));

    // Get patient growth (new patients by month)
    const patients = await User.findAll({
      where: {
        role: 'patient',
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: ['createdAt']
    });

    // Process patients to group by month
    const patientsByMonth = patients.reduce((acc, patient) => {
      try {
        const date = new Date(patient.createdAt);
        const month = date.toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
      } catch (error) {
        console.error('Error processing patient date:', error);
      }
      return acc;
    }, {});

    // Fill in missing months with zero counts for patient growth
    const filledPatientGrowth = last12Months.map(month => ({
      month,
      count: patientsByMonth[month] || 0
    }));

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsToday,
      appointmentsByMonth: filledAppointmentsByMonth,
      doctorsBySpecialization,
      patientGrowth: filledPatientGrowth
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Manage Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users', async (req, res) => {
  const { username, password, role, name, phone, email } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(409).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role, name, phone, email });
    res.json({ message: 'User added successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await User.destroy({ where: { id: userId } });
    res.json({ message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all appointments with patient and doctor details
router.get('/all-appointments', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'specialization']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

module.exports = router;
