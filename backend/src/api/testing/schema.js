var mongoose = require('../../db').mongooseInstance
var Schema = mongoose.Schema
var enabledSchemas = ['']

var schemas = {}
enabledSchemas.forEach( schema => {
    schemas[schema] = new Schema(eval(schema));
})

module.exports = schemas