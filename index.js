const http = require('http');
const url = require('url');
const fs = require('fs');
const stream = require('stream');

module.exports = { createViewerServer }


function createViewerServer(db) {
    
    const server = http.createServer(function (request, response) {
    
        if(request.url.indexOf('/api') === 0) {
            api(request, response, db).catch(console.error);
        } else {
            serveStaticContent(request, response);
        }
           
    });
    
    
    return server;
    
}


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



async function api(req, res, db) {
    res.setHeader('Content-Type', 'application/json');
    try {
        const reqUrl = url.parse(req.url, /* parseQueryString: */ true);
        if(req.method === 'GET') {
            switch(reqUrl.pathname) {
                case '/api/query':                    
                    await query(reqUrl, res, db);
                    break;
                case '/api/value':
                    await retrieveValue(reqUrl, res, db);
                    break;
                default:
                    res.statusCode = 404;
                    res.end();
            }
        } 
    } catch(e) {
        res.statusCode = 500;
        res.end();
        throw e;
    }
}

async function query(reqUrl, res, db) {
    const q = reqUrl.query || {};
    if (typeof q.root === 'string') {
        const limit = parseInt( typeof q.limit === 'string' ? q.limit : -1, 10);
        db.createKeyStream({gte: q.root, limit: isFinite(limit) ? limit : -1 })
                .pipe(new stream.Transform(filterByRoot(q.root)))
                .pipe(new stream.Transform(jsonArrayTransform))
                .pipe(res);
        
    } else {
        res.end();
    }    
}


async function retrieveValue(reqUrl, res, db) {
    const q = reqUrl.query || {};
    if(q.key) {
        try {
            res.end(JSON.stringify(await db.get(q.key)));
        } catch(e) {
            console.log(e);
            res.statusCode = 404;
            res.end();
        }
    }
}


function filterByRoot(root = "") {
    
    let commonRoot;
    const start = root.length;
    
    return {
        objectMode: true,
        transform(chunk, _encoding, next) {
            if(!commonRoot) { // first item always accepted
                commonRoot = {val: chunk, count: 1};
                //next(null, commonRoot);
                next();
                //console.log('accepted', chunk)
            } else {
                const idx = commonRadixIndex(commonRoot.val, chunk, start);
                if (idx > start) { // same group                    
                    commonRoot.val = commonRoot.val.slice(0, idx + 1);
                    commonRoot.count++;
                    //console.log('rejected', chunk)
                    next(); // chunk filtered out, it's a child
                } else { // new group detected                    
                    next(null, commonRoot); // send previous group
                    commonRoot = { val: chunk, count : 1};
                    //console.log('accepted', chunk)
                }
            }            
        },
        flush(done) {
            done(null, commonRoot); // send last
        }
    };
    
}




function commonRadixIndex(a, b, start) {
    let i = start;
    for(; i < a.length && i < b.length && a[i] === b[i]; i++);
    return i - 1;
}



const jsonArrayTransform = {
    objectMode: true,
    transform(chunk, _encoding, next) {
        if (!this.started) {
            this.started = true;
            this.push('[' /* '[\n'*/);
            this.push(JSON.stringify(chunk));
        } else {
            this.push(',' /* ',\n'*/)
            this.push(JSON.stringify(chunk));
        }
        next();
    },
    flush(done) {
        if (!this.started) {
            this.push('[' /* '[\n'*/);
        }
        this.push(']' /* '\n]'*/);
        done();
    }
};




























/*
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

function findRoots(db, root = "") {
    
    let commonRoot;
    
 
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
*/


