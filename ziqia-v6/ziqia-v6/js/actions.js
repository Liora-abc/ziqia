/* ============================================================
   actions.js — 用户交互：记录/快捷/操作项/技能/吃饭/衰减/升级/庆祝
   ============================================================ */

// ========== 提交手动记录 ==========
function submitRecord(){
  const recDate = document.getElementById('recDate') ? (document.getElementById('recDate').value || todayStr()) : todayStr();
  const startT = document.getElementById('recStartTime').value || '';
  const endT = document.getElementById('recEndTime').value || '';
  const desc = document.getElementById('recDesc').value || '（未填写描述）';
  const deltas = {
    body: parseFloat(document.getElementById('recBody').value)||0,
    mind: parseFloat(document.getElementById('recMind').value)||0,
    view: parseFloat(document.getElementById('recView').value)||0,
    char: parseFloat(document.getElementById('recChar').value)||0,
  };
  const before = applyDeltas(deltas);
  DATA.log.push({
    id:Date.now(), date:recDate, time:nowTime(),
    startTime:startT, endTime:endT,
    timeTag: startT?`${startT}${endT?'~'+endT:''}`:'无标签',
    desc, deltas, source:'manual'
  });
  const ups = checkRootLevelUp(before, {body:DATA.roots.body.val,mind:DATA.roots.mind.val,view:DATA.roots.view.val,char:DATA.roots.char.val});
  saveData(); renderAll();
  if(ups.length) for(const u of ups) celebrate(u);
  flashTip('✅ 已记录：'+desc);
  if(document.getElementById('recDesc')) document.getElementById('recDesc').value='';
}

// ========== 快捷操作点击 ==========
function clickQuick(qid, btnEl){
  const q = DATA.quickActions.find(x=>x.id===qid);
  if(!q) return;
  const before = applyDeltas(q.deltas||{});
  DATA.log.push({
    id:Date.now(), date:recDate, time:nowTime(),
    startTime:q.startTime||'', endTime:q.endTime||'',
    timeTag:q.startTime?`${q.startTime}${q.endTime?'~'+q.endTime:''}`:(q.timeTag||q.label),
    desc:q.label, deltas:q.deltas, source:'quick', actionKey:q.actionKey
  });
  let ups = [];
  if(q.actionKey && DATA.actions[q.actionKey]){
    const a = DATA.actions[q.actionKey];
    a.val = Math.max(0, a.val + 1);
    const xpUps = addActionXP(q.actionKey, 5);
    if(xpUps) ups = ups.concat(xpUps);
  }
  const rootUps = checkRootLevelUp(before, {body:DATA.roots.body.val,mind:DATA.roots.mind.val,view:DATA.roots.view.val,char:DATA.roots.char.val});
  ups = ups.concat(rootUps);
  saveData();
  // 视觉反馈：按钮缩放+变色+文字提示
  if(btnEl){
    btnEl.classList.add('clicked');
    setTimeout(()=>{ btnEl.classList.remove('clicked'); }, 400);
  }
  renderTopbar();
  flashTip('✅ '+q.label);
  if(ups.length) for(const u of ups) celebrate(u);
}

// ========== 半可控输入记录 ==========
function submitParam(key){
  const desc = document.getElementById(key+'_desc').value || '（未填写）';
  const delta = parseFloat(document.getElementById(key+'_delta').value)||0;
  const param = DATA.inputs[key] || DATA.actions[key];
  if(!param) return;
  const before = param.val;
  param.val = Math.max(0, param.val + delta);
  DATA.paramLog.push({ id:Date.now(), date:todayStr(), time:nowTime(), paramKey:key, desc, delta, valBefore:before, valAfter:param.val });
  const lvBefore = getLevel(before).lv;
  const lvAfter = getLevel(param.val).lv;
  let ups = [];
  if(lvAfter > lvBefore){
    ups.push({ type:'action', key, fromLv:lvBefore, toLv:lvAfter, name:param.name });
    DATA.levelLog.push({ date:todayStr(), time:nowTime(), type:'action', key, fromLv:lvBefore, toLv:lvAfter });
  }
  saveData(); renderAll();
  if(ups.length) for(const u of ups) celebrate(u);
  flashTip(`✅ ${param.name} ${delta>=0?'+':''}${delta}`);
}

