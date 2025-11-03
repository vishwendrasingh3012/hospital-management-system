// server/models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      const value = this.getDataValue('date');
      if (!value) return null;
      try {
        // Handle both Date objects and date strings
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return null;
        return date;
      } catch (error) {
        console.error('Error in date getter:', error);
        return null;
      }
    },
    set(value) {
      if (!value) {
        this.setDataValue('date', null);
        return;
      }
      try {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
          this.setDataValue('date', null);
          return;
        }
        this.setDataValue('date', date);
      } catch (error) {
        console.error('Error in date setter:', error);
        this.setDataValue('date', null);
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'booked', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('feedback');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('feedback', value ? JSON.stringify(value) : null);
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['patientId', 'date']
    },
    {
      fields: ['doctorId', 'date']
    }
  ]
});

// Define associations
Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

module.exports = Appointment;








