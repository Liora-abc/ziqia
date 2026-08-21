/* ============================================================
   calc.js — 计算引擎
   十二宫 / 命途参数 / 等级 / 衰减 / 阈值 / 成就
   ============================================================ */

// ---------- 计算单个宫位得分（无限值） ----------
function calcPalace(palaceKey){
  const p = DATA.palaces[palaceKey];
  const w = p.weights;
  let score = 0, totalW = 0;
  for(const k in w){
    const weight = w[k];
    let val = 0;
    if(DATA.roots[k]) val = DATA.roots[k].val;
    else if(DATA.inputs[k]) val = DATA.inputs[k].val;
    else if(DATA.actions[k]) val = DATA.actions[k].val;
    score += val * weight;
    totalW += weight;
  }
  const normalized = totalW > 0 ? score / totalW : 0;
  return Math.max(0, Math.round(normalized * 10) / 10);
}

// ---------- 计算所有宫位 ----------
function calcAllPalaces(){
  const out = {};
  for(const k in DATA.palaces) out[k] = calcPalace(k);
  return out;
}

// ---------- 命途参数：所有值 ----------
function getAllParamValues(){
  const out = {};
  for(const k in DATA.inputs) out[k] = DATA.inputs[k].val;
  for(const k in DATA.actions) out[k] = DATA.actions[k].val;
  return out;
}

// ---------- 应用记录对根基的影响 ----------
function applyDeltas(deltas){
  const before = {};
  for(const k of ['body','mind','view','char']){
    before[k] = DATA.roots[k].val;
    if(deltas[k]){
      DATA.roots[k].val = Math.max(0, DATA.roots[k].val + deltas[k]);
    }
  }
  return before;
}

// ---------- 检查根基升级 ----------
function checkRootLevelUp(before, after){
  const ups = [];
  for(const k of ['body','mind','view','char']){
    const bLv = getLevel(before[k]).lv;
    const aLv = getLevel(after[k]).lv;
    if(aLv > bLv){
      ups.push({ type:'root', key:k, fromLv:bLv, toLv:aLv, name:DATA.roots[k].name });
    }
  }
  return ups;
}

// ---------- 可主动操作项：加XP / 升级 ----------
function addActionXP(actionKey, amount){
  const a = DATA.actions[actionKey];
  if(!a) return [];
  a.xp += amount;
  const ups = [];
  while(a.xp >= a.xpNext){
    a.xp -= a.xpNext;
    a.lv++;
    a.xpNext = Math.round(a.xpNext * 1.3);
    const eff = ACTION_LEVELUP_EFFECT[actionKey] || {};
    for(const rk in eff){
      const before = DATA.roots[rk].val;
      DATA.roots[rk].val += eff[rk];
    }
    ups.push({ type:'action', key:actionKey, fromLv:a.lv-1, toLv:a.lv, name:a.name });
    DATA.levelLog.push({ date:todayStr(), time:nowTime(), type:'action', key:actionKey, fromLv:a.lv-1, toLv:a.lv });
  }
  return ups;
}

// ---------- 技能加XP / 升级 ----------
function addSkillXP(skillId, amount){
  const s = DATA.skills.find(x=>x.id===skillId);
  if(!s) return [];
  s.xp += amount;
  const ups = [];
  while(s.xp >= s.xpNext){
    s.xp -= s.xpNext;
    s.lv++;
    s.xpNext = Math.round(s.xpNext * 1.4);
    ups.push({ type:'skill', key:skillId, fromLv:s.lv-1, toLv:s.lv, name:s.name });
    DATA.levelLog.push({ date:todayStr(), time:nowTime(), type:'skill', key:skillId, fromLv:s.lv-1, toLv:s.lv });
  }
  return ups;
}

// ---------- 每日衰减 ----------
function decayDaily(){
  const before = {};
  for(const k of ['body','mind','view','char']){
    before[k] = DATA.roots[k].val;
    DATA.roots[k].val = Math.max(0, DATA.roots[k].val - DATA.decay[k]);
  }
  DATA.log.push({
    id: Date.now(), date:todayStr(), time:nowTime(),
    timeTag:'系统', desc:'🌙每日自然衰减',
    deltas:{ body:-DATA.decay.body, mind:-DATA.decay.mind, view:-DATA.decay.view, char:-DATA.decay.char },
    source:'decay'
  });
  saveData();
  return before;
}

// ---------- 检测成就解锁 ----------
function checkAchievements(){
  const unlocked = [];
  for(const a of DATA.achievements){
    if(a.unlocked) continue;
    try{
      if(a.check(DATA, DATA.log)){ a.unlocked = true; a.unlockDate = todayStr(); unlocked.push(a); }
    }catch(e){}
  }
  return unlocked;
}

