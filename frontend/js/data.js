/* ============================================================
   SAARTHI · data.js
   Seed data + localStorage bootstrap (acts as our database
   until MongoDB in the final MERN version)
   Syllabus: Objects, Arrays, JSON, Local Storage (T15–16, 23)
   ============================================================ */

// ---------- 11 Departments (code drives the application number) ----------
// slaHours: Police & Fire are emergency services — 24-hour resolution window.
// Every other department keeps the standard 36-hour window.
const DEPARTMENTS = [
  { code:'01', id:'police',      name:'Police',                       ico:'🛡️', designation:'DSP',                 officer:'DSP Harjinder Singh Gill',    phone:'01762-224100', office:'District Police Office, Civil Lines, Rajpura',        higher:'SP, Patiala (Rural)',              slaHours:24, emergency:true },
  { code:'02', id:'fire',        name:'Fire Services',                ico:'🚒', designation:'Fire Officer',        officer:'FO Rakesh Verma',             phone:'01762-224101', office:'Fire Station, Grand Trunk Road, Rajpura',              higher:'Divisional Fire Officer, Patiala', slaHours:24, emergency:true },
  { code:'03', id:'health',      name:'Health',                       ico:'🏥', designation:'SMO',                 officer:'SMO Dr. Navneet Kaur',        phone:'01762-224102', office:'Civil Hospital, Rajpura',                               higher:'Civil Surgeon, Patiala',           slaHours:36, emergency:false },
  { code:'04', id:'pwd',        name:'PWD (B&R)',                    ico:'🛣️', designation:'Xen',                 officer:'Xen Amandeep Sharma',         phone:'01762-224103', office:'PWD (B&R) Office, Civil Lines, Rajpura',                higher:'SE, PWD Circle Patiala',           slaHours:36, emergency:false },
  { code:'05', id:'electricity', name:'Electricity (PSPCL)',          ico:'⚡', designation:'Xen',                 officer:'Xen Gurpreet Singh',          phone:'01762-224104', office:'PSPCL Sub-Division Office, Rajpura',                    higher:'SE, PSPCL Patiala Circle',         slaHours:36, emergency:false },
  { code:'06', id:'municipal',   name:'Municipal Council',            ico:'🏛️', designation:'Executive Officer',   officer:'EO Sanjeev Kumar Bansal',     phone:'01762-224105', office:'Municipal Council Office, Model Town, Rajpura',        higher:'President, MC Rajpura',            slaHours:36, emergency:false },
  { code:'07', id:'irrigation',  name:'Irrigation',                   ico:'🌊', designation:'Xen',                 officer:'Xen Ravinder Pal Singh',      phone:'01762-224106', office:'Irrigation Rest House, Rajpura',                        higher:'SE, Irrigation Circle',            slaHours:36, emergency:false },
  { code:'08', id:'water',       name:'Water Supply & Sanitation',    ico:'🚰', designation:'Xen',                 officer:'Xen Manpreet Kaur Sidhu',     phone:'01762-224107', office:'WSS Sub-Division Office, Rajpura',                      higher:'SE, WSS Circle Patiala',           slaHours:36, emergency:false },
  { code:'09', id:'animal',      name:'Animal Husbandry',             ico:'🐄', designation:'Veterinary Officer',  officer:'VO Dr. Jaspal Singh',         phone:'01762-224108', office:'Veterinary Hospital, Rajpura',                          higher:'Deputy Director, AH Patiala',      slaHours:36, emergency:false },
  { code:'10', id:'food',        name:'Food & Safety',                ico:'🍎', designation:'DFO',                 officer:'DFO Ritu Aggarwal',           phone:'01762-224109', office:'Food & Safety Office, Mini Secretariat, Patiala',       higher:'Joint Commissioner, FDA Punjab',   slaHours:36, emergency:false },
  { code:'11', id:'industry',    name:'Industry',                     ico:'🏭', designation:'Xen',                 officer:'Xen Vikram Jindal',           phone:'01762-224110', office:'District Industries Centre, Patiala',                   higher:'GM, District Industries Centre',   slaHours:36, emergency:false },
  { code:'13', id:'transport',  name:'Transport',                    ico:'🚌', designation:'District Transport Officer', officer:'DTO (district)',       phone:'0175-2300000', office:'District Transport Office',                            higher:'Director, State Transport, Punjab', slaHours:36, emergency:false },
  { code:'14', id:'finance', name:'Finance', ico:'💰', designation:'Treasury Officer', officer:'District Treasury Officer', phone:'0175-2300100', office:'District Treasury Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'15', id:'planning', name:'Planning', ico:'🗺️', designation:'Planning Officer', officer:'District Planning Officer', phone:'0175-2300101', office:'District Planning Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'16', id:'excise', name:'Excise & Taxation', ico:'🧾', designation:'Excise & Taxation Officer', officer:'Deputy Excise & Taxation Commissioner', phone:'0175-2300102', office:'Deputy Excise & Taxation Commissioner, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'17', id:'grievances', name:'Governance Reforms & Public Grievances', ico:'📣', designation:'Grievance Nodal Officer', officer:'District Grievance Officer', phone:'0175-2300103', office:'District Grievance Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'18', id:'employment', name:'Employment Generation & Training', ico:'💼', designation:'Employment Counsellor', officer:'District Employment Generation Officer', phone:'0175-2300104', office:'District Employment Generation Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'19', id:'social-justice', name:'Social Justice & Women Empowerment', ico:'⚖️', designation:'Programme Officer', officer:'District Social Security Officer', phone:'0175-2300105', office:'District Social Security Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'20', id:'jails', name:'Jails', ico:'⛓️', designation:'Deputy Superintendent', officer:'Superintendent, District Jail', phone:'0175-2300106', office:'Superintendent, District Jail, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'21', id:'food-processing', name:'Food Processing', ico:'🥫', designation:'Food Processing Inspector', officer:'District Food Processing Officer', phone:'0175-2300107', office:'District Food Processing Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'22', id:'agriculture', name:'Agriculture & Farmer Welfare', ico:'🌾', designation:'Agriculture Development Officer', officer:'Chief Agriculture Officer', phone:'0175-2300108', office:'Chief Agriculture Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'23', id:'fisheries-dairy', name:'Fisheries & Dairy Development', ico:'🐟', designation:'Dairy Development Inspector', officer:'Deputy Director, Dairy & Fisheries', phone:'0175-2300109', office:'Deputy Director, Dairy & Fisheries, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'24', id:'defence-welfare', name:'Defence Services Welfare', ico:'🎖️', designation:'Welfare Organiser', officer:'District Sainik Welfare Officer', phone:'0175-2300110', office:'District Sainik Welfare Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'25', id:'freedom-fighters', name:'Freedom Fighters', ico:'🕊️', designation:'Welfare Inspector', officer:'District Freedom Fighters Officer', phone:'0175-2300111', office:'District Freedom Fighters Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'26', id:'horticulture', name:'Horticulture', ico:'🍊', designation:'Horticulture Development Officer', officer:'Deputy Director, Horticulture', phone:'0175-2300112', office:'Deputy Director, Horticulture, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'27', id:'rural-dev', name:'Rural Development & Panchayats', ico:'🏡', designation:'Block Development & Panchayat Officer', officer:'Additional Deputy Commissioner (Development)', phone:'0175-2300113', office:'Additional Deputy Commissioner (Development), District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'28', id:'labour', name:'Labour', ico:'👷', designation:'Labour Inspector', officer:'District Labour Officer', phone:'0175-2300114', office:'District Labour Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'29', id:'tourism', name:'Tourism & Cultural Affairs', ico:'🏰', designation:'Tourism Development Officer', officer:'District Tourism Officer', phone:'0175-2300115', office:'District Tourism Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'30', id:'mining', name:'Mining & Geology', ico:'⛏️', designation:'Mining Inspector', officer:'District Mining Officer', phone:'0175-2300116', office:'District Mining Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'31', id:'revenue', name:'Revenue, Rehabilitation & Disaster Management', ico:'📜', designation:'Tehsildar', officer:'District Revenue Officer', phone:'0175-2300117', office:'District Revenue Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'32', id:'housing', name:'Housing & Urban Development', ico:'🏘️', designation:'Estate Officer', officer:'Chief Administrator, Development Authority', phone:'0175-2300118', office:'Chief Administrator, Development Authority, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'33', id:'nri', name:'NRI Affairs', ico:'✈️', designation:'NRI Assistant', officer:'District NRI Affairs Officer', phone:'0175-2300119', office:'District NRI Affairs Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false },
  { code:'34', id:'investment', name:'Investment Promotion', ico:'📈', designation:'Industry Facilitation Officer', officer:'District Investment Promotion Officer', phone:'0175-2300120', office:'District Investment Promotion Officer, District Administrative Complex', higher:'Secretary, Punjab Government', slaHours:48, emergency:false }
];
// Complaints addressed directly to the ward MC use this pseudo-department
const MC_DEPT = { code:'12', id:'mc-office', name:'Municipal Councillor (Ward Office)', ico:'🤝', slaHours:36 };

// ---------- 20 Wards of Rajpura and their Municipal Councillors ----------
const MC_NAMES = [
  'Baldev Singh Sandhu','Kuldeep Kaur Brar','Rajesh Goyal','Harpreet Singh Chahal','Sunita Rani',
  'Gurmail Singh','Neelam Sharma','Jagtar Singh Dhillon','Poonam Gupta','Sukhwinder Singh Sukhi',
  'Anita Devi','Balwinder Singh Billa','Kiran Bala','Manjit Singh Grewal','Rekha Rani',
  'Tarsem Lal','Sarabjit Kaur','Ashok Kumar Mittal','Paramjit Singh Pamma','Veena Kumari'
];
const WARDS = MC_NAMES.map((name, i) => ({
  ward: i + 1,
  mcName: name,
  phone: '98' + String(72000000 + i * 137).slice(0, 8),
  office: `Ward ${i + 1} Office, Municipal Council, Rajpura`,
}));

