# leveldb-viewer

A simple, minimalistic, web-based LevelDB viewer for Node.js. 

## Usage

Install the module with `npm i --save leveldb-viewer`. The following snippet shows the sample usage:
```javascript
const { createViewerServer } = require('leveldb-viewer');
const db = levelup(encode(leveldown('/path/to/db'), { keyEncoding: 'buffer', valueEncoding: 'json' })); 
const server = createViewerServer(db); // This returns a Node.JS HttpServer.
server.listen(9090); // you may invoke listen...
server.close() // ...and close.
```
Once you started the server with `server.listen(9090)` open the browser at `http://localhost:9090`. You should be able to explore the contents of your LevelDB instance using a tree view.
The webpage uses a minimal API to retrieve data:
- `GET /api/query` retrieves the keys (or their common prefixes) using `root` param to specify the desired prefix and `limit` to limit the number of records. The response returns an array of objects having this format: `{val: string, count: number}`. The `val` field is the prefix (or the whole key) and `count` is the number of records having that prefix.
- `GET /api/value` retrieves the value (as JSON object) having the specified `key` param.
