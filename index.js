const http = require('http');
const url = require('url');
const fs = require('fs');

var file = new nodeStatic.Server('./static');

http.createServer(function (request, response) {
    
    if(request.url.indexOf('/api') === 0) {
        api(request, response).catch(console.error);
    } else {
        serveStaticContent(request, response);
    }
       
}).listen(8080);

function serveStaticContent(req, res) {
    if(req.url === '/' || req.url === '') {
        req.url = '/index.html';
    }    
    switch(req.url) {
        case '/index.html':        
        case '/style.css':
        case '/main.js':
            fs.readFile(__dirname + '/static' + req.url, (err,data) => {
                res.end(data);
            });
            break;
        default:
            res.statusCode = 404;
            res.end();
    }
}



async function api(req, res) {
    const end = (v) => res.end(JSON.stringify(v));
    res.setHeader('Content-Type', 'application/json');
    try {
        const reqUrl = url.parse(req.url, /* parseQueryString: */ true);
        if(req.method === 'GET') {
            switch(reqUrl.pathname) {
                case '/api/query':                    
                    end(await query(reqUrl));
                    break;
                case '/api/value':
                    end(await retrieveValue(reqUrl));
                    break;
            }
        } 
    } catch(e) {
        res.statusCode = 500;
        throw e;
    } finally {
        end({});
    }
}

async function query(reqUrl) {
    const q = reqUrl.query || {};
    
    if (typeof q.root === 'string') {
        return findRoots(stream, q.root);
    } 
    return reqUrl.query;
}

async function retrieveValue(reqUrl) {
    const q = reqUrl.query || {};
    if(q.key) {
        return {abc:[{def: 44,ababa:'ababa'}], fdf:true,abcsd:null};
    }
}

const stream = [
    "abc:000:3756",
    "abc:000:5867",
    "abc:001:8436",
    "abc:001:5656",
    "bcd:023:6436",
    "bcd:024:4755",
    "bcd:024:6977",
    "bcd:025:2745",
    "bcd:026:1634",
    "bcde:026:6264",
    "bcde:027:6264",
    "wxyz:013:4761",
];

//console.log(findRoots(stream, "abc:00"));

function findRoots(stream, root = "") {
    if(stream.length == 0) {
        return [];
    }
        
    stream = stream.filter(s => s.indexOf(root) === 0); // in levelDb, filtered by stream input params
    
    const roots = [{ val: stream[0], count : 1}];
    let commonRoot = roots[0]; 
    const start = root.length;

    for (let i = 1; i < stream.length; i++) {
        const idx = commonRadixIndex(commonRoot.val, stream[i], start);
        if (idx > start) {
            commonRoot.val = commonRoot.val.substring(0, idx + 1);
            commonRoot.count++;
        } else {
            commonRoot = { val: stream[i], count : 1};
            roots.push(commonRoot);
        }
    }
    
    return roots;
}

function commonRadixIndex(a, b, start) {
    let i = start;
    for(; i < a.length && i < b.length && a[i] === b[i]; i++);
    return i - 1;
}