function citizenById(id){ return DB.get('users').find(u => u.id === id); }

const CITY = 'Rajpura';
const STATUS = {
  SUBMITTED:'Submitted', RECEIVED:'Received by Department', REVIEW:'Under Review',
  ASSIGNED:'Officer Assigned', PROGRESS:'In Progress', RESOLVED:'Resolved',
  CLOSED:'Closed', REOPENED:'Reopened'
};
const SLA_HOURS = 36; // fallback default (used for mc-office and any dept missing slaHours)


// (The DB driver lives in js/api.js — records are stored in MongoDB through the Saarthi API.)

// ============================================================
// Punjab-wide structure:  State → District → ULB (corporation / council /
// nagar panchayat) → Ward.  Departments are statewide; their officers are
// posted per district.  Every employee carries a permanent roll ID and a
// posting history.
// ============================================================
const DEFAULT_DISTRICT = 'patiala', DEFAULT_ULB = 'rajpura';
const SCHEMA_VERSION = 35;
const _h = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const _FIRST_M = ['Gurpreet','Harjinder','Manpreet','Jaswinder','Amarjit','Sukhdev','Rajinder','Balwinder','Kuldeep','Navdeep','Simranjit','Parminder','Harpreet','Gurmeet','Ravinder','Jagdeep','Amandeep','Sandeep','Baljit','Lakhwinder','Davinder','Inderjit','Charanjit','Tejinder','Satnam','Rupinder','Karamjit','Mandeep','Surinder','Paramjit'];
const _FIRST_F = ['Harleen','Jasleen','Navneet','Ritu','Kiranjot','Amrita','Simran','Rajwinder','Preeti','Sukhpreet'];
const _CLAN = ['Sandhu','Gill','Brar','Dhillon','Sidhu','Grewal','Bajwa','Randhawa','Cheema','Virk','Sharma','Verma','Garg','Bansal','Jindal','Mittal','Aggarwal','Chauhan','Kang','Mann'];
const _demoName = seed => { const h = _h(seed); const f = h % 5 === 0; return f ? `${_FIRST_F[(h >>> 3) % _FIRST_F.length]} Kaur ${_CLAN[(h >>> 7) % _CLAN.length]}` : `${_FIRST_M[(h >>> 3) % _FIRST_M.length]} Singh ${_CLAN[(h >>> 7) % _CLAN.length]}`; };
const _demoPhone = seed => '9' + String(100000000 + (_h('p' + seed) % 899999999)).slice(0, 9);

// Only these departments get two starter employees in every district; admins add the rest.
const SEED_DEPTS = ['police','electricity','municipal'];
// Two-tier district hierarchy used when a district is first set up (rank 1 = top).
const DEPT_TIERS = {
  police:['SSP','DSP'], fire:['Divisional Fire Officer','Fire Officer'], health:['Civil Surgeon','Senior Medical Officer'],
  pwd:['Superintending Engineer (B&R)','Executive Engineer'], electricity:['Superintending Engineer (PSPCL)','Executive Engineer'],
  municipal:['Additional Deputy Commissioner (Urban Development)','Executive Officer'], irrigation:['Superintending Engineer (Irrigation)','Executive Engineer'],
  water:['Superintending Engineer (WSS)','Executive Engineer'], animal:['Deputy Director, Animal Husbandry','Veterinary Officer'],
  food:['Assistant Commissioner (Food)','District Food Safety Officer'], industry:['General Manager, DIC','Industry Development Officer'],
  transport:['District Transport Officer','Assistant Transport Officer'],
  'finance':['District Treasury Officer','Treasury Officer'],
  'planning':['District Planning Officer','Planning Officer'],
  'excise':['Deputy Excise & Taxation Commissioner','Excise & Taxation Officer'],
  'grievances':['District Grievance Officer','Grievance Nodal Officer'],
  'employment':['District Employment Generation Officer','Employment Counsellor'],
  'social-justice':['District Social Security Officer','Programme Officer'],
  'jails':['Superintendent, District Jail','Deputy Superintendent'],
  'food-processing':['District Food Processing Officer','Food Processing Inspector'],
  'agriculture':['Chief Agriculture Officer','Agriculture Development Officer'],
  'fisheries-dairy':['Deputy Director, Dairy & Fisheries','Dairy Development Inspector'],
  'defence-welfare':['District Sainik Welfare Officer','Welfare Organiser'],
  'freedom-fighters':['District Freedom Fighters Officer','Welfare Inspector'],
  'horticulture':['Deputy Director, Horticulture','Horticulture Development Officer'],
  'rural-dev':['Additional Deputy Commissioner (Development)','Block Development & Panchayat Officer'],
  'labour':['District Labour Officer','Labour Inspector'],
  'tourism':['District Tourism Officer','Tourism Development Officer'],
  'mining':['District Mining Officer','Mining Inspector'],
  'revenue':['District Revenue Officer','Tehsildar'],
  'housing':['Chief Administrator, Development Authority','Estate Officer'],
  'nri':['District NRI Affairs Officer','NRI Assistant'],
  'investment':['District Investment Promotion Officer','Industry Facilitation Officer']
};

// ---------- Employee / officer records ----------
function _posting(o, from, to, extra){
  return Object.assign({ district:o.district, dept:o.dept, designation:o.designation, rank:o.rank, office:o.office || '', from, to:to || null }, extra || {});
}
function _newEmpId(joinTs){
  const yy = String(new Date(joinTs || Date.now()).getFullYear()).slice(2);
  return `PB-${yy}-${String(DB.nextEmpSeq()).padStart(6, '0')}`;
}
// Seed the whole hierarchy of one department in one district (demo placeholders, clearly marked).
function _seedDistrictDept(deptId, did, out){
  const tiers = DEPT_TIERS[deptId]; if (!tiers) return;
  const dname = districtName(did);
  const mk = (rank, designation, extra) => {
    const key = `${did}|${deptId}|${rank}|${(extra && extra.depotId) || ''}`;
    const joined = Date.now() - (200 + _h('j' + key) % 2300) * 864e5;
    const o = Object.assign({
      id: 'OFF_' + _slug(key), dept: deptId, district: did, designation, name: _demoName(key), phone: _demoPhone(key),
      office: `${designation} Office, ${dname}`, password: 'officer@123', rank, blocked: false, demo: true, joinedAt: joined
    }, extra || {});
    o.empId = _newEmpId(joined);
    const postings = [];
    if (_h('prev' + key) % 10 < 3) { // ~30% of demo staff also carry one earlier posting, to show history
      const others = allDistricts().filter(d => d.id !== did); const pd = others[_h('pd' + key) % others.length];
      const start = joined - (400 + _h('ps' + key) % 800) * 864e5;
      postings.push(_posting(Object.assign({}, o, { district: pd.id, rank: Math.min(rank + 1, 3), designation: tiers[Math.min(rank, 1)], office: `${tiers[Math.min(rank, 1)]} Office, ${pd.name}` }), start, joined, { orderNo: 'DEMO-' + (_h(key) % 9000 + 1000), reason: 'Demo record' }));
    }
    postings.push(_posting(o, joined, null, { orderNo: 'DEMO-' + (_h('o' + key) % 9000 + 1000), reason: 'Initial posting (demo record)' }));
    o.postings = postings;
    out.push(o);
  };
  mk(1, tiers[0]);
  if (deptId === 'transport') {
    const depots = depotsOfDistrict(did);
    if (depots.length) depots.forEach(dp => mk(2, `Depot General Manager — ${dp.name} (${OPERATOR_LABEL[dp.operator]})`, { depotId: dp.id }));
    else mk(2, tiers[1]);
  } else mk(2, tiers[1]);
}

// ---------- Departments (built-in + admin-added, combined) ----------
const allDepartments = () => DEPARTMENTS.concat(DB.get('customDepartments'));
const deptById = id => allDepartments().find(d => d.id === id) || (id === 'mc-office' ? MC_DEPT : null);
const deptSlaHours = id => (deptById(id) && deptById(id).slaHours) || SLA_HOURS;
const holdDept = c => c.holdDept || c.dept;   // department whose officer currently holds the file

// ---------- Wards & councillors (per ULB) ----------
const mcOf = (ulb, ward) => DB.get('mcs').find(m => (m.ulb || DEFAULT_ULB) === ulb && m.ward === Number(ward));
// wardByNo() reads the LIVE record from DB.mcs (editable by Administrators / EO). A ward with no
// registered councillor comes back with vacant:true so every screen can say so honestly.
const wardByNo = (no, ulb) => {
  ulb = ulb || (Session.current() && Session.current().ulb) || DEFAULT_ULB;
  const live = mcOf(ulb, no);
  const seed = ulb === DEFAULT_ULB ? WARDS.find(w => w.ward === Number(no)) : null;
  const uname = ulbName(ulb);
  if (live) return { ward:Number(no), ulb, mcName:live.name, name:live.name, phone:live.phone, office:live.office || `Ward ${no} Office, ${uname}`, blocked:live.blocked, vacant:false };
  if (seed) return { ...seed, ulb, vacant:false };
  return { ward:Number(no), ulb, mcName:'Councillor not yet registered', name:'Councillor not yet registered', phone:'—', office:`Ward ${no} Office, ${uname}`, blocked:false, vacant:true };
};

// ---------- Officer lookups (district-aware; omit district for "anywhere") ----------
const officersByDept = (deptId, district) => DB.get('officers')
  .filter(o => o.dept === deptId && (!district || o.district === district))
  .sort((a,b) => (a.rank||9) - (b.rank||9));
