/* ============================================================
   data.js — 全局数据模型 & 默认配置
   ============================================================ */

function clone(o){ return JSON.parse(JSON.stringify(o)); }

const STORAGE_KEY = 'ziqia_v6_data';
const CREATE_PWD = '2626';

// ---------- 分数段配置 ----------
const TIERS = [
  { min: 0,   max: 49,  label: '严重偏低', color: '#dc2626', emoji: '🔴' },
  { min: 50,  max: 74,  label: '偏低',     color: '#f97316', emoji: '🟠' },
  { min: 75,  max: 99,  label: '一般',     color: '#eab308', emoji: '🟡' },
  { min: 100, max: 149, label: '良好',     color: '#22c55e', emoji: '🟢' },
  { min: 150, max: 199, label: '优秀',     color: '#3b82f6', emoji: '🔵' },
  { min: 200, max: 299, label: '卓越',     color: '#8b5cf6', emoji: '🟣' },
  { min: 300, max: 399, label: '超凡',     color: '#ec4899', emoji: '🌸' },
  { min: 400, max: 9999,label: '传奇',     color: '#f59e0b', emoji: '👑' },
];

// ---------- 根基四维 ----------
const ROOTS = {
  body: { key:'body', name:'身体', val:75,  max:Infinity, desc:'生理硬件', levelNames:['萌芽','生长','茁壮','坚韧','钢铁之躯'] },
  mind: { key:'mind', name:'心态', val:82,  max:Infinity, desc:'情绪内核与韧性', levelNames:['波动','平稳','从容','豁达','如如不动'] },
  view: { key:'view', name:'三观', val:70,  max:Infinity, desc:'认知方向盘', levelNames:['朦胧','清晰','通透','辽阔','天人合一'] },
  char: { key:'char', name:'人品', val:80,  max:Infinity, desc:'行为底线与信用', levelNames:['起步','可信','可靠','如玉','德馨远播'] },
};

// ---------- 命途参数 ----------
// 半可控输入：命、运、风水、名、相
const INPUTS = {
  ming:  { key:'ming',  name:'命',   val:65, desc:'先天体质与家庭背景', group:'input' },
  yun:   { key:'yun',   name:'运',   val:60, desc:'阶段承载力与机遇', group:'input' },
  feng:  { key:'feng',  name:'风水', val:55, desc:'环境对状态的滋养', group:'input' },
  ming2: { key:'ming2', name:'名',   val:50, desc:'外界标签与名声', group:'input' },
  xiang: { key:'xiang', name:'相',   val:58, desc:'面相气质给他人印象', group:'input' },
};
// 可主动操作：积阴德、读书、敬神、交贵人、养生
const ACTIONS = {
  yin:  { key:'yin',  name:'积阴德', val:30,  xp:0, xpNext:100, lv:1, desc:'暗中行善，人品微升', group:'action' },
  du:   { key:'du',   name:'读书',   val:45,  xp:0, xpNext:100, lv:1, desc:'三观+知识技能', group:'action' },
  jing: { key:'jing', name:'敬神',   val:10,  xp:0, xpNext:100, lv:1, desc:'心态+敬畏值', group:'action' },
  gui:  { key:'gui',  name:'交贵人', val:35,  xp:0, xpNext:100, lv:1, desc:'关系图谱质量', group:'action' },
  yang: { key:'yang', name:'养生',   val:40,  xp:0, xpNext:100, lv:1, desc:'身体恢复力', group:'action' },
};

const ALL_PARAMS = { ...INPUTS, ...ACTIONS };

// ---------- 命途参数升级效果 ----------
const ACTION_LEVELUP_EFFECT = {
  yin:  { char: 2 },
  du:   { view: 2 },
  jing: { mind: 2 },
  gui:  { char: 1, mind: 1 },
  yang: { body: 2 },
};

