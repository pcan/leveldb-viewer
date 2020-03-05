# leveldb-viewer

A simple, minimalistic, web-based LevelDB viewer for Node.js. 

## Usage

```javascript
const { createViewerServer } = require('leveldb-viewer');

const db = levelup(encode(leveldown('/path/to/db'), { keyEncoding: 'buffer', valueEncoding: 'json' }));
 
const server = createViewerServer(db); // This returns a Node.JS HttpServer.

server.listen(9090); // you may invoke listen...

server.close() // ...and close.
```