// ========== 可主动操作项加XP ==========
function submitActionXP(key){
  const desc = document.getElementById(key+'_desc2').value || '（未填写）';
  const xp = parseFloat(document.getElementById(key+'_xp').value)||0;
  const a = DATA.actions[key];
  if(!a) return;
  const before = a.val;
  a.val = Math.max(0, a.val + xp*0.1);
  DATA.paramLog.push({ id:Date.now(), date:todayStr(), time:nowTime(), paramKey:key, desc, delta:xp*0.1, valBefore:before, valAfter:a.val });
  const ups = addActionXP(key, xp);
  saveData(); renderAll();
  if(ups && ups.length) for(const u of ups) celebrate(u);
  flashTip(`✅ ${a.name} +${xp}XP`);
}

// ========== 技能加XP ==========
function submitSkillXP(){
  const id = document.getElementById('skillSel').value;
  const desc = document.getElementById('skillDesc').value || '技能练习';
  const xp = parseFloat(document.getElementById('skillXP').value)||0;
  const s = DATA.skills.find(x=>x.id===id);
  if(!s) return;
  s.val = (s.val||0) + xp*0.1;
  DATA.skillLog.push({ id:Date.now(), date:todayStr(), time:nowTime(), skillId:id, desc, xp });
  const ups = addSkillXP(id, xp);
  saveData(); renderAll();
  if(ups && ups.length) for(const u of ups) celebrate(u);
  flashTip(`✅ ${s.name} +${xp}XP`);
}

// ========== 吃饭切换 ==========
function toggleMeal(meal, btn){
  DATA.meals[meal] = !DATA.meals[meal];
  const now = DATA.meals[meal];
  const icon = meal==='breakfast'?'🌅':meal==='lunch'?'☀️':'🌙';
  const label = meal==='breakfast'?'早餐':meal==='lunch'?'午餐':'晚餐';
  if(btn){
    btn.textContent = `${icon} ${label} ${now?'✅':'❌'}}`;
    btn.className = 'meal-btn ' + (now?'on':'off');
  }
  if(!now){
    const before = { body:DATA.roots.body.val, mind:DATA.roots.mind.val };
    DATA.roots.body.val = Math.max(0, DATA.roots.body.val - 0.5);
    DATA.roots.mind.val = Math.max(0, DATA.roots.mind.val - 0.25);
    DATA.log.push({ id:Date.now(), date:todayStr(), time:nowTime(), startTime:'', endTime:'', timeTag:'吃饭', desc:`没吃${label}`, deltas:{body:-0.5,mind:-0.25,view:0,char:0}, source:'meal' });
    const ups = checkRootLevelUp(before, {body:DATA.roots.body.val,mind:DATA.roots.mind.val,view:DATA.roots.view.val,char:DATA.roots.char.val});
    saveData(); renderAll();
    if(ups.length) for(const u of ups) celebrate(u);
  } else {
    saveData(); renderAll();
  }
}

// ========== 每日衰减 ==========
function decayDailyWrap(){
  const before = decayDaily();
  const ups = checkRootLevelUp(before, {body:DATA.roots.body.val,mind:DATA.roots.mind.val,view:DATA.roots.view.val,char:DATA.roots.char.val});
  renderAll();
  flashTip('🌙 已应用每日衰减');
  if(ups.length) for(const u of ups) celebrate(u);
}

// ========== 版本+1 ==========
function bumpVersion(){
  DATA.versionCount++;
  const parts = DATA.version.split('.');
  parts[1] = parseInt(parts[1])+1;
  DATA.version = parts.join('.');
  DATA.log.push({ id:Date.now(), date:todayStr(), time:nowTime(), startTime:'', endTime:'', timeTag:'系统', desc:`版本升级到 v${DATA.version}`, deltas:{}, source:'system' });
  saveData(); renderAll();
  flashTip('⬆️ 版本 '+DATA.version);
}

