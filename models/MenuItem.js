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
            default: ''
        },
        price: {
            type: Number,
            required: true
        },
        stock: {
            type: Number,
            default: 0,
            min: 0
        },
        image: {
            url: {
                type: String,
                default: ''
            },
            public_id: {
                type: String,
                default: ''
            }
        },
        discount: {
            type: Number,
            default: 0 ,
            min: 0,
            max: 100
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