var request = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs');
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const BaseUrl = 'https://risu.io/'
//'proxy':'http://localhost:8080', 

var getFileInfo = async function(hash, password) {
    const j = request.jar();
    let sess = request.defaults({jar:j});
    let url = BaseUrl+hash;
    return sess.get({
        url: url, 
        headers :{
                'User-Agent':'Mozilla/5.0 (X11; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0'
        },
        strictSSL: false,
        })
        .then( (body) => {
        if (!body) {
            console.log('Err');
            console.log(err);
            return;
        }
        // console.log(body);
        const $ = cheerio.load(body);
        let c = $('meta[name=csrf-token]')[0].attribs.content;
        console.log('token:'+c);
        console.log(j.getCookies(url));
        return c;
    }).then((csrftoken) => {
        var a = sess.post({
            url: url+'/confirm.json',
            headers :{
                'User-Agent':'Mozilla/5.0 (X11; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0',   
                'X-CSRF-Token': csrftoken,
                'Content-Type': 'application/json;charset=utf-8',
            },
            json:true,
            body: {
                password: password
            },  
            strictSSL: false,
        }).then( (body) => {
            if(!body.file_infos) {
                return 'Failed';
            }
            return body;
        })
        return a;
    }).catch((err) => {
        console.log(err);
    });
}

var getFileUrl = async function (hash,password) {
    let body = await getFileInfo(hash, password);
    if(body === 'failed') {
        return 'failed';
    }
    return body.file_infos[0].file_path;
}



var getFileElement = async function(hash, password) {
    let body = await getFileInfo(hash, password);
    if(body === 'failed') {
        return 'failed';
    }
    let pos = body.file_infos[0].file_path;
    if(/http/.exec(pos)) {
        return `<a href=${pos} rel=noreferrer>Be a Gentleman</a>`;
    }else{
        return `<img src="${pos}" name="${body.file_infos[0].filename}" >Be a Gentleman</img>`;

    }
}
module.exports = {
    getFileUrl:getFileUrl,
    getFileInfo,getFileInfo,
    getFileElement:getFileElement,
}