// ========== 庆祝弹窗 + 礼花 ==========
function celebrate(up){
  const cat = up.type==='root' ? up.key : (up.type==='skill' ? 'skill' : 'action');
  const pool = (DATA.praise[cat] || DATA.praise.action);
  const text = pool[(up.toLv-1) % pool.length] || '升级啦！🎉';
  const emojiMap = { body:'💪', mind:'🧘', view:'🧠', char:'🌟', skill:'🌳', action:'⚡' };
  const emoji = up.type==='root' ? (emojiMap[up.key]||'🎉') : up.type==='skill' ? '🌳' : '⚡';
  const customName = up.type==='root' ? getLevelName('root',up.key,up.toLv) :
                    up.type==='action' ? getLevelName('action',up.key,up.toLv) : '';
  const nameStr = customName ? `${up.name}（${customName}）` : up.name;
  document.getElementById('celebrateBody').innerHTML = `
    <div class="emoji">${emoji}</div>
    <div class="title">${nameStr} 升级！Lv.${up.fromLv} → Lv.${up.toLv}</div>
    <div class="text">${text}</div>
    <button class="btn btn-primary" style="margin-top:16px" onclick="closeCelebrate()">好 的</button>`;
  document.getElementById('celebrateModal').classList.add('open');
  launchConfetti();
  DATA.levelLog.push({ date:todayStr(), time:nowTime(), type:up.type, key:up.key, fromLv:up.fromLv, toLv:up.toLv });
  saveData();
}
function closeCelebrate(){ document.getElementById('celebrateModal').classList.remove('open'); }