// ---------- 十二宫公式 ----------
// 紫微十二宫：内宫（自己的事）暖色调；外宫（六亲+外部关系）冷色调
// 六内宫：命宫、财帛宫、疾厄宫、官禄宫、田宅宫、福德宫
// 六外宫：兄弟宫、夫妻宫、子女宫、交友宫、父母宫、迁移宫
const PALACE_GROUP = {
  // 六内宫（暖色调）
  'ming': 'inner',      // 命宫
  'caiBo': 'inner',     // 财帛宫
  'jiE': 'inner',       // 疾厄宫
  'guanLu': 'inner',    // 官禄宫
  'tianZhai': 'inner',  // 田宅宫
  'fuDe': 'inner',      // 福德宫
  // 六外宫（冷色调）
  'xiongDi': 'outer',   // 兄弟宫
  'fuQi': 'outer',      // 夫妻宫
  'ziNv': 'outer',      // 子女宫
  'jiaoYou': 'outer',   // 交友宫
  'fuMu': 'outer',      // 父母宫
  'qianYi': 'outer',    // 迁移宫
};

const PALACES = {
  ming: {
    name:'命宫', keys:['body','mind','view','char','ming'],
    weights:{ body:0.25, mind:0.25, view:0.25, char:0.10, ming:0.15 },
    desc:'整体状态与自我认知'
  },
  jiE: {
    name:'疾厄宫', keys:['body','mind','yang','ming'],
    weights:{ body:0.45, mind:0.15, yang:0.25, ming:0.15 },
    desc:'身体硬件与恢复力'
  },
  fuDe: {
    name:'福德宫', keys:['mind','view','du','jing'],
    weights:{ mind:0.35, view:0.25, du:0.25, jing:0.15 },
    desc:'精神世界丰富度'
  },
  caiBo: {
    name:'财帛宫', keys:['body','mind','view','char','yun'],
    weights:{ body:0.10, mind:0.20, view:0.25, char:0.15, yun:0.30 },
    desc:'财务心态与赚钱能力'
  },
  guanLu: {
    name:'官禄宫', keys:['body','mind','view','du','yun'],
    weights:{ body:0.10, mind:0.15, view:0.30, du:0.30, yun:0.15 },
    desc:'事业学业表现'
  },
  fuQi: {
    name:'夫妻宫', keys:['mind','view','char','yun','gui'],
    weights:{ mind:0.20, view:0.30, char:0.20, yun:0.20, gui:0.10 },
    desc:'亲密关系状态'
  },
  jiaoYou: {
    name:'交友宫', keys:['char','mind','gui','yin'],
    weights:{ char:0.30, mind:0.20, gui:0.35, yin:0.15 },
    desc:'社交质量与人际圈'
  },
  qianYi: {
    name:'迁移宫', keys:['body','mind','view','feng','yun'],
    weights:{ body:0.20, mind:0.20, view:0.20, feng:0.25, yun:0.15 },
    desc:'适应新环境能力'
  },
  tianZhai: {
    name:'田宅宫', keys:['body','mind','char','feng'],
    weights:{ body:0.20, mind:0.30, char:0.20, feng:0.30 },
    desc:'居家安全感'
  },
  fuMu: {
    name:'父母宫', keys:['mind','view','char','ming2'],
    weights:{ mind:0.30, view:0.20, char:0.25, ming2:0.25 },
    desc:'家庭关系与长辈缘'
  },
  ziNv: {
    name:'子女宫', keys:['mind','view','char','yun'],
    weights:{ mind:0.30, view:0.25, char:0.25, yun:0.20 },
    desc:'子女缘与创造力'
  },
  xiongDi: {
    name:'兄弟宫', keys:['char','mind','view','ming2'],
    weights:{ char:0.35, mind:0.25, view:0.20, ming2:0.20 },
    desc:'平辈关系与手足情'
  },
};

