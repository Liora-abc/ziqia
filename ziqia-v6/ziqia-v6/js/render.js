/* ============================================================
   render.js — 所有页面的渲染函数
   ============================================================ */

// ========== 应用主题色 ==========
function applyTheme(){
  const t = DATA.theme;
  document.documentElement.style.setProperty('--primary', t.primary);
  document.documentElement.style.setProperty('--primary-light', t.primaryLight);
  document.documentElement.style.setProperty('--primary-bg', t.primaryBg);
  document.documentElement.style.setProperty('--bar-fill', t.barFill);
  document.documentElement.style.setProperty('--bar-bg', t.barBg);
  document.documentElement.style.setProperty('--highlight', t.highlight);
  document.documentElement.style.setProperty('--highlight-text', t.highlightText);
  document.documentElement.style.setProperty('--bg', t.bg);
  document.documentElement.style.setProperty('--card', t.card);
  const tb = document.getElementById('topbar');
  if(tb) tb.style.background = t.primary;
  const aw = document.getElementById('avatarWrap');
  if(aw){
    aw.classList.remove('size40','size90','size100');
    if(DATA.avatar.size>=100) aw.classList.add('size100');
    else if(DATA.avatar.size>=90) aw.classList.add('size90');
    else aw.classList.add('size40');
  }
  const img = document.getElementById('avatarImg');
  if(img){
    if(DATA.avatar.dataUrl){ img.src=DATA.avatar.dataUrl; img.style.display='block'; }
    else { img.style.display='none'; }
  }
}

// ========== 渲染：顶部信息 ==========
function renderTopbar(){
  document.getElementById('charName').textContent = DATA.charName || '';
  document.getElementById('versionTag').textContent = 'v'+DATA.version;
}

// ========== 渲染：根基进度条 ==========
function renderRootBar(rootKey){
  const r = DATA.roots[rootKey];
  const lv = getLevel(r.val);
  const pct = Math.min(100, (r.val % 100));
  const customName = getLevelName('root', rootKey, lv.lv);
  const nameStr = customName ? `${customName}` : `Lv.${lv.lv}`;
  return `
    <div class="bar-row">
      <div class="bar-label"><span>${r.name} <span class="lv">${nameStr}</span></span><span>${r.val.toFixed(1)}</span></div>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div style="font-size:11px;color:var(--text-sub)">${lv.emoji} ${lv.label} | ${r.desc}</div>
    </div>`;
}

// ========== 渲染：仪表盘 ==========
function renderDashboard(){
  let html = `<div class="card"><h3>🏗️ 根基栏</h3>`;
  for(const k of ['body','mind','view','char']) html += renderRootBar(k);
  html += `</div>`;

  // 半可控输入（紧凑两栏）
  html += `<div class="card"><h3>📥 半可控输入</h3><div class="params-compact">`;
  for(const k in DATA.inputs){
    const p = DATA.inputs[k];
    const lv = getLevel(p.val);
    html += `<div class="param-row"><span class="pname">${p.name}</span><span class="pval">${p.val.toFixed(1)} <small style="color:${lv.color}">${lv.emoji}${lv.label}</small></span></div>`;
  }
  html += `</div></div>`;

  // 可主动操作（紧凑两栏）
  html += `<div class="card"><h3>⚡ 可主动操作</h3><div class="params-compact">`;
  for(const k in DATA.actions){
    const a = DATA.actions[k];
    const lv = getLevel(a.val);
    html += `<div class="param-row"><span class="pname">${a.name} <small style="color:var(--text-sub)">Lv.${a.lv}</small></span><span class="pval" style="color:${lv.color}">${a.val.toFixed(1)} ${lv.emoji}</span></div>`;
  }
  html += `</div></div>`;

 // 十二宫（紧凑网格，统一底色，文字颜色跟分数段）
  const palaces = calcAllPalaces();
  html += `<div class="card"><h3>🔮 十二宫读数</h3><div class="palace-grid">`;
  for(const k in DATA.palaces){
    const p = DATA.palaces[k];
    const v = palaces[k];
    const tier = getPalaceTier(v);
    const group = (DATA.palaceGroup&&DATA.palaceGroup[k]==='inner') ? 'inner' : 'outer';
    html += `<div class="palace-cell ${group}" style="background:var(--card-bg);border-left:3px solid var(--primary)">
      <div class="pn">${p.name}</div>
      <div class="pv" style="color:${tier.color}">${v.toFixed(0)}</div>
      <div class="pd">${tier.emoji}${tier.label}</div>      </div>`;
  }
  html += `</div></div>`;

  return html;
}