// ========== 礼花特效 ==========
function launchConfetti(){
  const colors = ['#f43f5e','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];
  for(let i=0;i<80;i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.cssText = `left:${Math.random()*100}vw;top:-20px;width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;background:${colors[i%colors.length]};border-radius:${Math.random()>0.5?'50%':'2px'}`;
    document.body.appendChild(c);
    const x = (Math.random()-0.5)*400, y = window.innerHeight+60, rot = Math.random()*1080;
    const dur = 1500+Math.random()*2500;
    c.animate([{transform:'translate(0,0) rotate(0)', opacity:1},{transform:`translate(${x}px,${y}px) rotate(${rot}deg)`, opacity:0}],{duration:dur,easing:'cubic-bezier(.25,.46,.45,.94)'});
    setTimeout(()=>c.remove(), dur+100);
  }
}

// ========== 提示条 ==========
function flashTip(msg){
  let el = document.getElementById('flashTip');
  if(!el){ el = document.createElement('div'); el.id='flashTip'; document.body.appendChild(el); }
  el.textContent = msg; el.style.opacity='1';
  setTimeout(()=>{ el.style.opacity='0'; }, 1800);
}

// ========== 操作项展开/收起 ==========
function toggleOpDetail(id, btn){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.toggle('open');
  if(btn) btn.textContent = el.classList.contains('open') ? '▼ 收起' : '▶ 展开';
  if(el.classList.contains('open')){
    const logId = id+'_log';
    const logEl = document.getElementById(logId);
    if(logEl){
      const key = id.replace('inp_','').replace('act_','');
      const logs = DATA.paramLog.filter(l=>l.paramKey===key).slice(-10).reverse();
      if(logs.length===0){ logEl.innerHTML = '<div style="color:var(--text-sub);font-size:11px">暂无记录</div>'; }
      else {
        logEl.innerHTML = logs.map(l=>`<div class="or-item"><span class="or-date">${l.date} ${l.time||''}</span><span class="or-desc">${l.desc}</span><span class="or-delta ${l.delta>=0?'pos':'neg'}">${l.delta>=0?'+':''}${l.delta}</span></div>`).join('');
      }
    }
  }
}

// ========== 报告生成 ==========
function onRepTypeChange(){
  const t = document.getElementById('repType').value;
  document.getElementById('repMonth').style.display = (t==='week')?'none':(t==='year'?'none':'inline-block');
  document.getElementById('repYear').style.display = 'inline-block';
}
function genReport(){
  const t = document.getElementById('repType').value;
  const y = parseInt(document.getElementById('repYear').value);
  const mSel = document.getElementById('repMonth');
  let out = '';
  if(t==='week') out = genWeekReport(y);
  else if(t==='month') out = genMonthReport(y, parseInt(mSel.value));
  else out = genYearReport(y);
  document.getElementById('reportOut').innerHTML = out;
}
function genWeekReport(y){
  const end = todayStr();
  const start = new Date(Date.now()-6*86400000).toISOString().slice(0,10);
  return buildReportHTML(start, end, '周报', y);
}
function genMonthReport(y, m){
  const r = getMonthRange(y, m);
  DATA._monthRepCount = (DATA._monthRepCount||0)+1;
  saveData();
  return buildReportHTML(r.start, r.end, `${y}年${m}月月报`, y);
}
function genYearReport(y){
  const r = getYearRange(y);
  return buildReportHTML(r.start, r.end, `${y}年报`, y);
}
function buildReportHTML(start, end, title, year){
  const stat = statRootChange(start, end);
  const actStat = statActionCount(start, end);
  const actChange = statActionChange(start, end);
  const actTop = statActionTopDelta(start, end, 5);
  const top = statTopEvents(start, end, 5);
  const net = {body:stat.body, mind:stat.mind, view:stat.view, char:stat.char};
  // 最高/最低根基
  const rootArr = [['身体',net.body],['心态',net.mind],['三观',net.view],['人品',net.char]];
  rootArr.sort((a,b)=>b[1]-a[1]);
  const highRoot = rootArr[0], lowRoot = rootArr[rootArr.length-1];
  // 操作项最高/最低（按净变化绝对值）
  const actArr = Object.entries(actStat).map(([k,v])=>[DATA.actions[k]?DATA.actions[k].name:k, v, actChange[k]?actChange[k].delta:0]);
  actArr.sort((a,b)=>Math.abs(b[2])-Math.abs(a[2]));
  const highAct = actArr[0], lowAct = actArr[actArr.length-1];
  // 十二宫最高/最低
  const palaces = calcAllPalaces();
  const palArr = Object.entries(palaces).map(([k,v])=>[DATA.palaces[k].name, v]);
  palArr.sort((a,b)=>b[1]-a[1]);
  const highPal = palArr[0], lowPal = palArr[palArr.length-1];
  // 升级记录
  const ups = DATA.levelLog.filter(l=>l.date>=start && l.date<end);
  // 成就解锁
  const ach = DATA.achievements.filter(a=>a.unlocked && a.unlockDate>=start && a.unlockDate<end);
  // 创造模式改动
  const cLog = DATA.createLog.filter(l=>l.date>=start && l.date<end);

  const isEmpty = stat.count===0;
  let html = `<h4 style="color:var(--primary);margin-top:10px">${title}（${start} ~ ${end}）</h4>`;
  if(isEmpty){
    html += `<div style="background:#fef3c7;padding:10px;border-radius:8px;margin:8px 0">
      ⚠️ 这段时间没有任何记录。每日衰减已生效：身体 -${(DATA.decay.body*7).toFixed(1)}/周，心态 -${(DATA.decay.mind*7).toFixed(1)}/周。快去记录吧！
    </div>`;
  }
  html += `<div class="report-summary">
    <div class="report-item"><div class="label">身体变化</div><div class="value ${net.body>=0?'up':'down'}">${net.body>=0?'+':''}${net.body.toFixed(1)}</div></div>
    <div class="report-item"><div class="label">心态变化</div><div class="value ${net.mind>=0?'up':'down'}">${net.mind>=0?'+':''}${net.mind.toFixed(1)}</div></div>
    <div class="report-item"><div class="label">三观变化</div><div class="value ${net.view>=0?'up':'down'}">${net.view>=0?'+':''}${net.view.toFixed(1)}</div></div>
    <div class="report-item"><div class="label">人品变化</div><div class="value ${net.char>=0?'up':'down'}">${net.char>=0?'+':''}${net.char.toFixed(1)}</div></div>
  </div>`;
  html += `<div style="margin-top:10px;font-size:13px;line-height:1.9">
    📊 <b>最高根基</b>：${highRoot[0]}（${highRoot[1]>=0?'+':''}${highRoot[1].toFixed(1)}）&nbsp;&nbsp;
    📉 <b>最低根基</b>：${lowRoot[0]}（${lowRoot[1]>=0?'+':''}${lowRoot[1].toFixed(1)}）<br>
    ⚡ <b>最高操作项</b>：${highAct?highAct[0]+'（'+highAct[1]+'次，净变化'+(highAct[2]>=0?'+':'')+highAct[2].toFixed(1)+'）':'无数据'}<br>
    ⚡ <b>最低操作项</b>：${lowAct?lowAct[0]+'（'+lowAct[1]+'次，净变化'+(lowAct[2]>=0?'+':'')+lowAct[2].toFixed(1)+'）':'无数据'}<br>
    🔮 <b>最高宫位</b>：${highPal[0]}（${highPal[1].toFixed(0)}）&nbsp;&nbsp;
    🔮 <b>最低宫位</b>：${lowPal[0]}（${lowPal[1].toFixed(0)}）<br>
  </div>`;
  if(top.length){ html += `<div class="report-section"><h5>🔥 高频事件TOP5</h5>${top.map(([d,c])=>`· ${d}（${c}次）`).join('<br>')}</div>`; }
  if(actTop.length){ html += `<div class="report-section" style="border-left-color:#3b82f6"><h5>⚡ 操作项加分TOP5</h5>${actTop.map(([n,c,d])=>`· ${n}：${d>=0?'+':''}${d.toFixed(1)}（${c}次）`).join('<br>')}</div>`; }
  if(ups.length){ html += `<div class="report-section" style="border-left-color:#8b5cf6"><h5>⬆️ 升级记录</h5>${ups.map(u=>{ const nm = u.type==='root'?(DATA.roots[u.key]?DATA.roots[u.key].name:u.key):u.type==='skill'?(DATA.skills.find(s=>s.id===u.key)||{}).name||u.key:(DATA.actions[u.key]?DATA.actions[u.key].name:u.key); return `· ${nm} Lv.${u.fromLv}→Lv.${u.toLv}`; }).join('<br>')}</div>`; }
  if(ach.length){ html += `<div class="report-section" style="border-left-color:#10b981"><h5>🏆 解锁成就</h5>${ach.map(a=>`· ${a.icon} ${a.name}`).join('<br>')}</div>`; }
  if(cLog.length){ html += `<div class="report-section" style="border-left-color:#f59e0b"><h5>🔧 创造模式改动 ${cLog.length} 次</h5>${cLog.slice(0,8).map(c=>`· ${c.desc}${c.date?'（'+c.date+'）':''}`).join('<br>')}${cLog.length>8?'<br>· ...等':''}</div>`; }
  // 操作项详细记录（折叠）
  const allParamLogs = DATA.paramLog.filter(l=>l.date>=start && l.date<end);
  if(allParamLogs.length){
    html += `<details class="report-section" style="border-left-color:#6366f1"><summary><h5 style="display:inline">📝 操作项详细记录（${allParamLogs.length}条）点击查看详情</h5></summary>`;
    const sorted = allParamLogs.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||'').localeCompare(a.time||''));
    html += `<div class="op-record-log" style="max-height:300px">`;
    for(const l of sorted.slice(0,50)){
      const nm = DATA.inputs[l.paramKey]?DATA.inputs[l.paramKey].name:(DATA.actions[l.paramKey]?DATA.actions[l.paramKey].name:l.paramKey);
      html += `<div class="or-item"><span class="or-date">${l.date} ${l.time||''}</span><span class="or-desc">${nm}：${l.desc}</span><span class="or-delta ${l.delta>=0?'pos':'neg'}">${l.delta>=0?'+':''}${l.delta}</span></div>`;
    }
    html += `</div></details>`;
  }
  // 趋势图
  html += `<canvas id="repChart" height="120" style="margin-top:12px"></canvas>`;
  // 系统建议
  const tips = [];
  if(net.body<0) tips.push('身体下降，建议优先执行养生操作');
  if(net.mind<0) tips.push('心态下滑，建议增加放空/散步时间');
  if(net.view>2) tips.push('三观在成长，继续保持读书习惯');
  if(tips.length){ html += `<div style="margin-top:10px;padding:8px;background:#ecfdf5;border-radius:8px;font-size:13px"><b>💡 系统建议</b><br>${tips.join('<br>')}</div>`; }
  setTimeout(()=>drawChart(start, end), 100);
  return html;
}