// ---------- 快捷操作 ----------
let QUICK_ACTIONS = [
  { id:'q1', label:'📖读书30分钟',  startTime:'20:00', endTime:'20:30', deltas:{ body:0, mind:0.1, view:0.5, char:0 }, actionKey:'du' },
  { id:'q2', label:'🛌早睡(23点前)', startTime:'22:30', endTime:'23:00', deltas:{ body:0.3, mind:0.2, view:0, char:0 }, actionKey:'yang' },
  { id:'q3', label:'🌙熬夜到12点后', startTime:'00:00', endTime:'01:00', deltas:{ body:-0.5, mind:-0.3, view:0, char:0 }, actionKey:'yang' },
  { id:'q4', label:'🚫拒绝不想去的社交', startTime:'18:00', endTime:'19:00', deltas:{ body:0, mind:0.3, view:0, char:0.2 }, actionKey:'gui' },
  { id:'q5', label:'🤝帮了别人小忙', startTime:'14:00', endTime:'14:30', deltas:{ body:0, mind:0.2, view:0, char:0.5 }, actionKey:'yin' },
  { id:'q6', label:'🍃发呆/散步/放空', startTime:'17:00', endTime:'17:30', deltas:{ body:0.1, mind:0.5, view:0, char:0 }, actionKey:'jing' },
  { id:'q7', label:'🍚好好吃了一顿饭', startTime:'12:00', endTime:'12:30', deltas:{ body:0.3, mind:0.1, view:0, char:0 }, actionKey:'yang' },
  { id:'q8', label:'😴没吃',         startTime:'',     endTime:'',     deltas:{ body:-0.5, mind:-0.25, view:0, char:0 }, actionKey:'yang' },
];

// ---------- 吃饭记录 ----------
let MEALS = { breakfast:true, lunch:true, dinner:true };

// ---------- 时间标签 ----------
let TIME_TAGS = ['早晨','上午','中午','下午','傍晚','晚上','深夜'];

// ---------- 技能树 ----------
let SKILLS = [
  { id:'s1', name:'写作', xp:0, xpNext:50, lv:1, desc:'文字输出能力' },
  { id:'s2', name:'编程', xp:0, xpNext:80, lv:1, desc:'代码与技术' },
  { id:'s3', name:'运动', xp:0, xpNext:60, lv:1, desc:'体能训练' },
  { id:'s4', name:'冥想', xp:0, xpNext:40, lv:1, desc:'内心平静' },
];

// ---------- 关系图谱 ----------
let RELATIONS = [
  { id:'r1', name:'家人', type:'家人', intimacy:80 },
  { id:'r2', name:'好友A', type:'朋友', intimacy:65 },
  { id:'r3', name:'同事B', type:'同事', intimacy:40 },
];

// ---------- 成就 ----------
let ACHIEVEMENTS = [
  { id:'a1', name:'身体破百', desc:'身体达到100', check:(d)=>d.body>=100, icon:'💪' },
  { id:'a2', name:'心态破百', desc:'心态达到100', check:(d)=>d.mind>=100, icon:'🧘' },
  { id:'a3', name:'三观破百', desc:'三观达到100', check:(d)=>d.view>=100, icon:'🧠' },
  { id:'a4', name:'人品破百', desc:'人品达到100', check:(d)=>d.char>=100, icon:'🌟' },
  { id:'a5', name:'连续记录7天', desc:'一周不断更', check:(d,log)=>{ const days=new Set(log.map(l=>l.date)); return days.size>=7; }, icon:'🔥' },
  { id:'a6', name:'读书Lv.5', desc:'读书操作升到5级', check:(d)=>ACTIONS.du.lv>=5, icon:'📚' },
  { id:'a7', name:'养生Lv.5', desc:'养生操作升到5级', check:(d)=>ACTIONS.yang.lv>=5, icon:'🌿' },
  { id:'a8', name:'积德+50', desc:'积阴德累计50', check:(d)=>ACTIONS.yin.val>=50, icon:'✨' },
  { id:'a9', name:'首次月报', desc:'生成第一份月报', check:(d)=>d._monthRepCount>=1, icon:'📅' },
  { id:'a10', name:'探索者', desc:'进入创造模式3次', check:(d)=>(d.createCount||0)>=3, icon:'🔧' },
  { id:'a11', name:'社交达人', desc:'交贵人升到3级', check:(d)=>ACTIONS.gui.lv>=3, icon:'🤝' },
  { id:'a12', name:'心流状态', desc:'心态达到90', check:(d)=>d.mind>=90, icon:'🌊' },
];