// ========== 渲染：记录页 ==========
function renderRecord(){
  let html = `<div class="card"><h3>✏️ 添加记录</h3>
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
      <label style="margin:0;white-space:nowrap;font-weight:600">📅 日期</label>
      <input type="date" id="recDate" value="${new Date().toISOString().slice(0,10)}" style="padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--card-bg);color:var(--text);font-size:14px">
    </div>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
      <label style="margin:0;white-space:nowrap">时间段</label>
      <input type="time" id="recStartTime" value="08:00" style="width:120px">
      <span style="color:var(--text-sub)">至</span>
      <input type="time" id="recEndTime" value="09:00" style="width:120px">
    </div>
    <label>做了什么（描述）</label>
    <textarea id="recDesc" placeholder="例：读了30分钟书" rows="2"></textarea>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px">
      <div><label>身体</label><input type="number" id="recBody" step="0.1" value="0"></div>
      <div><label>心态</label><input type="number" id="recMind" step="0.1" value="0"></div>
      <div><label>三观</label><input type="number" id="recView" step="0.1" value="0"></div>
      <div><label>人品</label><input type="number" id="recChar" step="0.1" value="0"></div>
    </div>
    <button class="btn btn-primary" style="margin-top:10px;width:100%" onclick="submitRecord()">✅ 确认记录</button>
  </div>`;

  // 快捷操作（漂亮网格）
  html += `<div class="card"><h3>⚡ 快捷操作</h3><div class="quick-grid">`;
  for(const q of DATA.quickActions){
    const d = q.deltas||{};
    const parts = [];
    if(d.body) parts.push(`<span class="${d.body>0?'tag-pos':'tag-neg'}">身${d.body>0?'+':''}${d.body}</span>`);
    if(d.mind) parts.push(`<span class="${d.mind>0?'tag-pos':'tag-neg'}">心${d.mind>0?'+':''}${d.mind}</span>`);
    if(d.view) parts.push(`<span class="${d.view>0?'tag-pos':'tag-neg'}">观${d.view>0?'+':''}${d.view}</span>`);
    if(d.char) parts.push(`<span class="${d.char>0?'tag-pos':'tag-neg'}">品${d.char>0?'+':''}${d.char}</span>`);
    const timeStr = (q.startTime||'') + (q.endTime?'~'+q.endTime:'');
    html += `<button class="btn-action" onclick="clickQuick('${q.id}',this)">
      <span class="qa-label">${q.label}</span>
      <span class="qa-time">${timeStr}</span>
      <span class="qa-deltas">${parts.join('')||'—'}</span>
    </button>`;
  }
  html += `</div></div>`;

  // 吃饭记录（一行）
  html += `<div class="card"><h3>🍽️ 吃饭记录</h3>
    <div class="meal-row">
      <button class="meal-btn ${DATA.meals.breakfast?'on':'off'}" id="btnBrk" onclick="toggleMeal('breakfast',this)">🌅早餐 ${DATA.meals.breakfast?'✅':'❌'}</button>
      <button class="meal-btn ${DATA.meals.lunch?'on':'off'}" id="btnLun" onclick="toggleMeal('lunch',this)">☀️午餐 ${DATA.meals.lunch?'✅':'❌'}</button>
      <button class="meal-btn ${DATA.meals.dinner?'on':'off'}" id="btnDin" onclick="toggleMeal('dinner',this)">🌙晚餐 ${DATA.meals.dinner?'✅':'❌'}</button>
    </div></div>`;

  return html;
}

