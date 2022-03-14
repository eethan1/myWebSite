var request = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs');
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const BaseUrl = 'https://91avv8.com/'
//'proxy':'http://localhost:8080', 
var getFileUrl = async function (index) {
    const j = request.jar();
    var sess = request.defaults({jar:j});
    let url = `${BaseUrl}video/${index}/`;
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
        let c = $('#veoplayer > source')[0].attribs.src;
        if(c === undefined) {
            return 'Failed';
        }
        return c;
    }).catch((err) => {
        console.log(err);
    });
    // sess.cookie()
    // var res = sess.post()
}

module.exports = {
    getFileUrl:getFileUrl
}