// ---------- 夸夸库（按类别） ----------
let PRAISE = {
  body: [
    '身体越来越结实了，像一棵扎根的大树！🌳',
    '你的精力值正在突破天际，太强了！🚀',
    '体质进化中，肉眼可见的变强！💪',
    '你简直是行走的能量源！⚡',
    '身体的每一次升级，都是你自律的勋章！🏅',
    '肌肉记忆在重塑，身体在进化！🔥',
    '你的体质已经超越了昨天的自己！🌟',
  ],
  mind: [
    '心态稳如磐石，风雨不动安如山！🏔️',
    '你的内心世界越来越辽阔了！🌊',
    '情绪掌控力MAX，这就是高手！🎯',
    '你的心灵正在发光，照亮自己也照亮别人！✨',
    '心态这一块，你已经封神了！👑',
    '负面情绪已被你转化为燃料！🔄',
    '你的内心像深海一样宁静而有力！🐋',
  ],
  view: [
    '三观在重塑，认知在跃迁！🧠',
    '你看世界的眼光越来越通透了！🔍',
    '思想的深度，决定了人生的高度！⛰️',
    '你的认知系统正在自动升级！⬆️',
    '通透的人生，从升级三观开始！🌈',
    '你在用更高的维度理解世界！🌌',
    '认知的边界在无限扩展！🚀',
  ],
  char: [
    '人品这一块，你就是天花板！🏛️',
    '守诺重信，这就是你的金字招牌！🥇',
    '人品升级，吸引力也在升级！🧲',
    '你的品格正在发光，周围人都感受得到！☀️',
    '人品值爆表，行走的正能量！⭐',
    '信任值满格，你是别人生命中的贵人！🤲',
  ],
  skill: [
    '技能点亮中，你就是自己的导师！🎓',
    '每一步精进，都是未来的伏笔！📝',
    '技能树在生长，未来可期！🌱',
    '你正在成为你想成为的那个人！🦋',
    '技能满点，前途无量！🏆',
    '量变正在催生质变！⚗️',
  ],
  action: [
    '操作项升级！你在主动塑造自己的命运！🎮',
    '每一点积累，都在改变轨迹！🛤️',
    '执行力拉满，这就是你的超能力！💥',
    '你在用行动书写自己的传奇！📖',
    '升级了！继续向前，没有上限！♾️',
    '你正在成为命运的主宰者！👑',
  ],
};

// ---------- 主题色 ----------
let THEME = {
  primary:'#7c3aed', primaryLight:'#a78bfa', primaryBg:'#f5f3ff',
  barFill:'#7c3aed', barBg:'#e9d5ff',
  highlight:'#f59e0b', highlightText:'#b45309',
  bg:'#f5f3ff', card:'#ffffff',
};

// ---------- 头像 ----------
let AVATAR = { dataUrl:null, size:90 };

// ---------- 每日衰减 ----------
let DECAY = { body:0.1, mind:0.1, view:0.01, char:0.01 };

// ---------- 日志 / 记录 ----------
let LOG = [];
let PARAM_LOG = [];
let CREATE_LOG = [];
let LEVEL_LOG = [];
let SKILL_LOG = [];

// ---------- 版本号 ----------
let VERSION = '6.0.0';
let VERSION_COUNT = 0;
let CHAR_NAME = 'L';

// ---------- 系统状态阈值 ----------
const THRESHOLDS = {
  body_low: 50, mind_high: 90, view_high: 80, char_low: 60,
};

/* ========== 英文对照表 ==========
   body  = 身体         mind  = 心态
   view  = 三观         char  = 人品（character缩写）
   ming  = 命（先天）    yun   = 运
   feng  = 风水         ming2 = 名（名声标签，ming已被占用所以加2）
   xiang = 相（气质）    yin   = 积阴德
   du    = 读书         jing  = 敬神
   gui   = 交贵人        yang  = 养生
   s1~s4 = 技能ID       r1~r3 = 关系ID
   a1~a12= 成就ID       q1~q8 = 快捷操作ID
*/

