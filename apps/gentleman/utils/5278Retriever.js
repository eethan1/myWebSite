var request = require('request-promise');
var cheerio = require('cheerio');
var got = require('got');
var fs = require('fs');
var spawn = require('child_process').spawn;
const m3u8stream = require('m3u8stream');
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const BaseUrl = 'http://www.5278.cc'
//'proxy':'http://localhost:8080', 
var getPlayerUrl = async function (index) {
    return new Promise(resolve=>{
        const j = request.jar();
        var sess = request.defaults({jar:j});
        let url = `${BaseUrl}/thread-${index}-1-3.html`;
        console.log(url);
        sess.get({
            url: url, 
            headers :{
                    'User-Agent':'Mozilla/5.0 (X11; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0',
                    'Cookie':'agree18=yes;'
            
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
                let c = $('#allmyplayer')[0].attribs.src;
                if(c === undefined) {
                    resolve('Failed');
                }
                resolve(c);
            }).catch((err) => {
                console.log(err);
                resolve('Failed');
            });
    });
}
var getm3u8Url = async function (playerUrl) {
    const j = request.jar();
    var sess = request.defaults({jar:j});
    let body = await sess.get({
            url: playerUrl, 
            headers :{
                'User-Agent':'Mozilla/5.0 (X11; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0',
                'Referer':'http://www.5278.cc/',
            },
            strictSSL: false,
        })
    if (!body) {
        console.log('Err');
        console.log(err);
        return;
    }
    c = body.match(/http.*\.m3u8/)[0];
    return new Promise((resolve)=>{
        if(c === undefined) {
            resolve('Failed');
        }else{
            resolve(c);
        }
    });
}
var getFileStream = async function(url){
    console.log(`Get Plyaer: ${url}`);
    let playerurl = await getPlayerUrl(url);
    console.log(`Get m3u8: ${playerurl}`);
    let m3u8Url =  await getm3u8Url(playerurl);
    console.log(`Streaming ${m3u8Url}`);
    let s = m3u8stream(m3u8Url);
    return new Promise(resolv=>{
        resolv(s);
    });
}

var getm3u8Stream = async function (url) {
    let res = await got(url, {headers:{
        Referer: 'https://5278.cc' 
    }});
    let m3u8url = res.body.match(/'http.*m3u8.*'/)[0].slice(1,-1);
    return m3u8stream(m3u8url);
} 


module.exports = {
    getPlayerUrl:getPlayerUrl,
    getm3u8Url:getm3u8Url,
    getFileStream:getFileStream,
    getm3u8Stream:getm3u8Stream
}