/* ============================================================
   create.js — 创造模式：修改一切
   ============================================================ */

let createOpen = false;

// ========== 打开创造模式（居中弹窗）==========
function openCreateMode(){
  const pwdModal = document.getElementById('pwdModal');
  if(pwdModal){ pwdModal.classList.add('open'); document.getElementById('pwdInput').focus(); return; }
  const pwd = prompt('请输入创造模式密码：','') || '';
  if(pwd !== (DATA.createPwd || '2626')){ alert('密码错误'); return; }
  _enterCreate();
}
function submitPwd(){
  const pwd = document.getElementById('pwdInput').value || '';
  if(pwd !== (DATA.createPwd || '2626')){ alert('密码错误'); return; }
  document.getElementById('pwdModal').classList.remove('open');
  document.getElementById('pwdInput').value = '';
  _enterCreate();
}
function cancelPwd(){
  document.getElementById('pwdModal').classList.remove('open');
  document.getElementById('pwdInput').value = '';
}
function _enterCreate(){
  DATA.createCount = (DATA.createCount||0)+1;
  document.getElementById('createModal').classList.add('open');
  renderCreateBody();
  createOpen = true;
}

function closeCreateMode(){
  document.getElementById('createModal').classList.remove('open');
  createOpen = false;
  saveData(); renderAll();
}
function logCreateChange(desc){
  DATA.createLog.push({ date:todayStr(), time:nowTime(), desc });
}

