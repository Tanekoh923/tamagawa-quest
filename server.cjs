const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
 const name=pathname==='/'?'index.html':pathname.slice(1);
 const allowed=new Set(['index.html','たまがわクエスト.html','style.css','app.js','questions.js']);
 if(!allowed.has(name)){res.writeHead(404);return res.end('Not found');}
 fs.readFile(path.join(root,name),(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(name)]||'text/plain','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);});
});
server.listen(4173,'127.0.0.1',()=>console.log('Tamagawa Quest: http://127.0.0.1:4173'));
server.on('error',err=>{console.error(err.message);process.exitCode=1;});
