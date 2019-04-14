const ARG = require('./ARG');
var mongoose = require('mongoose');
var redis = require('redis');
const EXPIRETIME = 3600;
var client = redis.createClient('6379', '127.0.0.1', {});

client.on('ready', (res)=>{
    console.log('redis ready: ' + res);
});

client.on('error', (err) => {
    console.log('connect redis error: ' + err);
});

var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
// var IPInfor = new Schema({
//     ip:String,
//     count: Number,
//     lastReqTime: Number
// });

// var IPInforModel = mongoose.model('IPInfor', IPInfor);

var dbConnection = mongoose.createConnection(`mongodb://${ARG.dbIP}/dcarso`);
dbConnection.on('error', (err)=>{
    console.log('connect mongodb failed');
});

var dbSchemas = {
    ipInforSchema:{
        _id:String,
        ip:String,
        count: Number,
        lastReqTime: Number
    }
};

class IPInforModel {
    constructor(connection, schema) {
        this.name = 'ipInfor';
        this.schema = new Schema(schema);
        this.model = connection.model(`IPInforModel`, this.schema, this.name);
    }
    
    findOrCreateByIP(customIP) {
        return new Promise((resolve, reject) => {
            client.get(customIP, (err, reply) => {
                if(err) {
                    return reject(err);
                }
                if(reply) {
                    return resolve(JSON.parse(reply));
                }
               this.model.findOne({ip:customIP}, (err, ipInfor) => {
                    if(err) return reject(err);
                    if(ipInfor) {
                        client.setex(customIP, EXPIRETIME, JSON.stringify(ipInfor));
                        return resolve(ipInfor);
                    } else {
                        this.model.create({
                            _id:customIP,
                            ip:customIP,
                            count:1,
                            lastReqTime: Date.now()
                        }, (err, ipInfor) => {
                            if(err) return reject(err);
                            client.setex(customIP, EXPIRETIME, JSON.stringify(ipInfor));
                            return resolve(ipInfor);
                        });
                    }
                });
            });
        });
    }

    update(customIP, now) {
        return new Promise((resolve, reject) => {
            console.log('update');
            client.incr()
            client.mset()
            this.model.update({ip:ipInfor.ip}, ipInfor, (err, record) => {
                if(err) console.log(err);
            }).then(() =>{
                client.setex(ipInfor.ip, EXPIRETIME, JSON.stringify(ipInfor));
                return resolve(ipInfor);
            }).catch(err=>{console.log(err);});
        });
    }

}
module.exports = {
    mongoose:mongoose,
    IPInforModel:new IPInforModel(dbConnection, dbSchemas.ipInforSchema),
}