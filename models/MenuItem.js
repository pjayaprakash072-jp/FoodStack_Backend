const mongoose = require('mongoose');


const menuItemSchema = new mongoose.Schema(
    {
        outlet:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuCategory',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            rdefault: ''
        },
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            default: '' 
        },
        discount: {
            type: Number,
            default: 0  
        },
        foodType: {
            type: String,
            enum: ['Veg', 'Non-Veg'],
            required: true
        },
        preparationTime: {
            type: Number,
            default: 15
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        }

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('MenuItem', menuItemSchema);