// model/Station.js
const mongoose = require('mongoose');

// Sub-Schema: Historical Data
// This schema stores the "typical" crowd density (0-100) for every hour of the day.
// Each array has 24 numbers: Index 0 is 12 AM, Index 23 is 11 PM.
// We disable _id here because this is just a data container embedded inside the Station.
const HistoricalDaySchema = new mongoose.Schema({
    monday: [Number],
    tuesday: [Number],
    wednesday: [Number],
    thursday: [Number],
    friday: [Number]
}, { _id: false });


const StationSchema = new mongoose.Schema({
    // Identification
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // "Order" is crucial for the Line Map. It ensures stations appear in the correct geographic sequence (e.g., Baclaran -> Roosevelt)
    // rather than the order they were added to the database.
    order: {
        type: Number,
        required: true,
        unique: true 
    },

    // Live Status
    // These fields represent the *current* situation displayed on the dashboard.
    crowdLevel: {
        northbound: {
            type: String,
            enum: ['light', 'moderate', 'heavy'],
            default: 'light'
        },
        southbound: {
            type: String,
            enum: ['light', 'moderate', 'heavy'],
            default: 'light'
        }
    },
    // General service alerts (e.g., "Normal Operation", "Service Interruption")
    liveStatus: {
        type: String,
        default: 'Data not available'
    },

    // Static Info
    // Used to display transfer icons on the UI (e.g., ["MRT-3", "LRT-2"])
    transitConnections: {
        type: [String], 
        default: []
    },
    
    // We store the sub-schema here. The controller checks these arrays 
    // to estimate the crowd level based on the current time of day.
    historicalDataNB: HistoricalDaySchema,
    historicalDataSB: HistoricalDaySchema
});

module.exports = mongoose.model('Station', StationSchema);