// ---------- 系统状态：阈值触发 ----------
function getSystemStatus(){
  const s = {};
  s.fatigue = DATA.roots.body.val < DATA.thresholds.body_low;
  s.flow = DATA.roots.mind.val >= DATA.thresholds.mind_high;
  s.insight = DATA.roots.view.val >= DATA.thresholds.view_high;
  s.credit = DATA.roots.char.val < DATA.thresholds.char_low;
  return s;
}

// ---------- 获取宫位分数段 ----------
function getPalaceTier(val){
  return getLevel(val);
}

// ---------- 统计：某段时间内根基净变化 ----------
function statRootChange(rangeStart, rangeEnd){
  const logs = DATA.log.filter(l=>l.date>=rangeStart && l.date<=rangeEnd && l.source!=='decay');
  const decayLogs = DATA.log.filter(l=>l.date>=rangeStart && l.date<=rangeEnd && l.source==='decay');
  const result = { body:0, mind:0, view:0, char:0, decayBody:0, decayMind:0, decayView:0, decayChar:0, count:logs.length };
  for(const l of logs){
    if(l.deltas) for(const k in l.deltas){ if(k in result) result[k]+=l.deltas[k]; }
  }
  for(const l of decayLogs){
    if(l.deltas) for(const k in l.deltas){ if(k in result) result['decay'+k.charAt(0).toUpperCase()+k.slice(1)]+=Math.abs(l.deltas[k]); }
  }
  return result;
}

// ---------- 统计：操作项执行次数 ----------
function statActionCount(rangeStart, rangeEnd){
  const out = {};
  for(const k in DATA.actions) out[k] = 0;
  const plogs = DATA.paramLog.filter(l=>l.date>=rangeStart && l.date<=rangeEnd);
  for(const l of plogs){ if(out[l.paramKey]!==undefined) out[l.paramKey]++; }
  const qlogs = DATA.log.filter(l=>l.date>=rangeStart && l.date<=rangeEnd && l.source==='quick');
  for(const l of qlogs){
    const q = DATA.quickActions.find(qq=>qq.label===l.desc);
    if(q && q.actionKey && out[q.actionKey]!==undefined) out[q.actionKey]++;
  }
  return out;
}

// ---------- 统计：高频事件 ----------
function statTopEvents(rangeStart, rangeEnd, topN=5){
  const map = {};
  const logs = DATA.log.filter(l=>l.date>=rangeStart && l.date<=rangeEnd && l.source!=='decay');
  for(const l of logs){ const k = l.desc||'(未命名)'; map[k] = (map[k]||0)+1; }
  return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,topN);
}

// ---------- 统计：操作项净变化 ----------
function statActionChange(rangeStart, rangeEnd){
  const out = {};
  for(const k in DATA.actions) out[k] = { delta:0, count:0 };
  const plogs = DATA.paramLog.filter(l=>l.date>=rangeStart && l.date<=rangeEnd);
  for(const l of plogs){
    if(out[l.paramKey]){ out[l.paramKey].delta += (l.delta||0); out[l.paramKey].count++; }
  }
  return out;
}

// ---------- 统计：操作项加分最高的前N项 ----------
function statActionTopDelta(rangeStart, rangeEnd, topN=5){
  const change = statActionChange(rangeStart, rangeEnd);
  const arr = Object.entries(change)
    .filter(([k,v])=>v.count>0)
    .map(([k,v])=>[DATA.actions[k]?DATA.actions[k].name:k, v.count, v.delta])
    .sort((a,b)=>Math.abs(b[2])-Math.abs(a[2]));
  return arr.slice(0, topN);
}

// ---------- 报告日期范围 ----------
function getMonthRange(y, m){
  const start = `${y}-${String(m).padStart(2,'0')}-01`;
  const next = m===12 ? `${y+1}-01-01` : `${y}-${String(m+1).padStart(2,'0')}-01`;
  return { start, end:next };
}
function getYearRange(y){
  return { start:`${y}-01-01`, end:`${y+1}-01-01` };
}

// ---------- 获取某日所有记录（按开始时间排序） ----------
function getDayLogs(dateStr){
  const logs = DATA.log.filter(l=>l.date===dateStr);
  // 按 startTime 排序，没有的排最后
  return logs.sort((a,b)=>{
    const sa = a.startTime||a.time||'';
    const sb = b.startTime||b.time||'';
    return sa.localeCompare(sb);
  });
}
