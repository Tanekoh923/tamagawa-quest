const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
let html=read('index.html');
html=html.replace('<link rel="stylesheet" href="style.css">',`<style>${read('style.css').replace(/^@charset[^;]+;/,'')}</style>`);
html=html.replace('<script src="questions.js" defer></script><script src="app.js" defer></script>','');
html=html.replace('</body>',`<script>\n${read('questions.js')}\n${read('app.js')}\n</script>\n</body>`);
fs.writeFileSync(path.join(__dirname,'たまがわクエスト.html'),html,'utf8');
console.log('作成しました：たまがわクエスト.html（単独で遊べる版）');
