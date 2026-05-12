const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    platformName: { type: String, default: 'AnnexLink' },
    supportEmail: { type: String, default: 'support@student.bup.edu.bd' },
    maintenanceMode: { type: Boolean, default: false },
    requireEmailVerification: { type: Boolean, default: true },
    categories: { type: [String], default: ['Web Design', 'Tutoring', 'UI/UX'] }
});

module.exports = mongoose.model('Setting', settingSchema);