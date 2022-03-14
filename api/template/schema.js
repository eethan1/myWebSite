var mongoose = require('../../db').mongooseInstance
var Schema = mongoose.Schema
var enabledSchemas = ['Restaurant']
var Restaurant = {
    _id: {
        type:String,
        required:true,
        index:true,
        unique:true
    },
};
var schemas = {}
enabledSchemas.forEach( schema => {
    schemas[schema] = new Schema(eval(schema));
})

module.exports = schemas