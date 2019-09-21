var mongoose = require('../../db').mongooseInstance
var Schema = mongoose.Schema
var enabledSchemas = ['Restaurant']
var Restaurant = {
    name: {
        type:String,
        required:true,
        unique:true
    },
    region: {
        type:String,
        required:true,
    },
    preference: {
        type:Number,
        required:true,
        set: v => Math.round(v),
        min: 0,
        max: 100
    },
    weather: {
        type:String,
        required:true,
    },
    money: {
        type:Number,
        required:true,
        set: v => Math.round(v/10) * 10,
        min: 0
    },
    comment: {
        type:String,
        default: '',
        trim:true,
    },
    lastVisit: Date,
    selectedTime: {
        type: Number,
        default: 0,
    }
};
var schemas = {}
enabledSchemas.forEach( schema => {
    schemas[schema] = new Schema(eval(schema));
})

module.exports = schemas