const officersInDistrict = did => DB.get('officers').filter(o => o.district === did);
const officerByDept = (deptId, district) => {
  const seed = deptById(deptId);
  const head = officersByDept(deptId, district)[0];
  if (!seed) return head;
  return head ? { ...seed, officer: head.name, phone: head.phone, office: head.office || seed.office, designation: head.designation } : seed;
};

// ---------- Admin actions: create departments & build hierarchy ----------
function addDepartment({ name, ico, designation, emergency, officerName, officerPhone, office, district, photo, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const code = DB.nextDeptCode();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dept' + code;
  const dept = { code, id, name, ico: ico || '🏢', designation, higher: 'District Grievance Officer', slaHours: emergency ? 24 : 36, emergency: !!emergency, office, custom: true };
  if (photo) dept.photo = photo;   // resized JPEG data-URL, stored with the department so it survives redeploys
  const customs = DB.get('customDepartments'); customs.push(dept); DB.set('customDepartments', customs);
  const officer = createEmployee({ name: officerName, phone: officerPhone, dept: id, district: district || DEFAULT_DISTRICT, designation, rank: 1, office, by });
  return { dept, officer };
}
function addOfficerToDept({ dept, designation, name, phone, office, rank, district, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  district = district || DEFAULT_DISTRICT;
  return createEmployee({ name, phone, dept, district, designation, rank: rank || (officersByDept(dept, district).length + 1), office, by });
}

// Register a new employee: permanent roll ID + first posting + login (default password officer@123).
function createEmployee({ name, phone, dept, district, designation, rank, office, depotId, tehsil, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const officers = DB.get('officers');
  const now = Date.now();
  const o = {
    id: 'OFF' + now + Math.floor(Math.random() * 999), dept, district, designation, name, phone,
    office: office || `${designation} Office, ${districtName(district)}`, password: 'officer@123', rank: Number(rank) || 1, blocked: false,
    joinedAt: now, createdBy: by ? { role: by.role, name: by.name, at: now } : null
  };
  if (depotId) o.depotId = depotId;
  if (tehsil && (tehsilById(tehsil) || {}).district === district) o.tehsil = tehsil;
  o.empId = _newEmpId(now);
  o.postings = [_posting(o, now, null, { orderNo: 'JOIN-' + o.empId.slice(-6), reason: 'Initial appointment', by: by ? `${by.name}` : 'System' })];
  officers.push(o); DB.set('officers', officers);
  return o;
}

// Transfer / re-post an employee. Closes the current posting and opens a new one, keeping history.
// Files the employee was holding are handed to the next officer in the old hierarchy.
function transferEmployee({ officerId, toDistrict, toDept, toDesignation, toRank, toOffice, toTehsil, orderNo, reason, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const officers = DB.get('officers'); const o = officers.find(x => x.id === officerId);
  if (!o) throw new Error('Employee not found.');
  const now = Date.now();
  const prev = { district:o.district, dept:o.dept, designation:o.designation, rank:o.rank };
  const cur = (o.postings || []).find(p => !p.to); if (cur) cur.to = now;
  o.district = toDistrict || o.district; o.dept = toDept || o.dept;
  o.designation = toDesignation || o.designation; o.rank = Number(toRank) || o.rank;
  o.office = toOffice || `${o.designation} Office, ${districtName(o.district)}`;
  delete o.depotId; delete o.tehsil;
  if (toTehsil && (tehsilById(toTehsil) || {}).district === o.district) o.tehsil = toTehsil;
  (o.postings = o.postings || []).push(_posting(o, now, null, { orderNo: orderNo || ('TR-' + now.toString().slice(-6)), reason: reason || '', by: by ? `${by.name} (${by.title || by.role})` : '' }));
  DB.set('officers', officers);
  const log = DB.get('transfers');
  log.push({ id:'TR' + now, empId:o.empId, officerId:o.id, name:o.name, from:prev, to:{ district:o.district, dept:o.dept, designation:o.designation, rank:o.rank }, orderNo:o.postings[o.postings.length-1].orderNo, reason:reason || '', by: by ? by.name : '', byRole: by ? by.role : '', at: now });
  DB.set('transfers', log);
  _handOverFiles(o.id, prev);
  return o;
}
// Files still sitting with a transferred / suspended officer move to the nearest officer left in the
// old post. `why` words the timeline entry. With opts.force the "same post" shortcut is skipped.
function _handOverFiles(officerId, prev, opts){
  opts = opts || {}; const why = opts.why || 'transferred';
  const list = DB.get('complaints'); let changed = false;
  const now = DB.get('officers').find(x => x.id === officerId) || {};
  list.forEach(c => {
    if (c.currentOfficerId !== officerId || [STATUS.RESOLVED, STATUS.CLOSED].includes(c.status)) return;
    if (!opts.force && prev.district === now.district && prev.dept === now.dept) return; // same dept & district: still theirs
    const pool = officersByDept(prev.dept, prev.district).filter(x => x.id !== officerId && !x.blocked);
    const target = pool.filter(x => x.rank >= prev.rank)[0] || pool[pool.length - 1] || null;
    if (target) {
      c.currentOfficerId = target.id; c.level = target.rank; c.levelStartedAt = Date.now();
      c.timeline.push({ status:'Reassigned', note:`Previous officer was ${why}. File reassigned to ${target.name} (${target.designation}).`, by:'Saarthi System', at: Date.now() });
    } else {
      c.currentOfficerId = null; c.level = 'dc'; c.escalatedToDC = true; c.escalated = true; c.levelStartedAt = Date.now();
      c.timeline.push({ status:'Escalated', note:`Previous officer was ${why} and no officer remains in that post. File escalated to the Deputy Commissioner.`, by:'Saarthi System', at: Date.now() });
      systemAlert('dc', `Grievance ${c.appNo} has no officer left in its post after a ${why === 'suspended' ? 'suspension' : 'transfer'} and has come to your desk.`, c.appNo, c.district);
    }
    changed = true;
  });
  if (changed) DB.set('complaints', list);
}

// ---------- Positions (ranks) a District Administrator can create ----------
// A position is (district, dept, rank, title). Positions that already have officers are implied;
// explicit ones let an administrator create a rank before anybody holds it.
function positionsOf(deptId, district){
  const byRank = {};
  DB.get('positions').filter(p => p.dept === deptId && p.district === district).forEach(p => { byRank[p.rank] = { rank:p.rank, title:p.title, officers:[] }; });
  officersByDept(deptId, district).forEach(o => { const r = o.rank || 1; (byRank[r] = byRank[r] || { rank:r, title:o.designation, officers:[] }).officers.push(o); });
  return Object.values(byRank).sort((a,b) => a.rank - b.rank);
}
// Create a position at `rank`; if `insert`, everything at that rank or more junior moves one step down.
function addPosition({ dept, district, rank, title, insert }){
  rank = Number(rank);
  if (insert) {
    const officers = DB.get('officers');
    officers.forEach(o => { if (o.dept === dept && o.district === district && o.rank >= rank) o.rank++; });
    DB.set('officers', officers);
    const ps = DB.get('positions'); ps.forEach(p => { if (p.dept === dept && p.district === district && p.rank >= rank) p.rank++; }); DB.set('positions', ps);
    // keep files in flight pointing at the same people
    const cs = DB.get('complaints'); const offs = DB.get('officers');
    cs.forEach(c => { const o = offs.find(x => x.id === c.currentOfficerId); if (o) c.level = o.rank; }); DB.set('complaints', cs);
  }
  const ps = DB.get('positions').filter(p => !(p.dept === dept && p.district === district && p.rank === rank));
  ps.push({ id:'POS' + Date.now(), dept, district, rank, title }); DB.set('positions', ps);
}
function removePosition({ dept, district, rank }){
  if (officersByDept(dept, district).some(o => o.rank === rank)) return false;
  DB.set('positions', DB.get('positions').filter(p => !(p.dept === dept && p.district === district && p.rank === rank)));
  return true;
}
function renamePosition({ dept, district, rank, title }){
  const ps = DB.get('positions').filter(p => !(p.dept === dept && p.district === district && p.rank === rank));
  ps.push({ id:'POS' + Date.now(), dept, district, rank, title }); DB.set('positions', ps);
  const officers = DB.get('officers'); officers.forEach(o => { if (o.dept === dept && o.district === district && o.rank === rank) o.designation = title; }); DB.set('officers', officers);
}

// ---------- Inter-departmental reporting rules (set by the District Administrator) ----------
// "When <from> exhausts its own hierarchy without resolving a file, the file reports to the top
//  officer of <to> before it goes on to the Deputy Commissioner."
const rulesOf = district => DB.get('rules').filter(r => r.district === district);
const ruleFor = (district, fromDept) => rulesOf(district).find(r => r.from === fromDept);
function addRule({ district, from, to, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  if (from === to) return { ok:false, msg:'A department cannot report to itself.' };
  if (!officersByDept(to, district).length) return { ok:false, msg:`${deptById(to).name} has no officer in ${districtName(district)} to receive files.` };
  const rules = DB.get('rules').filter(r => !(r.district === district && r.from === from));
  // refuse loops: following the chain from `to` must never come back to `from`
  let cur = to, guard = 0;
  while (cur && guard++ < 30) { if (cur === from) return { ok:false, msg:'That would create a circular reporting loop.' }; const r = rules.find(x => x.district === district && x.from === cur); cur = r && r.to; }
  rules.push({ id:'RL' + Date.now(), district, from, to, by: by || '', at: Date.now() });
  DB.set('rules', rules);
  return { ok:true };
}
const removeRule = id => DB.set('rules', DB.get('rules').filter(r => r.id !== id));

// ---------- Escalation hierarchy ----------
// Rank convention: 1 = the top position in a department (most senior — e.g. an SSP),
// and higher numbers are more junior (first point of contact for a new complaint).
// A new complaint starts with the most junior available officer; if they can't resolve
// it in time it climbs toward rank 1, then — if the District Administrator has set a reporting
// rule for that department — to the department it reports to, then to the Deputy Commissioner
// of the district, then to the Chief Minister's Office.
// Suspended / blocked officers never receive files: every hierarchy lookup below skips them.
const _active = list => list.filter(o => !o.blocked);
const frontLineOfficer = (deptId, district) => { const list = _active(officersByDept(deptId, district)); return list[list.length - 1]; };
const topOfficerOfDept = (deptId, district) => _active(officersByDept(deptId, district))[0];
const officerById = id => DB.get('officers').find(o => o.id === id);
const seniorTierOfficers = (deptId, currentRank, district) => {
  const lower = _active(officersByDept(deptId, district)).filter(o => o.rank < currentRank);
  if (!lower.length) return [];
  const target = Math.max(...lower.map(o => o.rank));
  return lower.filter(o => o.rank === target);
};
const juniorTierOfficers = (deptId, currentRank, district) => {
  const higher = _active(officersByDept(deptId, district)).filter(o => o.rank > currentRank);
  if (!higher.length) return [];
  const target = Math.min(...higher.map(o => o.rank));
  return higher.filter(o => o.rank === target);
};

function systemAlert(toRole, message, appNo, district){
  const alerts = DB.get('systemAlerts');
  alerts.push({ id:'AL'+Date.now()+Math.floor(Math.random()*999), toRole, message, appNo, district: district || DEFAULT_DISTRICT, at: Date.now(), read:false });
  DB.set('systemAlerts', alerts);
}

// ============================================================
// GEOGRAPHY — districts, tehsils, constituencies.
// The static lists in punjab.js are the starting point; every change the State
// Administrator makes is stored as an override, so nothing needs a code edit.
// ============================================================
const _ovMap = (key, idf) => Object.fromEntries(DB.get(key).map(o => [o[idf || 'id'], o]));

// ---- districts ----
function _distRecs(){
  const ov = _ovMap('distOverrides');
  return DISTRICTS.map(d => ({ ...d, ...(ov[d.id] || {}) })).concat(DB.get('customDistricts').map(d => ({ ...d, ...(ov[d.id] || {}) })));
}
const allDistricts = () => _distRecs().filter(d => !d.abolished);
const districtById = id => _distRecs().find(d => d.id === id);
const districtName = id => (districtById(id) || {}).name || id || '—';
// A district that was merged away resolves to the district that absorbed it.
function resolveDistrict(id){ let d = districtById(id), guard = 0; while (d && d.abolished && d.mergedInto && guard++ < 10) d = districtById(d.mergedInto); return d ? d.id : id; }
const depotsOfDistrict = did => DEPOTS.filter(d => resolveDistrict(d.district) === did);

// ---- tehsils ----
function _tehsilRecs(){
  const ov = _ovMap('tehsilOverrides');
  return TEHSILS_SEED.map(t => ({ ...t, ...(ov[t.id] || {}) })).concat(DB.get('customTehsils').map(t => ({ ...t, ...(ov[t.id] || {}) })));
}
const allTehsils = () => _tehsilRecs().filter(t => !t.abolished);
const tehsilById = id => _tehsilRecs().find(t => t.id === id);
const tehsilName = id => (tehsilById(id) || {}).name || '—';
const tehsilsOfDistrict = did => allTehsils().filter(t => t.district === did);

// ---- constituencies ----
function allAcs(){
  const ov = _ovMap('acOverrides', 'no'), ml = _ovMap('mlas', 'ac');
  return ACS_SEED.map(a => ({ ...a, ...(ov[a.no] || {}), mla: (ml[a.no] || {}).name || a.mla }));
}
const acByNo = n => allAcs().find(a => a.no === Number(n));
const lsById = id => LOK_SABHA.find(l => l.id === id);
const mpOf = id => { const m = DB.get('mps').find(x => x.ls === id); return m ? m.name : (MPS_SEED[id] || ''); };
const lsAcs = id => allAcs().filter(a => a.ls === id);
const complaintInLs = (rec, ls) => ulbAcs(rec.ulb || DEFAULT_ULB).some(l => (acByNo(l.ac) || {}).ls === ls && (!(l.from || l.to) || (Number(rec.ward) >= (l.from || 1) && Number(rec.ward) <= (l.to || 9999))));
function setMp({ ls, name, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  name = (name || '').trim(); if (name.length < 3) return { ok:false, msg:'Enter the MP\'s name.' }; if (!lsById(ls)) return { ok:false, msg:'Lok Sabha seat not found.' };
  const l = DB.get('mps').filter(m => m.ls !== ls); l.push({ ls, name, since:Date.now(), by: by ? by.name : '' }); DB.set('mps', l);
  const auths = DB.get('authorities'); const acc = auths.find(x => x.username === 'mp-' + ls);
  if (acc) { acc.name = `${name}, MP ${lsName(ls)}`; acc.password = 'mp@123'; DB.set('authorities', auths); }
  return { ok:true };
}
const lsName = id => (lsById(id) || {}).name || '—';
const acsOfDistrict = did => allAcs().filter(a => a.district === did);
function lsOfDistrict(did){
  const count = {}; acsOfDistrict(did).forEach(a => { count[a.ls] = (count[a.ls] || 0) + 1; });
  return Object.keys(count).sort((x, y) => count[y] - count[x]).map(lsById).filter(Boolean);
}
const lsText = did => lsOfDistrict(did).map(l => l.name).join(' / ') || '—';
// "Patiala · Lok Sabha: Patiala" — the Lok Sabha seat(s) always travel with a district's name.
const districtFull = id => districtName(id);
const districtWithLs = id => { const lt = lsText(id); return districtName(id) + (lt !== '—' ? ` · Lok Sabha: ${lt}` : ''); };

// ---- councils (ULBs) with their overrides: ward count, type, district ----
function allUlbs(){
  const ov = _ovMap('ulbOverrides');
  const mk = u => { const o = ov[u.id]; if (!o) return u; const r = { ...u };
    if (o.wards != null) { r.wards = o.wards; r.verify = false; r.edited = true; }
    if (o.type) { r.type = o.type; r.promoted = true; }
    if (o.district) { r.district = o.district; r.moved = true; }
    return r; };
  return ULBS.map(mk).concat(DB.get('customUlbs').map(mk));
}
const ulbName = id => (allUlbs().find(u => u.id === id) || {}).name || id || '—';
const ulbRec = id => allUlbs().find(u => u.id === id);

// council -> constituencies (with optional ward range) and tehsil
const _ulbMapRec = id => DB.get('ulbMap').find(m => m.ulb === id);
const ulbAcs = id => { const m = _ulbMapRec(id); return m && m.acs ? m.acs : (ULB_AC_DEFAULT[id] || []).map(ac => ({ ac })); };
const _norm = s => s.toLowerCase().replace(/[^a-z]/g, '');
function _defaultTehsil(u){
  const ts = tehsilsOfDistrict(u.district), n = _norm(u.name);
  return (ts.find(t => _norm(t.name) === n) || ts.find(t => _norm(t.name).length >= 5 && (n.includes(_norm(t.name)) || _norm(t.name).includes(n))) || {}).id || null;
}
function ulbGeo(id){
  const u = ulbRec(id); if (!u) return null;
  const m = _ulbMapRec(id);
  const acs = ulbAcs(id).map(l => ({ ...l, rec: acByNo(l.ac) })).filter(l => l.rec);
  let tid = m && m.tehsil !== undefined ? m.tehsil : _defaultTehsil(u);
  let teh = tid ? tehsilById(tid) : null; if (teh && (teh.abolished || teh.district !== u.district)) teh = null;
  let ls = [...new Map(acs.map(l => [l.rec.ls, lsById(l.rec.ls)])).values()].filter(Boolean);
  if (!ls.length) { const d = lsOfDistrict(u.district); if (d.length === 1) ls = d; }
  return { ulb:u, district:u.district, tehsil:teh, acs, ls };
}
// "Tehsil Rajpura · Patiala district · Lok Sabha: Patiala · Vidhan Sabha: Rajpura"
function ulbPlace(id){
  const g = ulbGeo(id); if (!g) return '';
  return [g.tehsil ? `Tehsil ${g.tehsil.name}` : null, `${districtName(g.district)} district`,
    g.ls.length ? `Lok Sabha: ${g.ls.map(l => l.name).join(' / ')}` : null,
    g.acs.length ? `Vidhan Sabha: ${g.acs.map(l => l.rec.name).join(', ')}` : null].filter(Boolean).join(' · ');
}
const complaintInAc = (rec, ac) => ulbAcs(rec.ulb || DEFAULT_ULB).some(l => l.ac === ac && (!(l.from || l.to) || (Number(rec.ward) >= (l.from || 1) && Number(rec.ward) <= (l.to || 9999))));
const ulbsInDistrict = did => allUlbs().filter(u => u.district === did);
const ulbWardCount = id => { const u = ulbRec(id); return (u && u.wards) || 0; };
const wardNumbers = id => Array.from({ length: ulbWardCount(id) }, (_, i) => i + 1);

// ---- geography actions (State Administrator) ----
function _log(key, rec){ const l = DB.get(key); l.push({ id: key.slice(0, 2).toUpperCase() + Date.now() + Math.floor(Math.random() * 99), at: Date.now(), ...rec }); DB.set(key, l); }
function _setOv(key, idf, rec){ const l = DB.get(key).filter(o => o[idf] !== rec[idf] || false); const prev = DB.get(key).find(o => o[idf] === rec[idf]) || {}; l.push({ ...prev, ...rec }); DB.set(key, l); }

const _viewOnly = by => !!by && (by.role === 'mla' || by.role === 'mp');
function createDistrict({ name, code, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  name = (name || '').trim(); if (name.length < 3) return { ok:false, msg:'Enter the district name.' };
  const id = _slug(name); if (districtById(id)) return { ok:false, msg:'A district with that name already exists (or existed).' };
  const c = ((code || name).replace(/[^a-z]/gi, '').slice(0, 3) || 'NEW').toUpperCase();
  const l = DB.get('customDistricts'); l.push({ id, name, code:c, custom:true, createdAt:Date.now(), by: by ? by.name : '' }); DB.set('customDistricts', l);
  _seedDistrict(id); _ensureAuthorities();
  _log('geoLog', { text:`District ${name} created`, by: by ? by.name : '' });
  return { ok:true, id };
}
function addDistrictAdmin({ district, name, password, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const d = districtById(district); if (!d || d.abolished) return { ok:false, msg:'District not found.' };
  const auths = DB.get('authorities'); const n = auths.filter(a => a.role === 'dadmin' && a.district === district).length;
  let username = 'admin-' + district + (n ? '-' + (n + 1) : ''); while (auths.some(a => a.username === username)) username += 'x';
  const a = { role:'dadmin', username, name: (name || '').trim() || `System Administrator ${n + 1}, ${d.name}`, title:`District System Administrator, ${d.name}`, password: password || 'district@123', district, extra:true };
  auths.push(a); DB.set('authorities', auths);
  _log('geoLog', { text:`New district administrator ${a.name} for ${d.name}`, by: by ? by.name : '' });
  return { ok:true, account:a };
}
function removeDistrictAdmin(username){
  const auths = DB.get('authorities'); const a = auths.find(x => x.username === username);
  if (!a || a.role !== 'dadmin') return { ok:false, msg:'Account not found.' };
  if (auths.filter(x => x.role === 'dadmin' && x.district === a.district && !x.blocked).length < 2) return { ok:false, msg:'A district must keep at least one administrator.' };
  DB.set('authorities', auths.filter(x => x.username !== username)); return { ok:true };
}

// Move one council to another district: its citizens, files and EO move with it.
// Open files are re-routed to the new district's front-line officer (reroute:true) unless the
// officers themselves are moving too (district merge).
function moveUlbToDistrict(ulbId, toDistrict, opts){
  opts = opts || {}; const u = ulbRec(ulbId); if (!u || u.district === toDistrict) return;
  const fromName = districtName(u.district), toName = districtName(toDistrict);
  const custom = DB.get('customUlbs'), ci = custom.find(x => x.id === ulbId);
  if (ci) { ci.district = toDistrict; DB.set('customUlbs', custom); } else _setOv('ulbOverrides', 'id', { id:ulbId, district:toDistrict });
  const auths = DB.get('authorities'); auths.forEach(a => { if (a.ulb === ulbId) a.district = toDistrict; }); DB.set('authorities', auths);
  const users = DB.get('users'); users.forEach(x => { if (x.ulb === ulbId) x.district = toDistrict; }); DB.set('users', users);
  const cs = DB.get('complaints'); const now = Date.now();
  cs.forEach(c => {
    if (c.ulb !== ulbId) return;
    c.district = toDistrict;
    if ([STATUS.RESOLVED, STATUS.CLOSED].includes(c.status)) return;
    if (opts.reroute === false) { const o = officerById(c.currentOfficerId); if (o) c.level = o.rank; return; }
    if (c.dept === 'mc-office') return;
    c.viaDepts = []; c.holdDept = c.dept;
    const fl = frontLineOfficer(c.dept, toDistrict);
    if (fl) { c.currentOfficerId = fl.id; c.level = fl.rank; c.levelStartedAt = now;
      c.timeline.push({ status:'Reassigned', note:`${u.name} moved from ${fromName} to ${toName} district. File re-routed to ${fl.name} (${fl.designation}).`, by:'Saarthi System', at: now }); }
    else { c.currentOfficerId = null; c.level = 'dc'; c.escalatedToDC = true; c.escalated = true; c.levelStartedAt = now;
      c.timeline.push({ status:'Escalated', note:`${u.name} moved to ${toName} district and no officer is posted there for this department. File sent to the Deputy Commissioner.`, by:'Saarthi System', at: now });
      systemAlert('dc', `Grievance ${c.appNo} has come to your desk after ${u.name} joined your district.`, c.appNo, toDistrict); }
  });
  DB.set('complaints', cs);
}

function promoteToCorporation({ id, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const u = ulbRec(id); if (!u) return { ok:false, msg:'Council not found.' };
  if (u.type === 'corp') return { ok:false, msg:`${u.name} is already a municipal corporation.` };
  const custom = DB.get('customUlbs'), ci = custom.find(x => x.id === id);
  if (ci) { ci.type = 'corp'; DB.set('customUlbs', custom); } else _setOv('ulbOverrides', 'id', { id, type:'corp' });
  // the council's President / Vice President make way for an elected Mayor / Deputy Mayor
  DB.set('officeBearers', DB.get('officeBearers').filter(b => !(b.ulb === id && ['president','vicepresident'].includes(b.post))));
  const auths = DB.get('authorities'); const eo = auths.find(a => a.username === 'eo-' + id);
  if (eo) eo.title = `Executive Officer, ${u.name} Municipal Corporation`;
  DB.set('authorities', auths);
  _ensureAuthorities();
  _log('geoLog', { text:`${u.name} promoted to Municipal Corporation`, by: by ? by.name : '' });
  return { ok:true };
}
function setUlbGeo({ ulb, acs, tehsil }){
  const u = ulbRec(ulb); if (!u) return { ok:false, msg:'Council not found.' };
  if (tehsil) { const t = tehsilById(tehsil); if (!t || t.abolished || t.district !== u.district) return { ok:false, msg:`Pick a tehsil of ${districtName(u.district)}.` }; }
  const clean = (acs || []).map(l => ({ ac:Number(l.ac), from: Number(l.from) || undefined, to: Number(l.to) || undefined })).filter(l => acByNo(l.ac));
  _setOv('ulbMap', 'ulb', { ulb, acs: clean, tehsil: tehsil || null });
  return { ok:true };
}
function setAcGeo({ no, district, ls }){
  if (district && !allDistricts().some(d => d.id === district)) return { ok:false, msg:'Pick an active district.' };
  _setOv('acOverrides', 'no', { no:Number(no), ...(district ? { district } : {}), ...(ls ? { ls } : {}) });
  return { ok:true };
}

// ---- tehsils ----
function createTehsil({ name, kind, district, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  name = (name || '').trim(); if (name.length < 3) return { ok:false, msg:'Enter the tehsil name.' };
  const d = districtById(district); if (!d || d.abolished) return { ok:false, msg:'Pick an active district.' };
  if (allTehsils().some(t => t.district === district && _norm(t.name) === _norm(name))) return { ok:false, msg:`${d.name} already has a tehsil called ${name}.` };
  let id = 't-' + _slug(name); while (tehsilById(id)) id += '-x';
  const l = DB.get('customTehsils'); l.push({ id, name, kind: kind === 'ST' ? 'ST' : 'T', district, custom:true }); DB.set('customTehsils', l);
  _log('geoLog', { text:`${kind === 'ST' ? 'Sub-tehsil' : 'Tehsil'} ${name} created in ${d.name}`, by: by ? by.name : '' });
  return { ok:true, id };
}
// Change a tehsil's district: the councils inside it go with it (their files are re-routed).
function setTehsilDistrict({ id, district, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const t = tehsilById(id), d = districtById(district);
  if (!t || t.abolished) return { ok:false, msg:'Tehsil not found.' };
  if (!d || d.abolished) return { ok:false, msg:'Pick an active district.' };
  if (t.district === district) return { ok:false, msg:`${t.name} is already in ${d.name}.` };
  if (allTehsils().some(x => x.district === district && _norm(x.name) === _norm(t.name))) return { ok:false, msg:`${d.name} already has a tehsil called ${t.name}.` };
  const inside = allUlbs().filter(u => (ulbGeo(u.id).tehsil || {}).id === id);
  _setOv('tehsilOverrides', 'id', { id, district });
  inside.forEach(u => { moveUlbToDistrict(u.id, district); _setOv('ulbMap', 'ulb', { ulb:u.id, acs: ulbAcs(u.id), tehsil:id }); });
  const offs = DB.get('officers'); offs.forEach(o => { if (o.tehsil === id && o.district !== district) delete o.tehsil; }); DB.set('officers', offs);
  _log('geoLog', { text:`Tehsil ${t.name} moved from ${districtName(t.district)} to ${d.name} with ${inside.length} council(s)`, by: by ? by.name : '' });
  return { ok:true, moved:inside.length };
}
// Abolish a tehsil; its councils (and posted staff) merge into the chosen tehsil — in any district.
function abolishTehsil({ id, mergeInto, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const t = tehsilById(id); if (!t || t.abolished) return { ok:false, msg:'Tehsil not found.' };
  const target = mergeInto ? tehsilById(mergeInto) : null;
  if (mergeInto && (!target || target.abolished || target.id === id)) return { ok:false, msg:'Pick another active tehsil to merge into.' };
  const inside = allUlbs().filter(u => (ulbGeo(u.id).tehsil || {}).id === id);
  inside.forEach(u => {
    if (target && target.district !== u.district) moveUlbToDistrict(u.id, target.district);
    _setOv('ulbMap', 'ulb', { ulb:u.id, acs: ulbAcs(u.id), tehsil: target ? target.id : null });
  });
  const offs = DB.get('officers'); offs.forEach(o => { if (o.tehsil === id) { if (target && target.district === o.district) o.tehsil = target.id; else delete o.tehsil; } }); DB.set('officers', offs);
  _setOv('tehsilOverrides', 'id', { id, abolished:true, mergedInto: target ? target.id : null });
  _log('geoLog', { text:`${TEHSIL_KIND_LABEL[t.kind]} ${t.name} abolished${target ? ' and merged into ' + target.name + ' (' + districtName(target.district) + ')' : ''}`, by: by ? by.name : '' });
  return { ok:true, moved:inside.length };
}

// ---- district merge: proposed by the State Administrator, accepted by the receiving district ----
const mergeRequests = () => DB.get('mergeRequests');
function proposeMerge({ from, to, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const a = districtById(from), b = districtById(to);
  if (!a || a.abolished || !b || b.abolished) return { ok:false, msg:'Both districts must be active.' };
  if (from === to) return { ok:false, msg:'Pick a different district to merge into.' };
  if (mergeRequests().some(r => r.from === from && r.status === 'pending')) return { ok:false, msg:`A merge request for ${a.name} is already waiting for an answer.` };
  const l = DB.get('mergeRequests').filter(r => !(r.from === from && r.status !== 'done')); l.push({ id:'MR' + Date.now(), from, to, status:'pending', by: by ? by.name : '', at: Date.now() }); DB.set('mergeRequests', l);
  return { ok:true };
}
function respondMerge({ id, accept, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const l = DB.get('mergeRequests'); const r = l.find(x => x.id === id); if (!r || r.status !== 'pending') return { ok:false, msg:'This request is no longer open.' };
  r.status = accept ? 'accepted' : 'declined'; r.answeredBy = by ? by.name : ''; r.answeredAt = Date.now(); DB.set('mergeRequests', l); return { ok:true };
}
function executeMerge({ id, offline, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const l = DB.get('mergeRequests'); const r = l.find(x => x.id === id); if (!r) return { ok:false, msg:'Request not found.' };
  if (r.status !== 'accepted' && !(offline && r.status === 'pending')) return { ok:false, msg: r.status === 'pending' ? 'The receiving district has not answered yet.' : 'This request cannot be completed.' };
  const res = abolishDistrict({ id:r.from, mergeInto:r.to, by });
  if (res.ok) { r.consent = r.status === 'accepted' ? 'accepted' : 'offline'; r.status = 'done'; r.doneAt = Date.now(); DB.set('mergeRequests', l); }
  return res;
}
function abolishDistrict({ id, mergeInto, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const from = districtById(id), to = districtById(mergeInto);
  if (!from || from.abolished || !to || to.abolished || id === mergeInto) return { ok:false, msg:'Pick an active district to merge into.' };
  const now = Date.now(), who = by ? by.name : 'State Administrator';
  // 1. staff move across, placed beneath the receiving district's own ranks so there is still one head per department
  const offs = DB.get('officers'); const maxRank = {};
  offs.filter(o => o.district === mergeInto).forEach(o => { maxRank[o.dept] = Math.max(maxRank[o.dept] || 0, o.rank || 1); });
  const movedStaff = offs.filter(o => o.district === id);
  movedStaff.forEach(o => {
    const cur = (o.postings || []).find(p => !p.to); if (cur) cur.to = now;
    o.district = mergeInto; o.rank = (maxRank[o.dept] || 0) + (o.rank || 1); o.office = `${o.designation} Office, ${to.name}`;
    (o.postings = o.postings || []).push(_posting(o, now, null, { orderNo:'MERGE-' + id.toUpperCase(), reason:`${from.name} district merged into ${to.name}`, by: who }));
  });
  DB.set('officers', offs);
  // 2. councils, tehsils, constituencies, depots (via resolveDistrict)
  ulbsInDistrict(id).forEach(u => moveUlbToDistrict(u.id, mergeInto, { reroute:false }));
  tehsilsOfDistrict(id).forEach(t => _setOv('tehsilOverrides', 'id', { id:t.id, district:mergeInto }));
  acsOfDistrict(id).forEach(a => _setOv('acOverrides', 'no', { no:a.no, district:mergeInto }));
  const users = DB.get('users'); users.forEach(u => { if (u.district === id) u.district = mergeInto; }); DB.set('users', users);
  const al = DB.get('systemAlerts'); al.forEach(a => { if (a.district === id) a.district = mergeInto; }); DB.set('systemAlerts', al);
  DB.set('positions', DB.get('positions').filter(p => p.district !== id));
  DB.set('rules', DB.get('rules').filter(r => r.district !== id));
  // 3. the district's own accounts are closed
  const auths = DB.get('authorities');
  auths.forEach(a => { if (a.district === id && ['dadmin','dc'].includes(a.role)) { a.blocked = true; a.name += ' (district abolished)'; } });
  DB.set('authorities', auths);
  _setOv('distOverrides', 'id', { id, abolished:true, mergedInto:mergeInto, at:now, by:who });
  _log('geoLog', { text:`District ${from.name} abolished and merged into ${to.name} (${movedStaff.length} employees moved)`, by: who });
  return { ok:true, staff:movedStaff.length };
}

// ============================================================
// OFFICE-BEARERS of councils and corporations (chosen from registered councillors)
// ============================================================
const OFFICE_POSTS = { corp:[['mayor','Mayor'],['deputymayor','Deputy Mayor']], council:[['president','President'],['vicepresident','Vice President']], np:[['president','President'],['vicepresident','Vice President']] };
const OFFICE_LABEL = { mayor:'Mayor', deputymayor:'Deputy Mayor', president:'President', vicepresident:'Vice President' };
const officePostsOf = ulb => OFFICE_POSTS[(ulbRec(ulb) || {}).type] || OFFICE_POSTS.council;
function officeBearer(ulb, post){
  const b = DB.get('officeBearers').find(x => x.ulb === ulb && x.post === post); if (!b) return null;
  const m = mcOf(ulb, b.ward); return m ? { ...b, name:m.name, phone:m.phone } : null;
}
const officeTagOf = (ulb, ward) => { const b = DB.get('officeBearers').find(x => x.ulb === ulb && x.ward === Number(ward)); return b ? OFFICE_LABEL[b.post] : ''; };
function appointOfficeBearer({ ulb, post, ward, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  if (!officePostsOf(ulb).some(p => p[0] === post)) return { ok:false, msg:`${ulbName(ulb)} has no post of ${OFFICE_LABEL[post] || post}.` };
  const m = mcOf(ulb, ward); if (!m) return { ok:false, msg:'Pick a registered councillor.' };
  if (m.blocked) return { ok:false, msg:`${m.name}'s account is blocked.` };
  const list = DB.get('officeBearers');
  const other = list.find(b => b.ulb === ulb && b.ward === Number(ward) && b.post !== post);
  if (other) return { ok:false, msg:`${m.name} already holds the post of ${OFFICE_LABEL[other.post]}. Remove that first.` };
  const prev = list.find(b => b.ulb === ulb && b.post === post);
  const next = list.filter(b => !(b.ulb === ulb && b.post === post)); next.push({ ulb, post, ward:Number(ward), at:Date.now(), by: by ? by.name : '' });
  DB.set('officeBearers', next);
  _log('officeLog', { ulb, post, ward:Number(ward), name:m.name, replaced: prev ? (mcOf(ulb, prev.ward) || {}).name : null, by: by ? by.name : '' });
  _syncMayorAccount(ulb);
  return { ok:true };
}
function clearOfficeBearer({ ulb, post, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  DB.set('officeBearers', DB.get('officeBearers').filter(b => !(b.ulb === ulb && b.post === post)));
  _log('officeLog', { ulb, post, name:null, by: by ? by.name : '' });
  _syncMayorAccount(ulb);
}
function _syncMayorAccount(ulb){
  const auths = DB.get('authorities'); const a = auths.find(x => x.username === 'mayor-' + ulb); if (!a) return;
  const b = officeBearer(ulb, 'mayor'); a.name = b ? `Mayor ${b.name}` : `Mayor, ${ulbName(ulb)} (office vacant)`; DB.set('authorities', auths);
}

// ============================================================
// MLAs and the COUNCIL OF MINISTERS (ministries outlive their holders)
// ============================================================
const mlaOf = no => (acByNo(no) || {}).mla || '';
const allMinistries = () => DB.get('ministries');
const ministryByKey = k => allMinistries().find(m => m.key === k);
function setMla({ ac, name, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  name = (name || '').trim(); const a = acByNo(ac); if (!a) return { ok:false, msg:'Constituency not found.' }; if (name.length < 3) return { ok:false, msg:'Enter the MLA\'s name.' };
  const ml = DB.get('mlas').filter(m => m.ac !== Number(ac)); ml.push({ ac:Number(ac), name, since:Date.now(), by: by ? by.name : '' }); DB.set('mlas', ml);
  const auths = DB.get('authorities'); const acc = auths.find(x => x.role === 'mla' && x.ac === Number(ac));
  if (acc) { acc.name = `${name}, MLA ${a.name}`; acc.password = 'mla@123'; DB.set('authorities', auths); }
  // a minister who is no longer an MLA leaves the cabinet
  const ms = allMinistries(); let left = null;
  ms.forEach(m => { if (m.holder && m.holder.ac === Number(ac) && m.holder.name !== name) { left = m; m.holder = null; } }); DB.set('ministries', ms);
  if (left) { _syncMinisterAccount(left.key); _log('cabinetLog', { key:left.key, text:`${left.title} vacated — the seat ${a.name} has a new MLA`, by: by ? by.name : '' }); }
  return { ok:true, vacated: left };
}
function appointMinister({ key, ac, name, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const ms = allMinistries(); const m = ms.find(x => x.key === key); if (!m) return { ok:false, msg:'Ministry not found.' };
  name = (name || '').trim();
  const a = ac ? acByNo(ac) : null; if (!a && name.length < 3) return { ok:false, msg:'Pick an MLA, or type the name of the person to appoint.' };
  const prev = m.holder ? m.holder.name : null;
  m.holder = a ? { ac:a.no, name:a.mla, since:Date.now() } : { ac:null, name, since:Date.now(), nonMla:true };
  DB.set('ministries', ms); _syncMinisterAccount(key, true);
  _log('cabinetLog', { key, text:`${a ? a.mla + ' (' + a.name + ')' : name + ' (not an MLA)'} appointed ${m.isCM ? 'Chief Minister' : 'Minister, ' + m.title}${prev ? ' — replacing ' + prev : ''}`, by: by ? by.name : '' });
  return { ok:true, replaced: prev };
}
function vacateMinistry({ key, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const ms = allMinistries(); const m = ms.find(x => x.key === key); if (!m || !m.holder) return { ok:false, msg:'This ministry is already vacant.' };
  const prev = m.holder.name; m.holder = null; DB.set('ministries', ms); _syncMinisterAccount(key);
  _log('cabinetLog', { key, text:`${prev} removed from ${m.title}; the ministry is vacant`, by: by ? by.name : '' });
  return { ok:true };
}
function setMinistryDepts({ key, depts, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const ms = allMinistries(); const m = ms.find(x => x.key === key); if (!m) return { ok:false, msg:'Ministry not found.' };
  m.depts = m.isCM ? ['*'] : depts; DB.set('ministries', ms);
  _log('cabinetLog', { key, text:`${m.title}: departments overseen set to ${m.depts.length ? m.depts.map(d => (deptById(d) || { name:d }).name).join(', ') : 'none'}`, by: by ? by.name : '' });
  return { ok:true };
}
function addMinistry({ title, depts, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  title = (title || '').trim(); if (title.length < 3) return { ok:false, msg:'Enter the ministry name.' };
  let key = _slug(title); if (ministryByKey(key)) key += '-2';
  const ms = allMinistries(); ms.push({ key, title, post:'Minister', portfolio:title, depts: depts || [], holder:null, isCM:false, custom:true }); DB.set('ministries', ms);
  _ensureAuthorities(); _log('cabinetLog', { key, text:`Ministry of ${title} created`, by: by ? by.name : '' });
  return { ok:true, key };
}
const _ministerTemplate = m => ({ role:'minister', username:'min-' + m.key, ministryKey:m.key,
  name: m.holder ? m.holder.name : `${m.title} (vacant)`, title: `${m.post} · ${m.title}`, password:'minister@123', blocked: !m.holder, portfolio: m.portfolio });
function _syncMinisterAccount(key, resetPw){
  const m = ministryByKey(key); if (!m) return; const t = _ministerTemplate(m);
  const auths = DB.get('authorities'); let a = auths.find(x => x.username === t.username);
  if (!a) auths.push(t); else { a.name = t.name; a.title = t.title; a.blocked = t.blocked; a.portfolio = t.portfolio; if (resetPw) a.password = 'minister@123'; }
  DB.set('authorities', auths);
}

// ============================================================
// SUSPENSION — who may suspend whom
//   Supreme Administrator, CMO Punjab, Chief Minister : any officer in the state
//   Minister : officers of the departments of his ministry only
//   Deputy Commissioner : officers posted in his district only
//   MLA, District Administrator, EO, Mayor : no power to suspend
// ============================================================
function _lvl(actor){
  if (!actor) return 0;
  if (actor.role === 'admin' || actor.role === 'cmo') return 5;
  if (actor.role === 'minister') { const m = ministryByKey(actor.ministryKey); return m && m.isCM ? 5 : 3; }
  if (actor.role === 'dc') return 2;
  return 0;
}
function canSuspend(actor, o){
  if (!actor || !o) return false;
  if (actor.role === 'admin' || actor.role === 'cmo') return true;
  if (actor.role === 'minister') { const m = ministryByKey(actor.ministryKey); if (!m || !m.holder) return false; return m.isCM || m.depts.includes('*') || m.depts.includes(o.dept); }
  if (actor.role === 'dc') return o.district === actor.district;
  return false;
}
// A suspension can be lifted by anyone who could impose it and is at least as senior as whoever did.
const canReinstate = (actor, o) => !!o.blocked && canSuspend(actor, o) && _lvl(actor) >= (o.suspension ? o.suspension.level || 0 : (o.blockedByCMO ? 5 : 0));
function suspendOfficer({ officerId, reason, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const offs = DB.get('officers'); const o = offs.find(x => x.id === officerId); if (!o) return { ok:false, msg:'Employee not found.' };
  if (!canSuspend(by, o)) return { ok:false, msg:'You do not have the power to suspend this officer.' };
  if (o.blocked) return { ok:false, msg:`${o.name} is already suspended.` };
  if ((reason || '').trim().length < 5) return { ok:false, msg:'Give a reason for the suspension.' };
  const now = Date.now(), lv = _lvl(by);
  o.blocked = true; o.blockedByCMO = lv >= 5;
  o.suspension = { reason:reason.trim(), by:by.name, role:by.role, title:by.title || by.role, level:lv, at:now };
  (o.suspensions = o.suspensions || []).push({ ...o.suspension });
  DB.set('officers', offs);
  _handOverFiles(o.id, { district:o.district, dept:o.dept, rank:o.rank }, { force:true, why:'suspended' });
  return { ok:true, officer:o };
}
function reinstateOfficer({ officerId, note, by }){
  if (_viewOnly(by)) return { ok:false, msg:'MLAs and MPs have view-only access — they cannot create or change posts, officers, districts or any other record.' };
  const offs = DB.get('officers'); const o = offs.find(x => x.id === officerId); if (!o || !o.blocked) return { ok:false, msg:'This officer is not suspended.' };
  if (!canReinstate(by, o)) return { ok:false, msg:'This suspension was ordered by a higher authority — only they (or the State Administrator) can lift it.' };
  const last = (o.suspensions || []).slice(-1)[0]; if (last) { last.revokedAt = Date.now(); last.revokedBy = by.name; last.revokeNote = (note || '').trim(); }
  o.blocked = false; o.blockedByCMO = false; delete o.suspension; DB.set('officers', offs);
  return { ok:true, officer:o };
}

// ============================================================
// SCOPE — what each authority role is allowed to see
// ============================================================
function scopeOf(u){
  if (!u) return { level:'none' };
  if (u.role === 'admin' || u.role === 'cmo') return { level:'state', depts:'*' };
  if (u.role === 'minister') { const m = ministryByKey(u.ministryKey); return { level:'state', depts: m ? (m.depts.includes('*') ? '*' : m.depts.slice()) : [], ministry:m }; }
  if (u.role === 'dadmin' || u.role === 'dc') return { level:'district', district:u.district };
  if (u.role === 'eo' || u.role === 'mayor') return { level:'ulb', ulb:u.ulb, district:(ulbRec(u.ulb) || {}).district };
  if (u.role === 'mla') return { level:'ac', ac:u.ac };
  if (u.role === 'mp') return { level:'ls', ls:u.ls };
  return { level:'none' };
}
const inScope = (sc, rec) => sc.level === 'state'
  || (sc.level === 'district' && (rec.district || DEFAULT_DISTRICT) === sc.district)
  || (sc.level === 'ulb' && (rec.ulb || DEFAULT_ULB) === sc.ulb)
  || (sc.level === 'ac' && complaintInAc(rec, sc.ac))
  || (sc.level === 'ls' && complaintInLs(rec, sc.ls));
const deptInScope = (sc, deptId) => !sc.depts || sc.depts === '*' || sc.depts.includes(deptId);
// A minister sees a file when its own department, or the department now holding it, is in his ministry.
const complaintInScope = (sc, c) => inScope(sc, c) && (deptInScope(sc, c.dept) || deptInScope(sc, holdDept(c)));

// ============================================================
// BOOTSTRAP — idempotent first-run seeding and schema migrations
// ============================================================
function _seedDistrict(did){
  const officers = DB.get('officers'); const fresh = [];
  DEPARTMENTS.filter(dp => SEED_DEPTS.includes(dp.id)).forEach(dp => { if (!officers.some(o => o.district === did && o.dept === dp.id)) _seedDistrictDept(dp.id, did, fresh); });
  if (fresh.length) DB.set('officers', officers.concat(fresh));
}
const _mayorTemplate = u => ({ role:'mayor', username:'mayor-' + u.id, name:`Mayor, ${u.name} (office vacant)`, title:`Mayor, ${u.name} Municipal Corporation`, password:'mayor@123', district:u.district, ulb:u.id });
const _mlaUser = a => 'mla-' + _slug((ACS_SEED.find(x => x.no === a.no) || a).name);
const _mlaTemplate = a => ({ role:'mla', username:_mlaUser(a), name:`${a.mla}, MLA ${a.name}`, title:`Member of Legislative Assembly · ${a.name} (AC ${a.no})`, password:'mla@123', ac:a.no });
const _mpTemplate = l => ({ role:'mp', username:'mp-' + l.id, name:`${mpOf(l.id)}, MP ${l.name}`, title:`Member of Parliament (Lok Sabha) · ${l.name}`, password:'mp@123', ls:l.id });
function _authorityTemplates(){
  const list = [];
  list.push({ role:'admin', username:'admin', name:'Supreme Administrator, Punjab', title:'State System Administrator', password:'admin@123' });
  list.push({ role:'cmo', username:'cmo', name:"Chief Minister's Office, Punjab", title:'CMO Punjab', password:'cmo@123' });
  allMinistries().forEach(m => list.push(_ministerTemplate(m)));
  allDistricts().forEach(d => {
    list.push({ role:'dadmin', username:'admin-' + d.id, name:`System Administrator, ${d.name}`, title:`District System Administrator, ${d.name}`, password:'district@123', district:d.id });
    list.push({ role:'dc', username:'dc-' + d.id, name:`Deputy Commissioner, ${d.name}`, title:`Deputy Commissioner, ${d.name}`, password:'dc@123', district:d.id });
  });
  allUlbs().forEach(u => { list.push(_eoTemplate(u)); if (u.type === 'corp') list.push(_mayorTemplate(u)); });
  allAcs().forEach(a => list.push(_mlaTemplate(a)));
  LOK_SABHA.forEach(l => list.push(_mpTemplate(l)));
  return list;
}
const _eoTemplate = u => ({ role:'eo', username:'eo-' + u.id, name:`Executive Officer, ${u.name}`, title:`Executive Officer, ${u.name} ${u.type === 'corp' ? 'Municipal Corporation' : u.type === 'np' ? 'Nagar Panchayat' : 'Municipal Council'}`, password:'eo@123', district:u.district, ulb:u.id });
// Create any authority account that does not exist yet (never touches existing passwords).
function _ensureAuthorities(){
  const auths = DB.get('authorities'); const have = new Set(auths.map(a => a.username));
  _authorityTemplates().forEach(a => { if (!have.has(a.username)) { auths.push(a); have.add(a.username); } });
  DB.set('authorities', auths);
  allUlbs().filter(u => u.type === 'corp').forEach(u => _syncMayorAccount(u.id));
}

(function bootstrap(){
  if (!DB.has('officers')) DB.set('officers', []);
  if (!DB.has('mcs')) {
    DB.set('mcs', WARDS.map(w => ({ ulb:DEFAULT_ULB, ward: w.ward, name: w.mcName, phone: w.phone, office: w.office, password: 'mc@123', blocked: false })));
  }
  if (!DB.has('customDepartments')) DB.set('customDepartments', []);
  if (!DB.has('users')) DB.set('users', []);
  if (!DB.has('complaints')) DB.set('complaints', []);

  // --- legacy repairs (kept from earlier releases) ---
  const officersNow = DB.get('officers');
  let repaired = false;
  officersNow.forEach((o, i) => {
    if (!o.id) { o.id = 'OFF' + (i + 1) + '_' + o.dept; repaired = true; }
    if (!/^[6-9]\d{9}$/.test(o.phone)) { o.phone = '9' + String(800099000 + i * 137).slice(0, 9); repaired = true; }
    if (o.office === undefined) { const seed = DEPARTMENTS.find(d => d.id === o.dept); o.office = seed ? seed.office : ''; repaired = true; }
    if (o.blocked === undefined) { o.blocked = false; repaired = true; }
    if (o.rank === undefined) { o.rank = 1; repaired = true; }
  });
  if (repaired) DB.set('officers', officersNow);

  const stored = Number(DB.val('schema', 0));

  // --- Pilot district (Patiala) keeps its original, named department heads ---
  let officers = DB.get('officers');
  // (a fresh install starts with only the lean starter staff seeded below)

  // --- schema 33 migration: tag legacy single-city data with its district / ULB ---
  if (stored < 33) {
    officers.forEach(o => {
      if (!o.district) o.district = DEFAULT_DISTRICT;
      if (!o.joinedAt) o.joinedAt = Date.now() - 365 * 864e5;
      if (!o.empId) o.empId = _newEmpId(o.joinedAt);
      if (!o.postings) o.postings = [_posting(o, o.joinedAt, null, { orderNo: 'LEGACY', reason: 'Existing officer migrated into the employee register' })];
    });
    const mcs = DB.get('mcs'); mcs.forEach(m => { if (!m.ulb) m.ulb = DEFAULT_ULB; }); DB.set('mcs', mcs);
    const users = DB.get('users'); users.forEach(u => { if (!u.ulb) { u.ulb = DEFAULT_ULB; u.district = DEFAULT_DISTRICT; } }); DB.set('users', users);
    const cs = DB.get('complaints'); cs.forEach(c => { if (!c.ulb) { c.ulb = DEFAULT_ULB; c.district = DEFAULT_DISTRICT; } }); DB.set('complaints', cs);
    const al = DB.get('systemAlerts'); al.forEach(a => { if (!a.district) a.district = DEFAULT_DISTRICT; }); DB.set('systemAlerts', al);
    // Transport takes dept code 13: any admin-made department that already used 13 gets a fresh code.
    const customs = DB.get('customDepartments'); let seq = 13;
    customs.forEach(d => { if (d.code === '13' || d.id === 'transport') { seq++; d.code = String(seq).padStart(2, '0'); if (d.id === 'transport') d.id = 'transport-legacy'; } });
    DB.set('customDepartments', customs);
    officers.forEach(o => { if (o.dept === 'transport') o.dept = 'transport-legacy'; });
  }
  // --- schema 35: lean starter staff (2 each in police / PSPCL / municipal per district) ---
  if (stored && stored < 35) {
    const cs = DB.get('complaints'); const used = new Set(cs.flatMap(c => [c.currentOfficerId, c.assignedOfficer]).filter(Boolean));
    officers = officers.filter(o => !(o.demo && !SEED_DEPTS.includes(o.dept) && !used.has(o.id)));
  }
  DB.set('officers', officers);

  // --- MLAs and the council of ministers (schema 34) ---
  const ml = DB.get('mlas'); const haveMla = new Set(ml.map(m => m.ac));
  ACS_SEED.forEach(a => { if (!haveMla.has(a.no)) ml.push({ ac:a.no, name:a.mla, since:null }); }); DB.set('mlas', ml);
  const mp = DB.get('mps'); const haveMp = new Set(mp.map(m => m.ls));
  LOK_SABHA.forEach(l => { if (!haveMp.has(l.id)) mp.push({ ls:l.id, name:MPS_SEED[l.id], since:null }); }); DB.set('mps', mp);
  if (!DB.get('ministries').length) {
    DB.set('ministries', MINISTRIES_SEED.map(m => ({ key:m.key, title:m.title, post:m.post, portfolio:m.portfolio, depts:m.depts, isCM:m.isCM, holder:{ ac:m.ac, name:mlaOf(m.ac), since:null } })));
  }

  // new departments join the ministry that oversees them (admin edits are kept)
  { const mins = DB.get('ministries'); let ch = false;
    mins.forEach(m => { const sd = (MINISTRIES_SEED.find(x => x.key === m.key) || {}).depts || []; sd.forEach(x => { if (Array.isArray(m.depts) && !m.depts.includes('*') && !m.depts.includes(x) && stored < 35) { m.depts.push(x); ch = true; } }); });
    if (ch) DB.set('ministries', mins); }

  // --- starter staff for every district (idempotent) ---
  allDistricts().forEach(d => _seedDistrict(d.id));

  // --- authority accounts (idempotent by username; legacy accounts are upgraded in place) ---
  let auths = DB.get('authorities');
  const rename = { dc:'dc-' + DEFAULT_DISTRICT, eo:'eo-' + DEFAULT_ULB };
  auths.forEach(a => {
    if (rename[a.username] && !auths.some(x => x.username === rename[a.username])) {
      const old = a.username; a.username = rename[old];
      if (old === 'dc') a.district = DEFAULT_DISTRICT;
      if (old === 'eo') { a.ulb = DEFAULT_ULB; a.district = DEFAULT_DISTRICT; }
    }
  });
  // ministers are now keyed by ministry, not by person
  auths = auths.filter(a => !(a.role === 'minister' && !a.ministryKey));
  DB.set('authorities', auths);
  _ensureAuthorities();
  // refresh display fields on upgraded accounts (passwords are never touched)
  if (stored < SCHEMA_VERSION) {
    const tpl = _authorityTemplates(); const now = DB.get('authorities');
    now.forEach(a => { const t = tpl.find(x => x.username === a.username); if (t) { a.name = t.name; a.title = t.title; if (t.district !== undefined) a.district = t.district; if (t.ulb !== undefined) a.ulb = t.ulb; a.ministryKey = t.ministryKey; a.portfolio = t.portfolio; if (t.ac !== undefined) a.ac = t.ac; } });
    DB.set('authorities', now);
    allUlbs().filter(u => u.type === 'corp').forEach(u => _syncMayorAccount(u.id));
  }
  if (stored < SCHEMA_VERSION) DB.setVal('schema', SCHEMA_VERSION);
})();


// ---------- Department photos (shown on the home page cards) ----------
// Reads an image file, crops it to 2:1, resizes to 800x400 and returns a compact JPEG data-URL (~40-120 KB).
function resizeDeptPhoto(file){
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Choose a JPG, PNG or WEBP image.'));
    if (file.size > 8 * 1024 * 1024) return reject(new Error('That image is over 8 MB — choose a smaller one.'));
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const W = 800, H = 400, c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
      const r = Math.max(W / img.width, H / img.height), w = img.width * r, h = img.height * r;
      g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      URL.revokeObjectURL(url);
      let q = .82, out = c.toDataURL('image/jpeg', q);
      while (out.length > 160000 && q > .4) { q -= .08; out = c.toDataURL('image/jpeg', q); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be read as an image.')); };
    img.src = url;
  });
}
function setDepartmentPhoto(deptId, photo, by){
  if (_viewOnly(by)) return { ok:false, msg:'View-only accounts cannot change departments.' };
  const customs = DB.get('customDepartments'), d = customs.find(x => x.id === deptId);
  if (!d) return { ok:false, msg:'Only departments created in Saarthi can have their photo changed here.' };
  if (photo) d.photo = photo; else delete d.photo;
  DB.set('customDepartments', customs); return { ok:true };
}
