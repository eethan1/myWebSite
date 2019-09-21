const fs = require('fs');
const apiList = require(__dirname+'/config').apiList;

console.log('apiLoader: check api list');

var loadApi = function(app) {
    console.log('ApiLoader Loading...');
    apiList.forEach(api => {
        console.log(`${__dirname}/${api}`);
        try{
            fs.accessSync(`${__dirname}/${api}`, fs.constants.F_OK)
            var api = require(`${__dirname}/${api}`).api;
            app.use('/api', api);
        }catch (e) {
            console.error(e);
            process.exit();
        } 
    });
    console.log('ApiLoader loading Success.');
}

module.exports = loadApi