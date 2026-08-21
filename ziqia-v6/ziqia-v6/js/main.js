/* ============================================================
   main.js — 初始化 & 页面路由
   ============================================================ */

const PAGES = {
  dashboard: { render: renderDashboard, onShow: null },
  record:    { render: renderRecord,    onShow: null },
  operations:{ render: renderOperations, onShow: null },
  palace:    { render: renderPalace,    onShow: null },
  daily:     { render: ()=>renderDaily(), onShow: null },
  report:    { render: renderReport,   onShow: ()=>{ initReportSelects(); } },
  skill:     { render: renderSkill,    onShow: null },
  relation:  { render: renderRelation,  onShow: null },
  achievement:{ render: renderAchievement, onShow: null },
  manual:    { render: renderManual,   onShow: null },
};

function renderAll(){
  applyTheme();
  renderTopbar();
  const active = document.querySelector('.tabBtn.active');
  if(active){ const k = active.dataset.tab; renderPage(k); }
  else renderPage('dashboard');
}
function renderPage(k){
  const page = PAGES[k];
  if(!page) return;
  const html = page.render();
  let container = document.getElementById('pages');
  container.innerHTML = `<div class="page active" id="page_${k}">${html}</div>`;
  if(page.onShow) page.onShow();
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.tabBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.tabBtn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderPage(btn.dataset.tab);
    });
  });

  const pwdSubmit = document.getElementById('pwdSubmit');
  if(pwdSubmit) pwdSubmit.addEventListener('click', submitPwd);
  const pwdCancel = document.getElementById('pwdCancel');
  if(pwdCancel) pwdCancel.addEventListener('click', cancelPwd);
  const pwdInput = document.getElementById('pwdInput');
  if(pwdInput) pwdInput.addEventListener('keydown', e=>{ if(e.key==='Enter') submitPwd(); });

  document.getElementById('btnCreateMode').addEventListener('click', openCreateMode);

  renderAll();

  const unlocked = checkAchievements();
  saveData();
  if(unlocked.length){ unlocked.forEach(a=>flashTip('🏆 成就解锁：'+a.name)); }
});

window.addEventListener('error', e=>{ console.error('[ZIQIA ERROR]', e.message); });
