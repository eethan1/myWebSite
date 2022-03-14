var xss = require('xss');
var qs = require('querystring');
var router = require('express').Router();
var models = require('./model');

var Restaurant = models.Restaurant;

router.use('/restaurant',(req, res, next) => {
    try{
        const toNum = ['preference','money'];
        console.log(req.method);
        if(req.method == 'POST') {
            req.body.q = qs.decode(req.body.q);
            for(let k in req.body.q){
                if(toNum.includes(k)) {
                    req.body.q[k] = Number(req.body.q[k]);
                }else if(req.body.q[k] == ''){
                    delete req.body.q[k];
                }
            }            
            for(let k in req.body.c) {
                req.body.c[k] = Number(req.body.c[k]);
            }
        }
        if(req.method == 'GET'){
            req.query.q = qs.decode(req.query.q);
            for(let k in req.query.q){
                console.log(k);
                if(toNum.includes(k)) {
                    req.query.q[k] = Number(req.query.q[k]);
                }else if(req.query.q[k] == ''){
                    delete req.query.q[k];
                }
            }
            for(let k in req.query.c) {
                req.query.c[k] = Number(req.query.c[k]);
            }
        }
    }catch(error) {
        console.error(error);
        res.sendStatus(503);
    }
    console.log(`after parse\nbody: `);
    console.log(req.body);
    console.log(`query: `);
    console.log(req.query);
    next();
});

router.get('/restaurant/infos',(req, res) => {
    res.json({
        regions:Restaurant.schema.obj.region.enum,
        weathers:Restaurant.schema.obj.weather.enum
    });
});

router.route('/restaurant/name/:name')
    .get((req, res) => {
        let name = req.params.name;
        Restaurant.findOne({name:name})
            .lean()
            .exec((err, doc) => {
                if(err) {
                    console.error(err);
                    return res.sendStatus(503);
                }
                return res.send(doc);
            });
    })
    .put((req, res) => {
        let name = req.params.name;
        Restaurant.findOne({name:name})
            .exec((err, doc) => {
                if(err) {
                    console.error(err);
                    return res.sendStatus(503);
                }
                if(doc === null) {
                    return res.sendStatus(404);
                }
                let restaurant = req.body.restaurant
                for(let key in restaurant) {
                    doc[key] = restaurant[key];
                } 
                console.log(doc);
                doc.save((err, saved) => {
                    if(err) {
                        console.error(err);
                        return res.sendStatus(406);
                    }
                    res.status(200);
                    res.send(saved);
                });
            });
    });
router.route('/restaurant')
    .get((req, res) => {
        var num = req.query.c.n || 10;
        var skip = req.query.c.skip || 0;
        // Restaurant.find().skip(skip).limit(num)
        if(req.query.q['weather'] == '都可') {
            req.query.q['weather'] = {$ne:'Null'};
        }
        if(req.query.q['region'] == '都可') {
            req.query.q['region'] = {$ne:'Null'};
        }
        var query = {
            region:req.query.q.region,
            weather:req.query.q.weather,
            preference:{$gte:req.query.q.preference},
            money:{$lte:req.query.q.money}
        }
        console.log('#####Query#####')
        console.log(query);
        console.log({skip:skip, limit:num});
        Restaurant.find(query).skip(skip).limit(num)
            .exec((err, docs) => {
                if(err) {
                    console.error(err);
                    return res.sendStatus(503);
                }
                return res.send(docs);xss       
            });
    })
    .post((req, res) => {
        var query = req.body.q;
        console.log(query);
        Restaurant.create(
            query
            ,(err, created) => {
            if (err) {
                console.log('Jizz');
                console.error(err);
                return res.sendStatus(406);
            }
            return res.sendStatus(200);
        });
    })

module.exports = {
    api:router
}