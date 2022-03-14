var mongoose = require('../../db').mongooseInstance
var Schema = mongoose.Schema
var enabledSchemas = ['Msg']
var Msg = {
    sid: String,
    msg: String,
    time:String
};


var schemas = {}
enabledSchemas.forEach( schema => {
    schemas[schema] = new Schema(eval(schema));
})

module.exports = schemas