// ========== 渲染：操作项页 ==========
function renderOperations(){
  let html = `<div class="card"><h3>📥 半可控输入</h3>
    <p style="font-size:12px;color:var(--text-sub);margin-bottom:8px">展开后记录发生了什么、变化值多少。所有改动会出现在日报/周报/月报/年报中。</p>`;
  for(const k in DATA.inputs){
    const p = DATA.inputs[k];
    const lv = getLevel(p.val);
    html += `<div class="op-item">
      <span class="name">${p.name} <span class="lv-badge">${lv.emoji} ${lv.label}</span></span>
      <span class="val">${p.val.toFixed(1)} — ${p.desc}</span>
      <span class="arrow" onclick="toggleOpDetail('inp_${k}',this)">▶ 展开</span>
    </div>
    <div class="op-detail" id="inp_${k}">
      <label>发生了什么？</label>
      <input type="text" id="${k}_desc" placeholder="描述这次变化">
      <label>变化值（可负）</label>
      <input type="number" id="${k}_delta" step="0.1" value="0">
      <button class="btn btn-primary" style="margin-top:6px" onclick="submitParam('${k}')">✅ 记录</button>
      <div class="op-record-log" id="${k}_log"></div>
    </div>`;
  }
  html += `</div>`;

  html += `<div class="card"><h3>⚡ 可主动操作</h3>
    <p style="font-size:12px;color:var(--text-sub);margin-bottom:8px">每次操作都会记录到日志。XP满自动升级，升级时触发庆祝。</p>`;
  for(const k in DATA.actions){
    const a = DATA.actions[k];
    const lv = getLevel(a.val);
    html += `<div class="op-item">
      <span class="name">${a.name} <span class="lv-badge">Lv.${a.lv}</span></span>
      <span class="val" style="color:${lv.color}">${a.val.toFixed(1)} | XP ${a.xp}/${a.xpNext}</span>
      <span class="arrow" onclick="toggleOpDetail('act_${k}',this)">▶ 展开</span>
    </div>
    <div class="op-detail" id="act_${k}">
      <label>做了什么？</label>
      <input type="text" id="${k}_desc2" placeholder="描述这次操作">
      <label>获得XP</label>
      <input type="number" id="${k}_xp" step="0.1" value="5">
      <button class="btn btn-primary" style="margin-top:6px" onclick="submitActionXP('${k}')">✅ 记录并加XP</button>
      <div class="op-record-log" id="${k}_log2"></div>
    </div>`;
  }
  html += `</div>`;

  // 十力计算公式说明
  html += `<div class="card"><h3>📐 十力计算公式说明</h3>
    <div style="font-size:12px;line-height:1.8;color:#374151">
      <p style="margin-bottom:6px"><b>半可控输入（命/运/风水/名/相）</b>：代表你被动接收的影响源。数值由创造模式设定或手动调整。它们通过<b>权重</b>影响十二宫的计算。</p>
      <p style="margin-bottom:6px"><b>可主动操作（积阴德/读书/敬神/交贵人/养生）</b>：代表你可以主动做的事。每次执行获得XP，XP满升级后触发效果：</p>
      <div class="formula-card">
        <div class="fc-item"><span class="fc-name">积阴德升级</span><span class="fc-arrow">→</span><span class="fc-eff">人品 +2</span></div>
        <div class="fc-item"><span class="fc-name">读书升级</span><span class="fc-arrow">→</span><span class="fc-eff">三观 +2</span></div>
        <div class="fc-item"><span class="fc-name">敬神升级</span><span class="fc-arrow">→</span><span class="fc-eff">心态 +2</span></div>
        <div class="fc-item"><span class="fc-name">交贵人升级</span><span class="fc-arrow">→</span><span class="fc-eff">人品 +1、心态 +1</span></div>
        <div class="fc-item"><span class="fc-name">养生升级</span><span class="fc-arrow">→</span><span class="fc-eff">身体 +2</span></div>
      </div>
      <p style="margin-top:8px"><b>十二宫公式</b>：每个宫位 = Σ(根基栏×权重) + Σ(命途参数×权重)。权重可在创造模式→十二宫中修改。</p>
      <p><b>操作项升级</b>：每满100自动升1级。每次执行操作项+1数值+5XP。等级越高，XP需求越大（每次×1.3）。</p>
    </div>
  </div>`;

  return html;
}