// ========== 创造模式：导航 ==========
function renderCreateBody(){
  const c = document.getElementById('createBody');
  c.innerHTML = `
    <div class="create-nav" id="createNav"></div>
    <div id="createPage"></div>`;
  const tabs = [
    ['基础','renderCreateBase'],
    ['根基','renderCreateRoots'],
    ['半可控输入','renderCreateInputs'],
    ['可主动操作','renderCreateActions'],
    ['十二宫','renderCreatePalaces'],
    ['快捷操作','renderCreateQuick'],
    ['夸夸','renderCreatePraise'],
    ['主题色','renderCreateTheme'],
    ['头像','renderCreateAvatar'],
    ['衰减/阈值','renderCreateDecay'],
    ['技能/关系/成就','renderCreateMisc'],
    ['密码','renderCreatePwd'],
  ];
  const nav = document.getElementById('createNav');
  nav.innerHTML = '';
  tabs.forEach((t,i)=>{
    const b=document.createElement('button');
    b.textContent=t[0];
    b.className='btn btn-ghost cr-nav-btn';
    b.onclick=()=>{
      document.querySelectorAll('#createNav .cr-nav-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById('createPage').innerHTML = window[t[1]]();
    };
    nav.appendChild(b);
  });
  const firstBtn = nav.querySelector('.cr-nav-btn'); if(firstBtn) firstBtn.classList.add('active');
  document.getElementById('createPage').innerHTML = renderCreateBase();
}

// ========== 基础设置 ==========
function renderCreateBase(){
  return `<div class="card">
    <h4>角色名</h4><input id="cName" value="${DATA.charName||''}">
    <h4>版本号</h4><input id="cVer" value="${DATA.version}">
    <h4 style="margin-top:10px">分数段自定义</h4>
    <p style="font-size:12px;color:var(--text-sub)">每满100升1级。格式：JSON数组，每项{min,max,label,color,emoji}</p>
    <textarea id="cTiers" rows="8" style="font-size:11px">${JSON.stringify(TIERS,null,2)}</textarea>
    <button class="btn btn-primary" style="margin-top:8px" onclick="saveCreateBase()">💾 保存基础</button>
  </div>`;
}
function saveCreateBase(){
  DATA.charName = document.getElementById('cName').value;
  DATA.version = document.getElementById('cVer').value;
  try{ const t=JSON.parse(document.getElementById('cTiers').value); if(Array.isArray(t)){ for(let i=0;i<t.length;i++) TIERS[i]=t[i]; } }catch(e){}
  logCreateChange('修改基础设置（角色名/版本/分数段）');
  saveData(); renderAll(); flashTip('✅ 已保存');
}

// ========== 根基数值 ==========
function renderCreateRoots(){
  let h = '';
  for(const k of ['body','mind','view','char']){
    const r = DATA.roots[k];
    h+=`<div class="card"><h4>${r.name}</h4>
      数值<input id="r_${k}" type="number" step="0.1" value="${r.val}">
      描述<input id="r_${k}_d" value="${r.desc||''}">
      <details><summary style="font-size:12px;color:var(--text-sub);cursor:pointer">自定义等级名（每行一个，Lv.1起）</summary>
      <textarea id="r_${k}_lv" rows="5" style="font-size:12px;margin-top:4px">${(r.levelNames||[]).join('\n')}</textarea></details>
    </div>`;
  }
  h+=`<button class="btn btn-primary" onclick="saveCreateRoots()">💾 保存根基</button>`;
  return h;
}
function saveCreateRoots(){
  for(const k of ['body','mind','view','char']){
    DATA.roots[k].val = parseFloat(document.getElementById(`r_${k}`).value)||0;
    DATA.roots[k].desc = document.getElementById(`r_${k}_d`).value;
    DATA.roots[k].levelNames = document.getElementById(`r_${k}_lv`).value.split('\n').map(s=>s.trim()).filter(Boolean);
  }
  logCreateChange('修改根基数值/等级名');
  saveData(); renderAll(); flashTip('✅ 已保存');
}

// ========== 半可控输入 ==========
function renderCreateInputs(){
  let h = '<div style="display:grid;gap:8px">';
  for(const k in DATA.inputs){
    const p=DATA.inputs[k];
    h+=`<div class="card cr-input-card">
      <div class="cr-card-header"><b>${p.name}</b> <small style="color:var(--text-sub)">key: ${k}</small></div>
      <div class="cr-row">
        <label>数值</label><input id="i_${k}" type="number" step="0.1" value="${p.val}">
        <label>描述</label><input id="i_${k}_d" value="${p.desc||''}">
      </div>
    </div>`;
  }
  h+='</div>';
  h+=`<button class="btn btn-primary" style="margin-top:8px" onclick="saveCreateInputs()">💾 保存半可控输入</button>`;
  return h;
}
function saveCreateInputs(){
  for(const k in DATA.inputs){
    DATA.inputs[k].val=parseFloat(document.getElementById(`i_${k}`).value)||0;
    DATA.inputs[k].desc=document.getElementById(`i_${k}_d`).value;
  }
  logCreateChange('修改半可控输入');
  saveData(); renderAll(); flashTip('✅ 已保存');
}

// ========== 可主动操作项 ==========
function renderCreateActions(){
  let h = '<div style="display:grid;gap:8px">';
  for(const k in DATA.actions){
    const a=DATA.actions[k];
    h+=`<div class="card cr-input-card">
      <div class="cr-card-header"><b>${a.name}</b> <small style="color:var(--text-sub)">key: ${k}</small></div>
      <div class="cr-row">
        <label>数值</label><input id="a_${k}" type="number" step="0.1" value="${a.val}">
        <label>XP</label><input id="a_${k}_x" type="number" value="${a.xp}">
        <label>升级XP</label><input id="a_${k}_n" type="number" value="${a.xpNext}">
        <label>等级</label><input id="a_${k}_l" type="number" value="${a.lv}">
      </div>
      <details><summary style="font-size:12px;color:var(--text-sub);cursor:pointer;margin-top:4px">自定义等级名（每行一个）</summary>
      <textarea id="a_${k}_lv" rows="3" style="font-size:12px;margin-top:4px">${(a.levelNames||[]).join('\n')}</textarea></details>
    </div>`;
  }
  h+='</div>';
  h+=`<button class="btn btn-primary" style="margin-top:8px" onclick="saveCreateActions()">💾 保存可主动操作</button>`;
  return h;
}
function saveCreateActions(){
  for(const k in DATA.actions){
    const a=DATA.actions[k];
    a.val=parseFloat(document.getElementById(`a_${k}`).value)||0;
    a.xp=parseInt(document.getElementById(`a_${k}_x`).value)||0;
    a.xpNext=parseInt(document.getElementById(`a_${k}_n`).value)||100;
    a.lv=parseInt(document.getElementById(`a_${k}_l`).value)||1;
    a.levelNames=(document.getElementById(`a_${k}_lv`).value.split('\n').map(s=>s.trim()).filter(Boolean));
  }
  logCreateChange('修改可主动操作项');
  saveData(); renderAll(); flashTip('✅ 已保存');
}

// ========== 十二宫 ==========
function renderCreatePalaces(){
  let h = '';
  for(const k in DATA.palaces){
    const p=DATA.palaces[k];
    const group = (DATA.palaceGroup&&DATA.palaceGroup[k]==='inner') ? '内宫（暖色）' : '外宫（冷色）';
    h+=`<div class="card">
      <div class="cr-card-header"><b>${p.name}</b> <small style="color:var(--text-sub)">${group}</small></div>
      <label>描述</label><input id="p_${k}_d" value="${p.desc||''}">
      <label>权重JSON</label><textarea id="p_${k}_w" rows="3" style="font-size:11px">${JSON.stringify(p.weights)}</textarea>
      <details><summary style="font-size:12px;color:var(--text-sub);cursor:pointer;margin-top:4px">自定义等级名（每行一个）</summary>
      <textarea id="p_${k}_lv" rows="3" style="font-size:12px;margin-top:4px">${(p.levelNames||[]).join('\n')}</textarea></details>
    </div>`;
  }
  h+=`<button class="btn btn-primary" onclick="saveCreatePalaces()">💾 保存十二宫</button>`;
  return h;
}
function saveCreatePalaces(){
  for(const k in DATA.palaces){
    const p=DATA.palaces[k];
    p.desc=document.getElementById(`p_${k}_d`).value;
    try{p.weights=JSON.parse(document.getElementById(`p_${k}_w`).value);}catch(e){}
    p.levelNames=document.getElementById(`p_${k}_lv`).value.split('\n').map(s=>s.trim()).filter(Boolean);
  }
  logCreateChange('修改十二宫配置');
  saveData(); renderAll(); flashTip('✅ 已保存');
}

// ========== 快捷操作 ==========
function renderCreateQuick(){
  let h = '<div style="display:grid;gap:8px">';
  DATA.quickActions.forEach((q,idx)=>{
    h+=`<div class="card cr-quick-card">
      <div class="cr-card-header"><b>快捷操作 #${idx+1}</b></div>
      <div class="cr-qr-grid">
        <label>标签文字</label><input value="${q.label}" onchange="DATA.quickActions[${idx}].label=this.value">
        <label>开始时间</label><input type="time" value="${q.startTime||''}" onchange="DATA.quickActions[${idx}].startTime=this.value">
        <label>结束时间</label><input type="time" value="${q.endTime||''}" onchange="DATA.quickActions[${idx}].endTime=this.value">
        <label>身体Δ</label><input type="number" step="0.1" value="${q.deltas.body||0}" onchange="DATA.quickActions[${idx}].deltas.body=parseFloat(this.value)||0">
        <label>心态Δ</label><input type="number" step="0.1" value="${q.deltas.mind||0}" onchange="DATA.quickActions[${idx}].deltas.mind=parseFloat(this.value)||0">
        <label>三观Δ</label><input type="number" step="0.1" value="${q.deltas.view||0}" onchange="DATA.quickActions[${idx}].deltas.view=parseFloat(this.value)||0">
        <label>人品Δ</label><input type="number" step="0.1" value="${q.deltas.char||0}" onchange="DATA.quickActions[${idx}].deltas.char=parseFloat(this.value)||0">
        <label>关联操作项</label><select onchange="DATA.quickActions[${idx}].actionKey=this.value"><option value="">无</option>${Object.keys(DATA.actions).map(k=>`<option ${q.actionKey===k?'selected':''} value="${k}">${DATA.actions[k].name}</option>`).join('')}</select>
      </div>
      <button onclick="DATA.quickActions.splice(${idx},1);renderCreateQuick();logCreateChange('删除快捷操作');saveData()" style="color:red;border:none;background:none;font-size:16px;margin-top:4px">🗑 删除</button>
    </div>`;
  });
  h+='</div>';
  // 新增
  h+=`<div class="card">
    <div class="cr-card-header"><b>➕ 新增快捷操作</b></div>
    <div class="cr-qr-grid">
      <label>标签文字</label><input id="nq_label" placeholder="如 💪健身1小时">
      <label>开始时间</label><input type="time" id="nq_st">
      <label>结束时间</label><input type="time" id="nq_et">
      <label>身体Δ</label><input id="nq_body" type="number" step="0.1" value="0">
      <label>心态Δ</label><input id="nq_mind" type="number" step="0.1" value="0">
      <label>三观Δ</label><input id="nq_view" type="number" step="0.1" value="0">
      <label>人品Δ</label><input id="nq_char" type="number" step="0.1" value="0">
      <label>关联操作项</label><select id="nq_act"><option value="">无</option>${Object.keys(DATA.actions).map(k=>`<option value="${k}">${DATA.actions[k].name}</option>`).join('')}</select>
    </div>
    <button class="btn btn-success" style="margin-top:6px" onclick="addQuickAction()">➕ 添加</button>
  </div>`;
  h+=`<button class="btn btn-primary" style="margin-top:8px" onclick="saveData();renderAll();flashTip('✅ 已保存')">💾 保存全部</button>`;
  return h;
}
function addQuickAction(){
  DATA.quickActions.push({
    id:'q'+Date.now(),
    label:document.getElementById('nq_label').value||'新操作',
    startTime:document.getElementById('nq_st').value||'',
    endTime:document.getElementById('nq_et').value||'',
    deltas:{
      body:parseFloat(document.getElementById('nq_body').value)||0,
      mind:parseFloat(document.getElementById('nq_mind').value)||0,
      view:parseFloat(document.getElementById('nq_view').value)||0,
      char:parseFloat(document.getElementById('nq_char').value)||0
    },
    actionKey:document.getElementById('nq_act').value||''
  });
  logCreateChange('新增快捷操作');
  saveData(); renderCreateQuick();
}

// ========== 夸夸语录 ==========
function renderCreatePraise(){
  let h = '<p style="font-size:12px;color:var(--text-sub)">每行一条，不同类别互不影响。升级时按顺序循环取用。</p>';
  const cats = [['body','身体'],['mind','心态'],['view','三观'],['char','人品'],['skill','技能'],['action','操作项']];
  cats.forEach(([k,name])=>{
    h+=`<div class="card"><h4>${name}夸夸</h4><textarea id="pr_${k}" rows="5" style="font-size:12px;width:100%">${(DATA.praise[k]||[]).join('\n')}</textarea></div>`;
  });
  h+=`<button class="btn btn-primary" onclick="saveCreatePraise()">💾 保存夸夸</button>`;
  return h;
}
function saveCreatePraise(){
  ['body','mind','view','char','skill','action'].forEach(k=>{
    DATA.praise[k]=(document.getElementById('pr_'+k).value.split('\n').map(s=>s.trim()).filter(Boolean));
  });
  logCreateChange('修改夸夸语录');
  saveData(); flashTip('✅ 已保存');
}

// ========== 主题色 ==========
function renderCreateTheme(){
  const t = DATA.theme;
  return `<div class="card">
    <div class="cr-theme-grid">
      <div class="color-row"><label>主色（顶部栏/按钮）</label><input type="color" id="th_primary" value="${t.primary}"></div>
      <div class="color-row"><label>主色浅色（背景/边框）</label><input type="color" id="th_pl" value="${t.primaryLight}"></div>
      <div class="color-row"><label>主色背景</label><input type="color" id="th_pb" value="${t.primaryBg}"></div>
      <div class="color-row"><label>进度条填充色</label><input type="color" id="th_bf" value="${t.barFill}"></div>
      <div class="color-row"><label>进度条背景色</label><input type="color" id="th_bbg" value="${t.barBg}"></div>
      <div class="color-row"><label>高亮色</label><input type="color" id="th_hl" value="${t.highlight}"></div>
      <div class="color-row"><label>高亮文字色</label><input type="color" id="th_hlt" value="${t.highlightText}"></div>
      <div class="color-row"><label>页面背景</label><input type="color" id="th_bg" value="${t.bg}"></div>
      <div class="color-row"><label>卡片背景</label><input type="color" id="th_card" value="${t.card}"></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn btn-ghost" onclick="applyThemePreview()">👁 预览</button>
      <button class="btn btn-success" onclick="saveCreateTheme()">💾 保存主题</button>
    </div>
  </div>`;
}
function applyThemePreview(){
  const t = DATA.theme;
  t.primary=document.getElementById('th_primary').value;
  t.primaryLight=document.getElementById('th_pl').value;
  t.primaryBg=document.getElementById('th_pb').value;
  t.barFill=document.getElementById('th_bf').value;
  t.barBg=document.getElementById('th_bbg').value;
  t.highlight=document.getElementById('th_hl').value;
  t.highlightText=document.getElementById('th_hlt').value;
  t.bg=document.getElementById('th_bg').value;
  t.card=document.getElementById('th_card').value;
  applyTheme();
}
function saveCreateTheme(){
  applyThemePreview();
  logCreateChange('修改主题色');
  saveData(); flashTip('✅ 主题已保存');
}

// ========== 头像 ==========
function renderCreateAvatar(){
  return `<div class="card">
    <h4>头像</h4>
    <p style="font-size:12px;color:var(--text-sub)">上传后头像显示在顶部栏。不传则隐形融入背景。</p>
    <input type="file" id="avFile" accept="image/*" onchange="uploadAvatar(event)">
    <h4 style="margin-top:10px">头像大小</h4>
    <select id="avSize">
      <option ${DATA.avatar.size<90?'selected':''} value="40">小（40px）</option>
      <option ${DATA.avatar.size>=90&&DATA.avatar.size<100?'selected':''} value="90">中（90px）</option>
      <option ${DATA.avatar.size>=100?'selected':''} value="100">大（100px）</option>
    </select>
    <button class="btn btn-primary" style="margin-top:8px" onclick="saveCreateAvatar()">💾 保存</button>
  </div>`;
}
function uploadAvatar(e){
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ev => { DATA.avatar.dataUrl = ev.target.result; };
  r.readAsDataURL(f);
}
function saveCreateAvatar(){
  DATA.avatar.size = parseInt(document.getElementById('avSize').value)||90;
  logCreateChange('修改头像');
  saveData(); applyTheme(); renderAll(); flashTip('✅ 头像已保存');
}

// ========== 衰减/阈值 ==========
function renderCreateDecay(){
  const d = DATA.decay;
  return `<div class="card">
    <h4>每日自然衰减</h4>
    <p style="font-size:11px;color:var(--text-sub)">不记录时每天自动扣除的数值</p>
    <div class="cr-row">
      身体 -<input id="dc_body" type="number" step="0.01" value="${d.body}">
      心态 -<input id="dc_mind" type="number" step="0.01" value="${d.mind}">
      三观 -<input id="dc_view" type="number" step="0.001" value="${d.view}">
      人品 -<input id="dc_char" type="number" step="0.001" value="${d.char}">
    </div>
  </div>
  <div class="card">
    <h4>阈值触发</h4>
    <p style="font-size:11px;color:var(--text-sub)">低于/高于此值触发系统状态警告</p>
    <div class="cr-row">
      身体疲劳阈值 <input id="th_body" type="number" value="${DATA.thresholds.body_low}">
      心态心流阈值 <input id="th_mind" type="number" value="${DATA.thresholds.mind_high}">
      三观通透阈值 <input id="th_view" type="number" value="${DATA.thresholds.view_high}">
      人品信誉阈值 <input id="th_char" type="number" value="${DATA.thresholds.char_low}">
    </div>
  </div>
  <button class="btn btn-primary" onclick="saveCreateDecay()">💾 保存</button>`;
}
function saveCreateDecay(){
  DATA.decay.body=parseFloat(document.getElementById('dc_body').value)||0;
  DATA.decay.mind=parseFloat(document.getElementById('dc_mind').value)||0;
  DATA.decay.view=parseFloat(document.getElementById('dc_view').value)||0;
  DATA.decay.char=parseFloat(document.getElementById('dc_char').value)||0;
  DATA.thresholds.body_low=parseInt(document.getElementById('th_body').value)||50;
  DATA.thresholds.mind_high=parseInt(document.getElementById('th_mind').value)||90;
  DATA.thresholds.view_high=parseInt(document.getElementById('th_view').value)||80;
  DATA.thresholds.char_low=parseInt(document.getElementById('th_char').value)||60;
  logCreateChange('修改衰减/阈值');
  saveData(); flashTip('✅ 已保存');
}

// ========== 技能/关系/成就 ==========
function renderCreateMisc(){
  let h = '<h4>技能</h4><div style="display:grid;gap:6px">';
  DATA.skills.forEach((s,idx)=>{
    h+=`<div class="card cr-skill-card">
      <input value="${s.name}" onchange="DATA.skills[${idx}].name=this.value" style="width:25%">
      <input value="${s.desc||''}" onchange="DATA.skills[${idx}].desc=this.value" style="width:25%" placeholder="描述">
      <input value="${s.xp}" type="number" onchange="DATA.skills[${idx}].xp=parseInt(this.value)||0" style="width:60px" title="当前XP">
      <input value="${s.xpNext}" type="number" onchange="DATA.skills[${idx}].xpNext=parseInt(this.value)||100" style="width:60px" title="升级需求">
      <input value="${s.lv}" type="number" onchange="DATA.skills[${idx}].lv=parseInt(this.value)||1" style="width:40px" title="等级">
      <button onclick="DATA.skills.splice(${idx},1);renderCreateMisc();saveData()" style="color:red;border:none;background:none">🗑</button>
    </div>`;
  });
  h+=`</div><div class="card"><h4>➕ 新增技能</h4>
    <input id="ns_name" placeholder="名称" style="width:20%">
    <input id="ns_desc" placeholder="描述" style="width:25%">
    <input id="ns_xp" type="number" value="50" style="width:60px" title="升级XP需求">
    <button class="btn btn-success" onclick="DATA.skills.push({id:'s'+Date.now(),name:document.getElementById('ns_name').value,desc:document.getElementById('ns_desc').value,xp:0,xpNext:parseInt(document.getElementById('ns_xp').value)||50,lv:1});logCreateChange('新增技能');saveData();renderCreateMisc()">➕</button>
  </div>`;

  h+='<h4 style="margin-top:14px">关系</h4><div style="display:grid;gap:6px">';
  DATA.relations.forEach((r,idx)=>{
    h+=`<div class="card cr-skill-card">
      <input value="${r.name}" onchange="DATA.relations[${idx}].name=this.value" style="width:25%">
      <input value="${r.type}" onchange="DATA.relations[${idx}].type=this.value" style="width:20%" placeholder="类型">
      <input value="${r.intimacy}" type="number" onchange="DATA.relations[${idx}].intimacy=parseInt(this.value)||0" style="width:60px" title="亲密度">
      <button onclick="DATA.relations.splice(${idx},1);renderCreateMisc();saveData()" style="color:red;border:none;background:none">🗑</button>
    </div>`;
  });
  h+=`</div><div class="card"><h4>➕ 新增关系</h4>
    <input id="nr_name" placeholder="名称" style="width:20%">
    <input id="nr_type" placeholder="朋友/家人/同事" style="width:20%">
    <input id="nr_int" type="number" value="50" style="width:60px" title="亲密度">
    <button class="btn btn-success" onclick="DATA.relations.push({id:'r'+Date.now(),name:document.getElementById('nr_name').value,type:document.getElementById('nr_type').value,intimacy:parseInt(document.getElementById('nr_int').value)||50});logCreateChange('新增关系');saveData();renderCreateMisc()">➕</button>
  </div>`;

  h+='<h4 style="margin-top:14px">成就</h4><div style="display:grid;gap:6px">';
  DATA.achievements.forEach((a,idx)=>{
    h+=`<div class="card cr-skill-card">
      <input value="${a.name}" onchange="DATA.achievements[${idx}].name=this.value" style="width:25%">
      <input value="${a.desc}" onchange="DATA.achievements[${idx}].desc=this.value" style="width:30%">
      <input value="${a.icon}" onchange="DATA.achievements[${idx}].icon=this.value" style="width:40px" title="图标">
      <label><input type="checkbox" ${a.unlocked?'checked':''} onchange="DATA.achievements[${idx}].unlocked=this.checked">已解锁</label>
      <button onclick="DATA.achievements.splice(${idx},1);renderCreateMisc();saveData()" style="color:red;border:none;background:none">🗑</button>
    </div>`;
  });
  h+=`</div><div class="card"><h4>➕ 新增成就</h4>
    <input id="na_name" placeholder="名称" style="width:20%">
    <input id="na_desc" placeholder="描述" style="width:30%">
    <input id="na_icon" value="🏆" style="width:40px" title="图标">
    <button class="btn btn-success" onclick="DATA.achievements.push({id:'a'+Date.now(),name:document.getElementById('na_name').value,desc:document.getElementById('na_desc').value,icon:document.getElementById('na_icon').value,unlocked:false});logCreateChange('新增成就');saveData();renderCreateMisc()">➕</button>
  </div>`;

  h+=`<button class="btn btn-primary" style="margin-top:8px" onclick="saveData();renderAll();flashTip('✅ 已保存')">💾 保存全部</button>`;
  return h;
}

// ========== 密码 ==========
function renderCreatePwd(){
  return `<div class="card">
    <h4>修改创造模式密码</h4>
    <p style="font-size:12px;color:var(--text-sub)">当前密码：${DATA.createPwd||'2626'}</p>
    <label>新密码</label><input type="password" id="npwd" placeholder="输入新密码">
    <label>确认</label><input type="password" id="npwd2" placeholder="再输一次">
    <button class="btn btn-primary" style="margin-top:8px" onclick="saveCreatePwd()">💾 修改密码</button>
  </div>`;
}
function saveCreatePwd(){
  const p1=document.getElementById('npwd').value, p2=document.getElementById('npwd2').value;
  if(p1!==p2){ alert('两次输入不一致'); return; }
  if(!p1){ alert('密码不能为空'); return; }
  DATA.createPwd = p1;
  logCreateChange('修改创造模式密码');
  saveData(); flashTip('✅ 密码已修改，下次用新密码进入');
}