// ---------- 初始化 / 加载 ----------
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return getDefaults();
    const d = JSON.parse(raw);
    return Object.assign(getDefaults(), d);
  }catch(e){ return getDefaults(); }
}

function ensureFields(){
  if(!DATA.createPwd) DATA.createPwd = '2626';
  if(!DATA.createCount) DATA.createCount = 0;
  if(!DATA.levelLog) DATA.levelLog = [];
  if(!DATA.createLog) DATA.createLog = [];
  if(!DATA.paramLog) DATA.paramLog = [];
  if(!DATA.skillLog) DATA.skillLog = [];
  if(!DATA._monthRepCount) DATA._monthRepCount = 0;
  if(!DATA.palaceGroup) DATA.palaceGroup = PALACE_GROUP;
}
function getDefaults(){
  return {
    roots: clone(ROOTS),
    inputs: clone(INPUTS),
    actions: clone(ACTIONS),
    palaces: clone(PALACES),
    quickActions: clone(QUICK_ACTIONS),
    meals: clone(MEALS),
    timeTags: clone(TIME_TAGS),
    skills: clone(SKILLS),
    relations: clone(RELATIONS),
    achievements: clone(ACHIEVEMENTS),
    praise: clone(PRAISE),
    theme: clone(THEME),
    avatar: clone(AVATAR),
    decay: clone(DECAY),
    log: clone(LOG),
    paramLog: clone(PARAM_LOG),
    createLog: clone(CREATE_LOG),
    levelLog: clone(LEVEL_LOG),
    skillLog: clone(SKILL_LOG),
    version: VERSION,
    versionCount: VERSION_COUNT,
    charName: CHAR_NAME,
    thresholds: clone(THRESHOLDS),
    createCount: 0,
    createPwd: '2626',
    _monthRepCount: 0,
    palaceGroup: clone(PALACE_GROUP),
  };
}
function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
}

let DATA = loadData();
ensureFields();
if(!DATA.createPwd) DATA.createPwd = '2626';

// ---------- 工具：获取等级 ----------
function getLevel(val){
  const safeVal = Math.max(0, val||0);
  const lv = Math.floor(safeVal / 100) + 1;
  const rem = safeVal % 100;
  let tier=0, label='成长中', color='#dc2626', emoji='🔴';
  if(rem < 50){      tier=0; label='成长中';   color='#dc2626'; emoji='🔴'; }
  else if(rem < 75){ tier=1; label='稳步提升'; color='#f97316'; emoji='🟠'; }
  else {              tier=2; label='接近下一阶'; color='#eab308'; emoji='🟡'; }
  if(lv >= 5){             color='#f59e0b'; emoji='👑'; label='传奇'; }
  else if(lv >= 4){        color='#ec4899'; emoji='🌸'; label='超凡'; }
  else if(lv >= 3){        color='#8b5cf6'; emoji='🟣'; label='卓越'; }
  else if(lv >= 2 && rem >= 50){ color='#22c55e'; emoji='🟢'; label='良好'; }
  return { tier, lv, label, color, emoji, score:Math.round(safeVal*10)/10 };
}

// ---------- 日期工具 ----------
function todayStr(){ return new Date().toISOString().slice(0,10); }
function nowTime(){ return new Date().toTimeString().slice(0,5); }
function fmtDate(d){ return d||todayStr(); }

// ---------- 获取自定义等级名 ----------
function getLevelName(type, key, lv){
  let arr = [];
  if(type==='root' && DATA.roots[key] && DATA.roots[key].levelNames) arr = DATA.roots[key].levelNames;
  else if(type==='action' && DATA.actions[key] && DATA.actions[key].levelNames) arr = DATA.actions[key].levelNames;
  else if(type==='palace' && DATA.palaces[key] && DATA.palaces[key].levelNames) arr = DATA.palaces[key].levelNames;
  if(arr.length >= lv) return arr[lv-1];
  return '';
}
