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

// ---------- localStorage helpers (our "database driver") ----------
const DB = {
  get(key){ return JSON.parse(localStorage.getItem('saarthi_' + key)) || []; },
  set(key, val){ localStorage.setItem('saarthi_' + key, JSON.stringify(val)); },
  seq(){ // auto-increment for application numbers
    const n = Number(localStorage.getItem('saarthi_seq') || 0) + 1;
    localStorage.setItem('saarthi_seq', n);
    return n;
  },
  nextDeptCode(){
    const n = Number(localStorage.getItem('saarthi_deptcode_seq') || 12) + 1;
    localStorage.setItem('saarthi_deptcode_seq', n);
    return String(n).padStart(2, '0');
  }
};

// First-run bootstrap: seed officer & MC credentials
(function bootstrap(){
  if (!localStorage.getItem('saarthi_officers')) {
    // Officers get realistic personal mobile numbers (not the department's office landline,
    // which stays a separate contact) — using a real 10-digit mobile format avoids failing
    // the mobile-number validation the moment an admin edits and re-saves their details.
    DB.set('officers', DEPARTMENTS.map((d, i) => ({
      id: 'OFF' + (i + 1), dept: d.id, designation: d.designation, name: d.officer,
      phone: '9' + String(800012340 + i * 111).slice(0, 9), office: d.office, password: 'officer@123', rank: 1, blocked: false
    })));
  }
  if (!localStorage.getItem('saarthi_mcs')) {
    DB.set('mcs', WARDS.map(w => ({ ward: w.ward, name: w.mcName, phone: w.phone, office: w.office, password: 'mc@123', blocked: false })));
  }
  if (!localStorage.getItem('saarthi_authorities')) {
    DB.set('authorities', [
      { role:'admin', name:'System Administrator',           title:'Portal Administrator',                    username:'admin',  password:'admin@123' },
      { role:'dc',    name:'Deputy Commissioner, Patiala',    title:'Deputy Commissioner',                     username:'dc',     password:'dc@123' },
      { role:'eo',    name:'Executive Officer, MC Rajpura',   title:'Executive Officer, Municipal Committee',  username:'eo',     password:'eo@123' },
      { role:'cmo',   name:'Chief Minister\'s Office, Punjab', title:'CMO Punjab',                              username:'cmo',    password:'cmo@123' },
      { role:'minister', name:'Minister of Local Government, Punjab', title:'Minister, Local Government',      username:'minister', password:'minister@123' },
    ]);
  }
  if (!localStorage.getItem('saarthi_customDepartments')) DB.set('customDepartments', []);
  if (!localStorage.getItem('saarthi_users'))      DB.set('users', []);
  if (!localStorage.getItem('saarthi_complaints')) DB.set('complaints', []);

  // One-time repair for browsers that already saved officers before this fix: any officer
  // whose phone isn't a valid 10-digit mobile (e.g. still holding the old department
  // landline number) gets a real mobile number generated, so editing/saving their
  // details doesn't keep silently failing the phone-format check.
  const officersNow = DB.get('officers');
  let repaired = false;
  officersNow.forEach((o, i) => {
    // Officers saved before the hierarchy system existed have no `id` at all — every
    // "off-undefined" edit panel then collapses onto the same DOM element (whichever
    // officer happens to render first), which is exactly why editing looked stuck on
    // one officer and Save silently did nothing. Backfill a stable, unique id.
    if (!o.id) { o.id = 'OFF' + (i + 1) + '_' + o.dept; repaired = true; }
    if (!/^[6-9]\d{9}$/.test(o.phone)) { o.phone = '9' + String(800099000 + i * 137).slice(0, 9); repaired = true; }
    if (o.office === undefined) { const seed = DEPARTMENTS.find(d => d.id === o.dept); o.office = seed ? seed.office : ''; repaired = true; }
    if (o.blocked === undefined) { o.blocked = false; repaired = true; }
    if (o.rank === undefined) { o.rank = 1; repaired = true; }
  });
  if (repaired) DB.set('officers', officersNow);

  // Migration: add the CMO Punjab and Minister of Local Government authority roles
  // for browsers seeded before they existed.
  const authsNow = DB.get('authorities');
  if (!authsNow.some(a => a.role === 'cmo')) {
    authsNow.push({ role:'cmo', name:"Chief Minister's Office, Punjab", title:'CMO Punjab', username:'cmo', password:'cmo@123' });
  }
  if (!authsNow.some(a => a.role === 'minister')) {
    authsNow.push({ role:'minister', name:'Minister of Local Government, Punjab', title:'Minister, Local Government', username:'minister', password:'minister@123' });
  }
  DB.set('authorities', authsNow);
})();