// ========== 十二宫图表 ==========
function drawPalaceChart(){
  const t = document.getElementById('chartType').value;
  const y = parseInt(document.getElementById('chartYear').value);
  const m = parseInt(document.getElementById('chartMonth').value)||1;
  let labels = [], datasets = [];
  if(t==='month'){
    for(let i=5;i>=0;i--){
      const d = new Date(y, m-1-i, 1);
      labels.push(`${d.getFullYear()}年${d.getMonth()+1}月`);
    }
  } else {
    labels = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  }
  const palaceKeys = Object.keys(DATA.palaces);
  // 内宫暖色、外宫冷色
  // 六内宫：6种暖色（红/橙/黄/深红/棕红/橙红）
  const innerColors = ['#ef4444','#f97316','#eab308','#dc2626','#b45309','#ea580c'];
  // 六外宫：6种冷色（蓝/靛/紫/青/深紫蓝/粉紫）
  const outerColors = ['#3b82f6','#6366f1','#8b5cf6','#0891b2','#3730a3','#ec4899'];  let iIdx=0, oIdx=0;
  const palaces = calcAllPalaces();
  for(const k of palaceKeys){
    const group = (PALACE_GROUP && PALACE_GROUP[k]==='inner') ? 'inner' : 'outer';    let color;
    if(group==='inner'){ color = innerColors[iIdx%innerColors.length]; iIdx++; }
    else { color = outerColors[oIdx%outerColors.length]; oIdx++; }
    datasets.push({
      label: DATA.palaces[k].name,
      data: labels.map(()=>palaces[k]),
      borderColor: color,
      backgroundColor: color+'22',
      fill: false, tension: 0.3, borderWidth: 2.5,
    });
  }
  const ctx = document.getElementById('palaceChart');
  if(!ctx) return;
  if(window._palaceChart) window._palaceChart.destroy();
  window._palaceChart = new Chart(ctx, {
    type:'line', data:{labels,datasets},
    options:{
      responsive:true,
      plugins:{legend:{position:'bottom',labels:{font:{size:11}}}},
      scales:{
        y:{
          title:{display:true,text:'宫位得分'},
          // Y轴稀疏：每60一个刻度
          ticks:{stepSize:60, font:{size:11}},
          grid:{color:'#f3f4f6'}
        },
        x:{grid:{display:false}}
      }
    }
  });
}

