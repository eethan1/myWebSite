const config = require('./config');
global.mongoose = require('mongoose');

mongoose.connect(`mongodb://${config.dbIP}/express-msg`,{useNewUrlParser: true});

module.exports = {
    mongooseInstance:mongoose,
}


