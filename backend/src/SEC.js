var randomstring = require('randomstring');
module.exports = {
    secret:randomstring.generate(128)
}