const ARG = require('./ARG');
var mongoose = require('mongoose');
var redis = require('redis');
const EXPIRETIME = 3600;
var client = redis.createClient('6379', '127.0.0.1', {});
var async = require('async');
const INTERVAL = ARG.ipLimitInterval;
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

    
    findOrCreateByIP(customIP, now) {
        return new Promise((resolve, reject) => {
            client.get(customIP, (err, reply) => {
                var nowHours = ~~(now/INTERVAL);
                if(err) {
                    console.log('ERR!');
                    console.log(err);
                    return reject(err);
                }
                
                if(reply) {
                    reply = JSON.parse(reply);
                    console.log('Reply!');
                    console.log(reply);
                    var lastReqHours =  ~~(reply.lastReqTime/INTERVAL);
                    reply.count = ((nowHours - lastReqHours)==0)*reply.count + 1;
                    reply.lastReqTime = now;
                    client.set(customIP, JSON.stringify(reply),(err,record)=>{
                        if(err){
                            console.log(err);
                            return reject(err);
                        } 
                        this.model.update({ip:customIP}, reply, (err, record)=>{
                            console.log('update!');
                            console.log(record);
                        });
                    });
                    return resolve(reply);
                }
               this.model.findOne({ip:customIP}, (err, ipInfor) => {
                    if(err) return reject(err);
                    if(ipInfor) {
                        var lastReqHours =  ~~(ipInfor.lastReqTime/INTERVAL);
                        ipInfor.count = ((nowHours - lastReqHours)==0)*ipInfor.count + 1;
                        ipInfor.lastReqTime = now;
                        console.log('find');
                        console.log(JSON.stringify(ipInfor));
                        client.set(customIP, JSON.stringify(ipInfor),(err,record)=>{
                            if(err) console.log('hmset error' + err);
                            this.model.update({ip:customIP}, ipInfor);
                        });
                        return resolve(ipInfor);
                    } else {
                        console.log('create: ');
                        var data = {
                            _id:customIP,
                            ip:customIP,
                            count:1,
                            lastReqTime: now
                        };
                        client.set(customIP, JSON.stringify(data));
                        this.model.create(data, (err, ipInfor) => {
                            console.log('create: ');
                            console.log(ipInfor);
                            if(err) return reject(err);
                            return resolve(data);
                        });
                    }
                });
            });
        });
    }

}
module.exports = {
    mongoose:mongoose,
    IPInforModel:new IPInforModel(dbConnection, dbSchemas.ipInforSchema),
}