// ========== 渲染：十二宫页 ==========
function renderPalace(){
  const palaces = calcAllPalaces();
  // 详细读数（内宫/外宫颜色区分）
  let html = `<div class="card"><h3>🔮 十二宫详细读数</h3>
    <p style="font-size:11px;color:var(--text-sub);margin-bottom:8px">
      <span style="color:#f59e0b">■</span> 内宫（命/财/官/福）
      <span style="color:#3b82f6;margin-left:12px">■</span> 外宫（疾/夫/交/迁/田/父/子/兄）
    </p>
    <div class="palace-detail-grid">`;
  for(const k in DATA.palaces){
    const p = DATA.palaces[k];
    const v = palaces[k];
    const tier = getPalaceTier(v);
    const customName = getLevelName('palace', k, tier.lv);
    const nameStr = customName ? `${customName}` : `Lv.${tier.lv}`;
    const group = (DATA.palaceGroup&&DATA.palaceGroup[k]==='inner') ? 'inner' : 'outer';
    const w = p.weights;
    const formulaParts = [];
    for(const wk in w){
      let nm = wk;
      if(DATA.roots[wk]) nm = DATA.roots[wk].name;
      else if(DATA.inputs[wk]) nm = DATA.inputs[wk].name;
      else if(DATA.actions[wk]) nm = DATA.actions[wk].name;
      formulaParts.push(`${nm}×${w[wk]}`);
    }
    html += `<div class="palace-detail-cell ${group}" style="background:#fefce8;border-color:${tier.color}">
      <div class="pn">${p.name} <small style="color:${tier.color}">${nameStr}</small></div>
      <div style="font-size:20px;font-weight:bold;color:${tier.color}">${v.toFixed(1)} <small style="font-size:12px">${tier.emoji}${tier.label}</small></div>
      <div class="pdesc">${p.desc}</div>
      <div class="formula">${formulaParts.join(' + ')}</div>
    </div>`;
  }
  html += `</div></div>`;

  // 图表（加大、Y轴稀疏）
  html += `<div class="card"><h3>📊 十二宫图表</h3>
    <div style="display:flex;gap:10px;margin-bottom:8px;align-items:center;flex-wrap:wrap">
      <select id="chartType">
        <option value="month">月度对比（近6个月）</option>
        <option value="year">年度对比（12个月）</option>
      </select>
      <select id="chartYear"></select>
      <select id="chartMonth"></select>
      <button class="btn btn-primary" onclick="drawPalaceChart()">📊 生成图表</button>
    </div>
    <div class="chart-container"><canvas id="palaceChart"></canvas></div>
  </div>`;

  return html;
}

