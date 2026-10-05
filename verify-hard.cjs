const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const data = require('./questions.js');
const source = fs.readFileSync('app.js','utf8');
const original = {module:{exports:{}}};
vm.runInNewContext(execFileSync('git',['show','HEAD:questions.js'],{encoding:'utf8'}),original);
assert.equal(JSON.stringify(data.QUESTIONS),JSON.stringify(original.module.exports.QUESTIONS),'通常100問とIDを保持');
assert.equal(data.HARD_QUESTIONS.length,30);
assert.equal(data.ALL_QUESTIONS.length,130);
assert.equal(new Set(data.ALL_QUESTIONS.map(q=>q.id)).size,130);
assert.equal(new Set(data.ALL_QUESTIONS.map(q=>q.text)).size,130);
for(const q of data.HARD_QUESTIONS){
  assert.equal(q.choices.length,4);
  assert.equal(new Set(q.choices).size,4);
  assert.ok(q.choices.includes(q.answer));
  assert.ok(data.CATEGORIES[q.category]);
  for(const key of q.sources||[q.source])assert.ok(data.SOURCES[key]);
}
const elements = {};
const saved = {plays:7,best:9,learned:[1,50,100,101,130,130,131,'101'],seen:[100,101,130],ruby:false,sound:false};
const sandbox = {
  ...data,STORAGE_KEY:'tamagawa-quest-v2',
  DEFAULT_RECORD:{plays:0,best:0,hardPlays:0,hardBest:0,learned:[],seen:[],ruby:true,sound:false},
  localStorage:{getItem:()=>JSON.stringify(saved)},
  app:{innerHTML:''},document:{querySelector:key=>elements[key]||=( {})},
  stopSpeech(){},scrollTop(){},renderQuestion(){},saveRecord(){},focusHeading(){},playSound(){},celebrate(){},home(){},
  r:text=>text,reviewRow:()=>''
};
vm.createContext(sandbox);
const functions = source.split('\n').filter(line=>/^function (loadRecord|learnedCount|shuffle|startGame|finishGame)\(/.test(line)).join('\n');
vm.runInContext(functions,sandbox);
sandbox.record = sandbox.loadRecord();
assert.deepEqual(JSON.parse(JSON.stringify(sandbox.record.learned)),[1,50,100,101,130]);
assert.equal(sandbox.record.best,9);
assert.equal(sandbox.record.hardBest,0);
assert.equal(sandbox.learnedCount(data.QUESTIONS),3);
assert.equal(sandbox.learnedCount(data.HARD_QUESTIONS),2);
const normalSeen = new Set(),hardSeen = new Set();
for(let i=0;i<500;i++)for(const mode of ['normal','hard']){
  sandbox.startGame(mode);
  const bank = mode==='hard'?hardSeen:normalSeen;
  assert.equal(sandbox.state.session.length,10);
  assert.equal(new Set(sandbox.state.session.map(q=>q.id)).size,10);
  for(const q of sandbox.state.session){
    assert.equal(q.options.length,mode==='hard'?4:3);
    assert.ok(mode==='hard'?q.id>100:q.id<=100);
    bank.add(q.id);
  }
}
assert.equal(normalSeen.size,100);
assert.equal(hardSeen.size,30);
sandbox.startGame('hard');
sandbox.state.answers=sandbox.state.session.map((question,i)=>({question,correct:i<6,selected:i<6?question.answer:question.choices[1]}));
sandbox.finishGame();
assert.equal(sandbox.record.best,9);
assert.equal(sandbox.record.plays,7);
assert.equal(sandbox.record.hardBest,6);
assert.equal(sandbox.record.hardPlays,1);
assert.ok(sandbox.app.innerHTML.includes('6 / 10'));
elements['#retry'].onclick();
assert.equal(sandbox.state.difficulty,'hard');
assert.equal(sandbox.state.session.length,4);
assert.ok(sandbox.state.session.every(q=>q.id>100&&q.options.length===4));
sandbox.state.answers=sandbox.state.session.map(question=>({question,correct:true,selected:question.answer}));
sandbox.finishGame();
assert.equal(sandbox.record.hardPlays,1,'復習で冒険回数を更新しない');
assert.equal(sandbox.record.hardBest,6,'復習で最高記録を更新しない');
elements['#again'].onclick();
assert.equal(sandbox.state.mode,'hard','再挑戦でもハードを維持');
sandbox.startGame();
sandbox.state.answers=sandbox.state.session.map((question,i)=>({question,correct:i<2,selected:i<2?question.answer:question.choices[1]}));
sandbox.finishGame();
assert.equal(sandbox.record.hardBest,6);
assert.equal(sandbox.record.hardPlays,1);
assert.equal(sandbox.record.plays,8);
console.log('PASS: 通常100問の保持、専用30問・4択、抽選1000回、旧記録の移行、モード別記録、復習と再挑戦');
