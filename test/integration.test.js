require('mocha');
const chai = require('chai');
const path = require('path');
const leveldown = require('leveldown');
const encode = require('encoding-down');
const levelup = require('levelup');
const http = require('http');
const { promisify } = require('util');
const createViewerServer = require('..').createViewerServer;

chai.should();

describe('Integration tests', () => {
    
    const dbPath = path.join(__dirname, '../temp/test_data');
       
    
    it('should work with Buffer key encoding', async () => {        
        const db = levelup(encode(leveldown(dbPath), { keyEncoding: 'buffer', valueEncoding: 'json' }));
        const server = createViewerServer(db);
        await promisify(server.listen.bind(server))(); // new Promise((res, rej) => server.listen(e => e ? rej(e) : res()));
        const address = server.address();
        await db.batch([
            {key: "abc:000:3756",  value: {v:1}, type: 'put'},
            {key: "abc:000:5867",  value: {v:2}, type: 'put'}
        ]);
        const response = await httpGet(`http://localhost:${address.port}/api/query?root=`);
        JSON.parse(response.body).should.be.deep.equal([{val:"abc:000:",count:2}]);
        await promisify(server.close.bind(server))();
    });
    
    /*let db, encoding, server, listen, close;
    
    function init() { 
        levelup(encode(leveldown(dbPath), encoding));
        server = createViewerServer(db);
        listen = promisify(server.listen.bind(server));
    };
    
    beforeEach(async () => {
        encoding = { keyEncoding: 'string', valueEncoding: 'json' };
        await db.open();
        init();
        
    });*/
});


http.get[promisify.custom] = (options) => {
    return new Promise((resolve, reject) => 
        http.get(options, (response) => (response
            .on('data', (chunk) => response.body += chunk)
            .on('end', () => resolve(response))
            .body = '')
        ).on('error', reject));
};

const httpGet = promisify(http.get);