// ---------- Departments (built-in + admin-added, combined) ----------
const allDepartments = () => DEPARTMENTS.concat(DB.get('customDepartments'));
const deptById = id => allDepartments().find(d => d.id === id) || (id === 'mc-office' ? MC_DEPT : null);
const deptSlaHours = id => (deptById(id) && deptById(id).slaHours) || SLA_HOURS;

// wardByNo() is the single source of truth for a ward's councillor — it reads the LIVE
// record from DB.mcs (editable by System Admin / DC) rather than the static seed data,
// so an admin-made change to a councillor's name/phone/office shows up everywhere
// instantly (citizen dashboard, signup preview, complaint routing) with no code change.
const wardByNo = no => {
  const seed = WARDS.find(w => w.ward === Number(no));
  const live = DB.get('mcs').find(m => m.ward === Number(no));
  if (!seed) return live;
  return live ? { ...seed, name: live.name, mcName: live.name, phone: live.phone, office: live.office || seed.office, blocked: live.blocked } : seed;
};

// officersByDept() returns every officer in a department's hierarchy, most senior first.
const officersByDept = deptId => DB.get('officers').filter(o => o.dept === deptId).sort((a,b) => (a.rank||9) - (b.rank||9));

// officerByDept() returns the most senior (head) officer of a department — the live,
// admin-editable record — kept for backward compatibility with single-officer displays.
const officerByDept = deptId => {
  const seed = deptById(deptId);
  const head = officersByDept(deptId)[0];
  if (!seed) return head;
  return head ? { ...seed, officer: head.name, phone: head.phone, office: head.office || seed.office, designation: head.designation } : seed;
};

// ---------- Admin actions: create departments & build hierarchy ----------
function addDepartment({ name, ico, designation, emergency, officerName, officerPhone, office }){
  const code = DB.nextDeptCode();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dept' + code;
  const dept = { code, id, name, ico: ico || '🏢', designation, higher: 'District Grievance Officer', slaHours: emergency ? 24 : 36, emergency: !!emergency, office };
  const customs = DB.get('customDepartments'); customs.push(dept); DB.set('customDepartments', customs);
  const officers = DB.get('officers');
  const newOfficer = { id: 'OFF' + Date.now(), dept: id, designation, name: officerName, phone: officerPhone, office, password: 'officer@123', rank: 1, blocked: false };
  officers.push(newOfficer); DB.set('officers', officers);
  return { dept, officer: newOfficer };
}
function addOfficerToDept({ dept, designation, name, phone, office, rank }){
  const officers = DB.get('officers');
  const officer = { id: 'OFF' + Date.now(), dept, designation, name, phone, office, password: 'officer@123', rank: rank || (officersByDept(dept).length + 1), blocked: false };
  officers.push(officer); DB.set('officers', officers);
  return officer;
}

// ---------- Escalation hierarchy ----------
// Rank convention: 1 = the top position in a department (most senior — e.g. an SSP),
// and higher numbers are more junior (e.g. SP = 2, DSP = 3 = first point of contact for
// a new complaint). This matches how people naturally read "rank 1" as the top spot.
// A new complaint starts with the most junior available officer; if they can't resolve
// it in time it climbs toward rank 1, then to the Deputy Commissioner, then to the
// Chief Minister's Office if the DC also lets it lapse.
const frontLineOfficer = deptId => { const list = officersByDept(deptId); return list[list.length - 1]; }; // highest rank number = most junior = first responder
const topOfficerOfDept = deptId => officersByDept(deptId)[0]; // rank 1 = most senior = top position
const officerById = id => DB.get('officers').find(o => o.id === id);
// Officers at the immediate senior tier above a given rank (a lower rank number).
// May be more than one, in which case the forwarding officer chooses which one.
const seniorTierOfficers = (deptId, currentRank) => {
  const lower = officersByDept(deptId).filter(o => o.rank < currentRank);
  if (!lower.length) return [];
  const target = Math.max(...lower.map(o => o.rank));
  return lower.filter(o => o.rank === target);
};
// Officers at the immediate junior tier below a given rank (a higher rank number) —
// for a senior delegating work down to a specific front-line officer.
const juniorTierOfficers = (deptId, currentRank) => {
  const higher = officersByDept(deptId).filter(o => o.rank > currentRank);
  if (!higher.length) return [];
  const target = Math.min(...higher.map(o => o.rank));
  return higher.filter(o => o.rank === target);
};

function systemAlert(toRole, message, appNo){
  const alerts = DB.get('systemAlerts');
  alerts.push({ id:'AL'+Date.now(), toRole, message, appNo, at: Date.now(), read:false });
  DB.set('systemAlerts', alerts);
}
