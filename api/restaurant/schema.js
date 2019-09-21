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
        enum:['都可','公館','水源','118','汀州路','吳興街']
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
        enum:['都可','晴天','熱爆','下雨','很涼','冷']
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