// ========== 渲染：日报 ==========
function renderDaily(){
  const today = todayStr();
  const targetDate = (window._dailyDate)||today;
  DATA.log.forEach(l => { if(!l.date) l.date = today; });
  const logs = getDayLogs(targetDate);
  const paramLogs = DATA.paramLog.filter(l=>l.date===targetDate);
  const mealLogs = DATA.log.filter(l=>l.date===targetDate && l.source==='meal');

  const net = {body:0,mind:0,view:0,char:0};
  for(const l of logs){ if(l.deltas) for(const k in net) net[k]+=(l.deltas[k]||0); }

  // 日期选择
  let html = `<div class="card">
    <h3>📅 日报</h3>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
      <label style="margin:0">查看日期</label>
      <input type="date" id="dailyDate" value="${targetDate}" onchange="window._dailyDate=this.value;renderAll()" style="width:auto;flex:0">
      <span style="font-size:12px;color:var(--text-sub)">| 共 ${logs.length} 条记录</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px">
      <div class="report-item"><div class="label">身体</div><div class="value ${net.body>=0?'up':'down'}">${net.body>=0?'+':''}${net.body.toFixed(1)}</div><div style="font-size:11px;color:var(--text-sub)">当前 ${DATA.roots.body.val.toFixed(1)}</div></div>
      <div class="report-item"><div class="label">心态</div><div class="value ${net.mind>=0?'up':'down'}">${net.mind>=0?'+':''}${net.mind.toFixed(1)}</div><div style="font-size:11px;color:var(--text-sub)">当前 ${DATA.roots.mind.val.toFixed(1)}</div></div>
      <div class="report-item"><div class="label">三观</div><div class="value ${net.view>=0?'up':'down'}">${net.view>=0?'+':''}${net.view.toFixed(1)}</div><div style="font-size:11px;color:var(--text-sub)">当前 ${DATA.roots.view.val.toFixed(1)}</div></div>
      <div class="report-item"><div class="label">人品</div><div class="value ${net.char>=0?'up':'down'}">${net.char>=0?'+':''}${net.char.toFixed(1)}</div><div style="font-size:11px;color:var(--text-sub)">当前 ${DATA.roots.char.val.toFixed(1)}</div></div>
    </div>
    <div style="font-size:13px;margin-bottom:6px">
      🍽️ 吃饭：${DATA.meals.breakfast?'🌅✅':'🌅❌'} ${DATA.meals.lunch?'☀️✅':'☀️❌'} ${DATA.meals.dinner?'🌙✅':'🌙❌'}
    </div>
  </div>`;

  // 一天时间轴（按 startTime 排序）
  html += `<div class="card"><h3>🕐 一天时间轴</h3>
    <p style="font-size:12px;color:var(--text-sub);margin-bottom:8px">按记录的时间段从早到晚排列。</p>
    <div class="day-timeline">`;

  // 按 startTime 排序（时间字符串比较即可）
  const sortedLogs = [...logs].sort((a,b)=>{
    const sa = a.startTime||a.time||'99:99';
    const sb = b.startTime||b.time||'99:99';
    return sa.localeCompare(sb);
  });

  if(sortedLogs.length===0){
    html += `<div style="text-align:center;color:var(--text-sub);padding:20px">— 今日暂无记录 —</div>`;
  }

  for(const l of sortedLogs){
    const d = l.deltas || {};
    const timeStr = l.startTime ? (l.endTime ? `${l.startTime}~${l.endTime}` : l.startTime) : (l.time||'');
    const scoreParts = [];
    if(d.body) scoreParts.push(`<span class="${d.body>0?'pos':'neg'}">身${d.body>0?'+':''}${d.body}</span>`);
    if(d.mind) scoreParts.push(`<span class="${d.mind>0?'pos':'neg'}">心${d.mind>0?'+':''}${d.mind}</span>`);
    if(d.view) scoreParts.push(`<span class="${d.view>0?'pos':'neg'}">观${d.view>0?'+':''}${d.view}</span>`);
    if(d.char) scoreParts.push(`<span class="${d.char>0?'pos':'neg'}">品${d.char>0?'+':''}${d.char}</span>`);
    html += `<div class="timeline-block">
      <div class="tl-time">${timeStr}</div>
      <div class="tl-content">
        <div class="tl-desc">${l.desc||''}</div>
        <div class="tl-scores">${scoreParts.join(' ')||''}</div>
      </div>
    </div>`;
  }

  html += `</div></div>`;

  // 操作项记录
  if(paramLogs.length>0){
    html += `<div class="card"><h3>📝 操作项记录（当日）</h3><div class="op-record-log" style="max-height:300px">`;
    for(const l of paramLogs){
      const nm = DATA.inputs[l.paramKey]?DATA.inputs[l.paramKey].name:(DATA.actions[l.paramKey]?DATA.actions[l.paramKey].name:l.paramKey);
      html += `<div class="or-item">
        <span class="or-date">${l.time||''}</span>
        <span class="or-desc">${nm}：${l.desc}</span>
        <span class="or-delta ${l.delta>=0?'pos':'neg'}">${l.delta>=0?'+':''}${l.delta}</span>
      </div>`;
    }
    html += `</div></div>`;
  }

  return html;
}

