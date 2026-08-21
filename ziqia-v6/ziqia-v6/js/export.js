/* ============================================================
   export.js — 导入 / 导出 JSON & DOC
   ============================================================ */

// ========== 导出 JSON ==========
function exportJSON(){
  const blob = new Blob([JSON.stringify(DATA, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `自洽系统_${todayStr()}_v${DATA.version}.json`;
  a.click();
  flashTip('📤 已导出JSON');
}

// ========== 导入 ==========
function importData(e){
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const d = JSON.parse(ev.target.result);
      DATA = Object.assign(loadData(), d);
      saveData(); renderAll(); flashTip('📥 导入成功');
    }catch(err){ alert('导入失败：文件格式错误'); }
  };
  reader.readAsText(f);
  e.target.value = '';
}

// ========== 导出 DOC ==========
function exportDOC(){
  const opts = ['仪表盘','日报','周报','月报','年报','所有'];
  const pick = prompt('导出哪些内容？\n输入数字：\n1=仪表盘 2=日报 3=周报 4=月报 5=年报 6=所有', '6');
  const choice = parseInt(pick)||6;
  let html = `<h1>自洽系统 v${DATA.version} 导出报告</h1><p>角色：${DATA.charName} | 导出时间：${todayStr()} ${nowTime()}</p>`;
  if(choice===1 || choice===6) html += '<h2>📊 仪表盘</h2>' + dashboardToHTML();
  if(choice===2 || choice===6) html += '<h2>📅 日报</h2>' + dailyToHTML();
  if(choice===3 || choice===6) html += '<h2>📋 周报</h2>' + reportToHTML('week');
  if(choice===4 || choice===6) html += '<h2>📋 月报</h2>' + reportToHTML('month');
  if(choice===5 || choice===6) html += '<h2>📋 年报</h2>' + reportToHTML('year');
  const docHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>自洽系统导出</title></head><body>${html}</body></html>`;
  const blob = new Blob(['\ufeff'+docHtml], {type:'application/msword'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `自洽系统_导出_${todayStr()}.doc`;
  a.click();
  flashTip('📄 已导出DOC');
}
function genReportDOC(){
  const t = document.getElementById('repType').value;
  const y = parseInt(document.getElementById('repYear').value);
  const mSel = document.getElementById('repMonth');
  let html = `<h1>自洽系统 ${t==='week'?'周报':t==='month'?`${y}年${mSel.value}月月报`:`${y}年报`}</h1>`;
  html += reportToHTML(t);
  const docHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>报告</title></head><body>${html}</body></html>`;
  const blob = new Blob(['\ufeff'+docHtml], {type:'application/msword'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `自洽系统_${t}_${todayStr()}.doc`;
  a.click();
  flashTip('📄 已导出DOC');
}

// ========== 转 HTML 辅助 ==========
function dashboardToHTML(){
  let h = '<h3>根基栏</h3>';
  for(const k of ['body','mind','view','char']){ const r=DATA.roots[k]; h+=`<p><b>${r.name}</b>：${r.val.toFixed(1)} | ${getLevel(r.val).label}</p>`; }
  h+='<h3>半可控输入</h3><p>'; for(const k in DATA.inputs) h+=`${DATA.inputs[k].name}=${DATA.inputs[k].val.toFixed(1)} `; h+='</p>';
  h+='<h3>可主动操作</h3><p>'; for(const k in DATA.actions) h+=`${DATA.actions[k].name}=${DATA.actions[k].val.toFixed(1)}(Lv.${DATA.actions[k].lv}) `; h+='</p>';
  const p = calcAllPalaces(); h+='<h3>十二宫</h3><p>'; for(const k in DATA.palaces) h+=`${DATA.palaces[k].name}=${p[k].toFixed(0)} `; h+='</p>';
  return h;
}
function dailyToHTML(){
  const targetDate = window._dailyDate||todayStr();
  const logs = getDayLogs(targetDate);
  let h = `<p>日期：${targetDate}</p>`;
  h+=`<p>吃饭：🌅${DATA.meals.breakfast?'✅':'❌'} ☀️${DATA.meals.lunch?'✅':'❌'} 🌙${DATA.meals.dinner?'✅':'❌'}</p>`;
  h+=`<p>记录 ${logs.length} 条：</p><ul>`;
  for(const l of logs){ const t = l.startTime?(l.endTime?`${l.startTime}~${l.endTime}`:l.startTime):(l.time||''); h+=`<li>${t} ${l.desc||''}</li>`; }
  h+='</ul>';
  return h;
}
function reportToHTML(type){
  const y = new Date().getFullYear();
  let start, end, title;
  if(type==='week'){ start=new Date(Date.now()-6*86400000).toISOString().slice(0,10); end=todayStr(); title='周报'; }
  else if(type==='month'){ const m=parseInt(document.getElementById('repMonth').value)||new Date().getMonth()+1; const r=getMonthRange(y,m); start=r.start; end=r.end; title=`${y}年${m}月月报`; }
  else { const r=getYearRange(y); start=r.start; end=r.end; title=`${y}年报`; }
  const stat=statRootChange(start,end); const act=statActionCount(start,end); const top=statTopEvents(start,end,5);
  let h=`<p>${title}（${start}~${end}）</p>`;
  h+=`<p>身体${stat.body>=0?'+':''}${stat.body.toFixed(1)} | 心态${stat.mind>=0?'+':''}${stat.mind.toFixed(1)} | 三观${stat.view>=0?'+':''}${stat.view.toFixed(1)} | 人品${stat.char>=0?'+':''}${stat.char.toFixed(1)}</p>`;
  h+=`<p>记录总数：${stat.count}</p>`;
  if(top.length){ h+='<p><b>高频事件</b></p><ul>'; for(const [d,c] of top) h+=`<li>${d}（${c}次）</li>`; h+='</ul>'; }
  const plogs = DATA.paramLog.filter(l=>l.date>=start && l.date<end);
  if(plogs.length){ h+='<p><b>操作项记录</b>（点击查看详情）</p><ul>'; for(const l of plogs.slice(0,30)){ const nm=DATA.inputs[l.paramKey]?DATA.inputs[l.paramKey].name:(DATA.actions[l.paramKey]?DATA.actions[l.paramKey].name:l.paramKey); h+=`<li>${l.date} ${l.time||''} ${nm}：${l.desc}（${l.delta>=0?'+':''}${l.delta}）</li>`; } h+='</ul>'; }
  const ups = DATA.levelLog.filter(l=>l.date>=start && l.date<end);
  if(ups.length){ h+='<p><b>升级记录</b></p><ul>'; for(const u of ups){ const nm = u.type==='root'?(DATA.roots[u.key]||{}).name||u.key:u.type==='skill'?(DATA.skills.find(s=>s.id===u.key)||{}).name||u.key:(DATA.actions[u.key]||{}).name||u.key; h+=`<li>${nm} Lv.${u.fromLv}→Lv.${u.toLv}</li>`; } h+='</ul>'; }
  const cLog = DATA.createLog.filter(l=>l.date>=start && l.date<end);
  if(cLog.length){ h+='<p><b>创造模式改动</b></p><ul>'; for(const c of cLog.slice(0,10)) h+=`<li>${c.desc}${c.date?'（'+c.date+'）':''}</li>`; h+='</ul>'; }
  return h;
}

// ========== 重置 ==========
function resetAll(){
  if(!confirm('确定重置所有数据？此操作不可恢复！')) return;
  if(!confirm('再次确认：清空一切回到默认？')) return;
  localStorage.removeItem(STORAGE_KEY);
  DATA = getDefaults();
  saveData(); renderAll(); flashTip('🔄 已重置');
}
