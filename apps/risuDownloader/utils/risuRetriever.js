var request = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs');
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const BaseUrl = 'https://risu.io/'
var getFileUrl = async function (hash,password) {
    const j = request.jar();
    var sess = request.defaults({'proxy':'http://localhost:8080', jar:j});
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
            let pos = body.file_infos[0].file_path;
            return pos;
        })
        return a;
    }).catch((err) => {
        console.log(err);
    });
    // sess.cookie()
    // var res = sess.post()
}
getFileUrl('/t8a','0201').then((pos)=>{
    console.log(pos);
})
module.exports = {
    getFileUrl:getFileUrl
}