// ========== 渲染：报告页 ==========
function renderReport(){
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth()+1;
  let html = `<div class="card">
    <h3>📋 报告</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <select id="repType" onchange="onRepTypeChange()">
        <option value="week">周报</option>
        <option value="month" selected>月报</option>
        <option value="year">年报</option>
      </select>
      <select id="repYear"></select>
      <select id="repMonth"></select>
      <button class="btn btn-primary" onclick="genReport()">📊 生成报告</button>
      <button class="btn btn-ghost" onclick="genReportDOC()">📄 导出DOC</button>
    </div>
    <div id="reportOut"></div>
  </div>`;
  return html;
}

// ========== 渲染：技能树 ==========
function renderSkill(){
  let html = `<div class="card"><h3>🌳 技能树</h3>`;
  for(const s of DATA.skills){
    const pct = Math.min(100, s.xp/s.xpNext*100);
    html += `<div class="skill-item">
      <div class="header">
        <span><b>${s.name}</b> <small style="color:var(--text-sub)">Lv.${s.lv}</small></span>
        <span style="font-size:12px">XP ${s.xp}/${s.xpNext}</span>
      </div>
      <div class="xp-bar"><div class="xp-fill" style="width:${pct}%"></div></div>
      <div style="font-size:12px;color:var(--text-sub);margin-top:2px">${s.desc}</div>
    </div>`;
  }
  html += `</div>`;

  // 技能记录
  html += `<div class="card"><h3>📝 记录技能成长</h3>
    <p style="font-size:12px;color:var(--text-sub);margin-bottom:6px">记录你练了什么、加多少XP。满XP自动升级并触发庆祝。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <select id="skillSel" style="flex:1;min-width:120px">
        ${DATA.skills.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
      <input type="text" id="skillDesc" placeholder="做了什么" style="flex:2;min-width:150px">
      <input type="number" id="skillXP" placeholder="XP" step="0.1" value="5" style="width:80px">
      <button class="btn btn-primary" onclick="submitSkillXP()">✅ 记录</button>
    </div>
  </div>`;

  // 技能日志
  if(DATA.skillLog.length>0){
    html += `<div class="card"><h3>📜 技能记录历史</h3><div class="op-record-log" style="max-height:250px">`;
    const sorted = [...DATA.skillLog].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||'').localeCompare(a.time||''));
    for(const l of sorted.slice(0,30)){
      const sk = DATA.skills.find(s=>s.id===l.skillId);
      html += `<div class="or-item">
        <span class="or-date">${l.date} ${l.time||''}</span>
        <span class="or-desc">${sk?sk.name:'?'}：${l.desc}</span>
        <span class="or-delta pos">+${l.xp}XP</span>
      </div>`;
    }
    html += `</div></div>`;
  }

  return html;
}

// ========== 渲染：关系图谱 ==========
function renderRelation(){
  let html = `<div class="card"><h3>👥 关系图谱</h3>`;
  for(const r of DATA.relations){
    const color = r.intimacy>=70?'#059669':r.intimacy>=40?'#f59e0b':'#dc2626';
    html += `<div class="relation-item">
      <span class="ri-icon">👤</span>
      <span class="ri-name"><b>${r.name}</b> <small style="color:var(--text-sub)">${r.type}</small></span>
      <span class="ri-score" style="color:${color}">${r.intimacy}</span>
      <div class="ri-bar"><div class="ri-bar-fill" style="width:${r.intimacy}%;background:${color}"></div></div>
    </div>`;
  }
  html += `</div>`;
  return html;
}

// ========== 渲染：成就 ==========
function renderAchievement(){
  let html = `<div class="card"><h3>🏆 成就</h3>`;
  for(const a of DATA.achievements){
    html += `<div class="ach-item ${a.unlocked?'unlocked':'locked'}">
      <span class="ach-icon">${a.unlocked?a.icon:'🔒'}</span>
      <div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>
      ${a.unlocked?`<span style="margin-left:auto;font-size:11px;color:#059669">${a.unlockDate||''}</span>`:''}
    </div>`;
  }
  html += `</div>`;
  return html;
}