function drawChart(start, end){
  const logs = DATA.log.filter(l=>l.date>=start && l.date<=end && l.source!=='decay');
  const days = {};
  for(const l of logs){ if(!days[l.date]) days[l.date]={body:0,mind:0,view:0,char:0}; for(const k in days[l.date]) days[l.date][k]+=(l.deltas[k]||0); }
  const labels = Object.keys(days).sort();
  const datasets = [
    {label:'身体',data:labels.map(d=>days[d].body.toFixed(1)),borderColor:'#ef4444',backgroundColor:'#fecaca',fill:false,tension:0.3},
    {label:'心态',data:labels.map(d=>days[d].mind.toFixed(1)),borderColor:'#f59e0b',backgroundColor:'#fde68a',fill:false,tension:0.3},
    {label:'三观',data:labels.map(d=>days[d].view.toFixed(1)),borderColor:'#3b82f6',backgroundColor:'#bfdbfe',fill:false,tension:0.3},
    {label:'人品',data:labels.map(d=>days[d].char.toFixed(1)),borderColor:'#10b981',backgroundColor:'#a7f3d0',fill:false,tension:0.3},
  ];
  const ctx = document.getElementById('repChart');
  if(!ctx) return;
  if(window._repChart) window._repChart.destroy();
  window._repChart = new Chart(ctx, { type:'line', data:{labels,datasets}, options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{y:{title:{display:true,text:'净变化'}}}}});
}

// ========== 初始化报告选择器 ==========
function initReportSelects(){
  const ySel = document.getElementById('repYear');
  const mSel = document.getElementById('repMonth');
  const cyChart = document.getElementById('chartYear');
  const cmChart = document.getElementById('chartMonth');
  if(!ySel || !mSel) return;
  const cy = new Date().getFullYear();
  // 报告年份：2026年到2100年（自由选择）
  ySel.innerHTML = ''; mSel.innerHTML = '';
  for(let y=2026; y<=2100; y++){ const o=document.createElement('option'); o.value=y; o.textContent=y+'年'; if(y===cy) o.selected=true; ySel.appendChild(o); }
  for(let m=1;m<=12;m++){ const o=document.createElement('option'); o.value=m; o.textContent=m+'月'; if(m===new Date().getMonth()+1) o.selected=true; mSel.appendChild(o); }
  // 图表选择器
  if(cyChart){
    cyChart.innerHTML=''; cmChart.innerHTML='';
    for(let y=cy-10; y<=cy; y++){ const o=document.createElement('option'); o.value=y; o.textContent=y+'年'; if(y===cy) o.selected=true; cyChart.appendChild(o); }
    for(let m=1;m<=12;m++){ const o=document.createElement('option'); o.value=m; o.textContent=m+'月'; cmChart.appendChild(o); }
  }
  onRepTypeChange();
}
