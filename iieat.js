const ARG = require('./ARG');
var xss = require('xss');
var mongoose = require('mongoose');
var dbConnection = mongoose.createConnection(`mongodb://${ARG.dbIP}/iieat`);
dbConnection.on('error', (err) => {
    console.log('connect 7oeat failed');
    console.log(err)
});
var Schema = mongoose.Schema;
var restaurantSchema = new Schema({
    name:String,
    type:String
});

var iimodel = dbConnection.model(`iieat`, restaurantSchema, 'restaurant');
var iieat = function(app) {
    app.iimodel = iimodel; 
    app.get('/iieat/add',(req, res, next) => {
        var name = xss(req.query.name);
        app.iimodel.create({name:name, id:0}, (err, reply)=>{
            console.log(err);
            console.log(reply);
        });
        res.render('iieat');

    });
    app.get('/iieat',(req, res, next) => {
        if(!req.query.submit){
            res.render('iieat', {restaurant:0});
        }else{
            app.iimodel.estimatedDocumentCount()
            .then(count => {
                var index = Math.floor(Math.random() * count);
                console.log(index)
                app.iimodel.findOne().skip(index).exec( (err, restaurant) => {
                    if(err){
                        console.log(err)
                    }else{
                        res.render('iieat', {'restaurant':restaurant.name});
                    }
                }) ;
            });
        }
    });
}

module.exports = {
    addApp:iieat
}