// ========== 渲染：说明书 ==========
function renderManual(){
  return `<div class="card">
    <h3>📖 用户说明书</h3>
    <div style="font-size:13px;line-height:1.9">
      <h4>一、系统概述</h4>
      <p>自洽系统是一个帮助你记录日常行为、量化自我状态、追踪成长轨迹的个人管理系统。核心理念：<b>可视化隐性规律 → 提供决策依据 → 记录生长轨迹</b>。</p>
      <p>系统分三层：<br>
      <b>① 根基栏</b>（身体/心态/三观/人品）—— 类似RPG属性值，变化最慢，是系统的底层OS。<br>
      <b>② 命途参数</b>（半可控输入 + 可主动操作）—— 影响根基的输入源与可操作项。<br>
      <b>③ 十二宫</b>（紫微斗数投影）—— 把底层数据投射到人生具体场景。</p>

      <h4>二、快速开始</h4>
      <p>① 打开网页 → 仪表盘看当前状态。<br>
      ② 做了什么事 → ✏️记录页 → 选时间段（开始时间~结束时间）→ 填描述 → 填各维度分数 → 确认。<br>
      ③ 懒得填 → 点⚡快捷操作按钮一键记录。<br>
      ④ 没吃饭 → 🍽️吃饭记录里点一下。<br>
      ⑤ 睡前 → 📅日报看今天干了啥。</p>

      <h4>三、记录系统详解</h4>
      <p><b>时间段</b>：每次记录选择具体时间段（如 8:00~9:05），也可以只填开始时间。日报的时间轴会按开始时间从早到晚排列，展示你一天做了什么。</p>
      <p><b>加减分</b>：支持0.1为基本单位。正数加分，负数扣分。比如熬夜-0.5身体，读书+0.5三观。</p>
      <p><b>快捷操作</b>：预设好的一键记录按钮。每条显示：名称 + 时间段 + 各维度加减分。点一下 → 按钮变色+缩小（反馈） → 数值自动变化 → 日志自动记录。</p>

      <h4>四、命途参数（十力）</h4>
      <p><b>半可控输入（5项）</b>：命（先天体质）、运（阶段机遇）、风水（环境滋养）、名（外界标签）、相（气质印象）。这些量化为主观评估值（0~无限），可在创造模式调整。</p>
      <p><b>可主动操作（5项）</b>：积阴德、读书、敬神、交贵人、养生。每次执行 → 数值+1、获得5XP → XP满升级 → 自动给对应根基加分 → 触发庆祝。</p>
      <p><b>升级效果</b>：积阴德升级→人品+2 | 读书升级→三观+2 | 敬神升级→心态+2 | 交贵人升级→人品+1心态+1 | 养生升级→身体+2</p>
      <p><b>等级机制</b>：每满100升1级。等级越高，XP需求越大（每次升级×1.3）。每升一级触发🎉礼花+夸夸弹窗。</p>

      <h4>五、十二宫公式</h4>
      <p>每个宫位 = Σ(根基栏 × 权重) + Σ(命途参数 × 权重)。权重可在创造模式→十二宫中修改。<br>
      例：命宫 = 身体×0.25 + 心态×0.25 + 三观×0.25 + 人品×0.10 + 命×0.15<br>
      数值无上限，超过100每100升1级，触发庆祝。</p>
      <p><b>内宫</b>（命宫/财帛/官禄/福德）：用暖色调显示。<b>外宫</b>（其余八宫）：用冷色调显示。</p>

      <h4>六、各页面说明</h4>
      <p><b>📊仪表盘</b>：根基栏进度条 + 半可控输入/可主动操作紧凑列表 + 十二宫4列网格。<br>
      <b>✏️记录</b>：手动添加记录（时间段+描述+分数），快捷操作网格，吃饭记录一行。<br>
      <b>⚡操作项</b>：半可控输入和可主动操作各可展开记录。点击▶展开→填描述→填变化值→记录。<br>
      <b>🔮十二宫</b>：详细读数（内宫暖色/外宫冷色）+ 月度/年度图表（Y轴稀疏）。<br>
      <b>📅日报</b>：选日期 → 四维净变化 → 一天时间轴（按开始时间从早到晚排列）→ 操作项记录。<br>
      <b>📋报告</b>：周报/月报/年报。年份下拉可选任意年（不再局限近两年）。含最高/最低统计、趋势图、升级记录、成就解锁、创造模式改动。<br>
      <b>🌳技能树</b>：记录技能练习XP，满XP自动升级+庆祝。<br>
      <b>👥关系图谱</b>：查看人际关系亲密度。<br>
      <b>🏆成就</b>：达成条件自动解锁。</p>

      <h4>七、创造模式</h4>
      <p>点右上角🔧→输入密码（默认2626）→进入。可修改：角色名、密码、版本号、主题色（9项）、头像及大小、根基初始值及等级名、快捷操作（名称/时间段/各维度分数/关联操作项）、命途参数、十二宫权重及等级名、夸夸语录（6类）、衰减率、阈值、技能、关系、成就等。<b>所有改动会被记录，出现在月报/年报中。</b></p>

      <h4>八、升级与庆祝</h4>
      <p>根基四维、操作项、技能、十二宫——所有数值每超过100自动升1级，触发🎉礼花+夸夸弹窗。每级的夸夸语录不重样，不同类别（身体/心态/三观/人品/技能/操作项）各有独立夸夸库，可在创造模式修改。</p>

      <h4>九、导入导出</h4>
      <p>📤导出JSON（完整存档备份）、📄导出DOC（可选日报/周报/月报/年报/仪表盘/所有）、📥导入恢复数据。</p>

      <h4>十、每日衰减</h4>
      <p>点🌙每日衰减：身体-0.1、心态-0.1、三观-0.01、人品-0.01。正常报告不显示此项，只有"啥也没干"的空报告才提示衰减影响。</p>

      <h4>十一、版本迭代</h4>
      <p>底部⬆️版本+1手动升版。建议月度复盘后升级，记录认知跃迁。</p>

      <h4>十二、性能说明</h4>
      <p>系统使用浏览器本地存储。日志超过1000条时建议定期导出JSON备份。图表使用Chart.js（CDN加载，首次需联网）。时间轴只渲染当日记录，不会卡顿。</p>

      <h4>十三、英文对照表</h4>
      <p style="font-size:12px;line-height:2">
      body=身体 | mind=心态 | view=三观 | char=人品<br>
      ming=命 | yun=运 | feng=风水 | ming2=名 | xiang=相<br>
      yin=积阴德 | du=读书 | jing=敬神 | gui=交贵人 | yang=养生
      </p>
    </div>
  </div>`;
}

