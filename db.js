const ARG = require('./ARG');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Msg = new Schema({
    sid: String,
    msg: String,
    time:String
});

var MsgModel = mongoose.model('Msg', Msg);

mongoose.connect(`mongodb://${ARG.dbIP}/express-msg`);

module.exports = {
    mongoose:mongoose,
    Msg:MsgModel,
}


