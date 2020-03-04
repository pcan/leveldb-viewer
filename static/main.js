
const typeTree = document.getElementsByClassName('key-tree')[0];
const valueView = document.getElementsByClassName('value-view')[0];
const darkThemeBtn = document.getElementById('dark-theme-btn');
//createList(stream, document.getElementsByClassName('key-tree')[0]);

createList(typeTree).catch(console.error);

darkThemeBtn.addEventListener("click", (event) => {
    document.body.classList.toggle('dark-theme');
    if(document.body.classList.contains('dark-theme')) {
        darkThemeBtn.innerHTML = 'Dark Theme ON';
    } else {
        darkThemeBtn.innerHTML = 'Dark Theme OFF';
    }
});

async function createList(parent, prefix = "") {
    
    const roots = await request("GET", "/api/query?root=" + prefix); //findRoots(items, prefix)
        
    const ul = document.createElement("ul");
    roots
        .map(i => createListElement(i))
        .forEach(e => ul.appendChild(e));
    
    parent.appendChild(ul);

}

function createListElement(item) {
    
    const li = document.createElement("li");
    const span = document.createElement("span")
    span.innerHTML = item.val;
    span.classList.add(item.count > 1 ? 'node' : 'leaf');
    
    if(item.count > 1) {
        const countSpan = document.createElement("span");
        countSpan.classList.add('node-count');
        countSpan.innerHTML = ' (' + item.count + ')';
        span.appendChild(countSpan);
    }
    
    li.appendChild(span);
    
    let open = false;
    span.addEventListener("click", (event) => {     
        if(item.count > 1) { // has children
             if(!open) {
                open = true;
                createList(li, item.val).catch(console.error);
            } else {
                open = false;
                li.getElementsByTagName('ul')[0].remove();
            }
        } else { // leaf
            readValue(item.val).catch(console.error);
        }
    });
    
    return li;
}

async function readValue(key) {
    const body = await request("GET", "/api/value?key=" + key);
    valueView.innerHTML = syntaxHighlight(JSON.stringify(body,null,4));
}


function request(method, path) {
    return new Promise((res, rej) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4) {
                const isJson = this.getResponseHeader("Content-Type") === 'application/json';
                const obj = isJson ? JSON.parse(this.responseText) : this.responseText;
                (this.status / 100 == 2) ? res(obj) : rej(obj);
            }            
        };        
        xhttp.open(method, path);
        xhttp.send();        
    });         
}

/*
* credits: https://stackoverflow.com/a/3515761
*/
function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