// ========== 初始化报告选择器 ==========
function initReportSelects(){
  const ySel = document.getElementById('repYear');
  const mSel = document.getElementById('repMonth');
  const cyChart = document.getElementById('chartYear');
  const cmChart = document.getElementById('chartMonth');
  if(!ySel || !mSel) return;
  const cy = new Date().getFullYear();
  // 报告年份：2026年到2100年（可自由选择）
  ySel.innerHTML = ''; mSel.innerHTML = '';
 for(let y=2026; y<=2100; y++){ const o=document.createElement('option'); o.value=y; o.textContent=y+'年'; if(y===cy) o.selected=true; ySel.appendChild(o); }  for(let m=1;m<=12;m++){ const o=document.createElement('option'); o.value=m; o.textContent=m+'月'; if(m===new Date().getMonth()+1) o.selected=true; mSel.appendChild(o); }
  // 图表选择器
  if(cyChart){
    cyChart.innerHTML=''; cmChart.innerHTML='';
    for(let y=cy-10; y<=cy; y++){ const o=document.createElement('option'); o.value=y; o.textContent=y+'年'; if(y===cy) o.selected=true; cyChart.appendChild(o); }
    for(let m=1;m<=12;m++){ const o=document.createElement('option'); o.value=m; o.textContent=m+'月'; cmChart.appendChild(o); }
  }
  onRepTypeChange();
}
