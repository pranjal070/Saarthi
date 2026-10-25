/* ============================================================
   SAARTHI · authority.js — one console for every administrative role
     admin    Supreme State Administrator (all 23 districts)
     dadmin   District System Administrator (their district only)
     dc       Deputy Commissioner (their district, oversight)
     eo       Executive Officer of one council / corporation
     mayor    Mayor of one municipal corporation (view)
   mp       Lok Sabha MP — sees the complaints of every Vidhan Sabha constituency in his seat (view only, no power to suspend or create roles)
   mla      MLA of one Vidhan Sabha constituency (view — no power to suspend)
   cmo      statewide oversight, may suspend any officer
   minister statewide, but only the departments of his ministry (the CM: every department)
   ============================================================ */
initI18nSwitcher(() => { if (window.__renderAuthority) window.__renderAuthority(); });
document.getElementById('langBtn')?.addEventListener('click', e => { e.stopPropagation(); document.getElementById('langMenu').classList.toggle('open'); });
document.addEventListener('click', () => document.getElementById('langMenu')?.classList.remove('open'));
// Back-button guard: re-check the session when the page is restored from the browser cache.
window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); });

const me = Session.current();
const AUTH_ROLES = ['admin','dadmin','dc','eo','mayor','mla','mp','cmo','minister'];
if (!me || !AUTH_ROLES.includes(me.role)) { location.replace('login.html'); }
else runEscalations();

if (me && AUTH_ROLES.includes(me.role)) {
  const SC = scopeOf(me);
  const isState = SC.level === 'state';
  const POWER = ['admin','dadmin','dc','cmo'];                  // directory, credentials, settings
  const CAN_BLOCK = ['admin','dadmin','cmo'];                    // block citizens / councillors
  const ACTOR = { role: me.role, name: me.name, title: me.title, district: me.district, ulb: me.ulb, ministryKey: me.ministryKey, username: me.username, ac: me.ac, ls: me.ls };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const dn = me.district ? districtName(me.district) : '';
  const un = me.ulb ? ulbName(me.ulb) : '';
  const myAc = me.role === 'mla' ? acByNo(me.ac) : null;
  const myLs = me.role === 'mp' ? lsById(me.ls) : null;
  const myMin = me.role === 'minister' ? ministryByKey(me.ministryKey) : null;
  const deptNames = ids => ids === '*' ? 'every department' : (ids.length ? ids.map(i => (deptById(i) || { name:i }).name).join(', ') : 'no department yet');

  const ROLE_META = {
    admin: { badge:'Supreme Administrator, Punjab', title:'Punjab — statewide administration', sub:'Every grievance across the state is visible here. You create and merge districts and tehsils, map councils to constituencies, promote councils to corporations, change the cabinet and MLAs, and manage every employee posting in Punjab.' },
    dadmin:{ badge:`District System Administrator · ${dn}`, title:`${dn} — district administration`, sub:`Full record for ${dn}. You set the district's ranks and positions, decide which department reports to which after an SLA breach, appoint council office-bearers, and register and transfer the district's employees.` },
    dc:    { badge:`Deputy Commissioner · ${dn}`, title:`${dn} — district oversight`, sub:`Full grievance record of ${dn} across all departments, councils and wards. You may suspend any officer posted in your district.` },
    eo:    { badge:`Executive Officer · ${un}`, title:`${un} — council oversight`, sub:`All grievances from the ${ulbWardCount(me.ulb)} wards of ${un}, and the councillors you register for them.` },
    mayor: { badge:`Mayor · ${un}`, title:`${un} — Mayor's desk`, sub:`Every grievance of the ${ulbWardCount(me.ulb)} wards of ${un} Municipal Corporation, with its councillors and office-bearers. The Executive Officer registers councillors; you oversee.` },
    mla:   { badge:`MLA · ${myAc ? myAc.name : ''}`, title:`${myAc ? myAc.name : 'Constituency'} — constituency desk`, sub:`Grievances from the councils of your Vidhan Sabha constituency${myAc ? ' (' + myAc.name + ', AC ' + myAc.no + ', Lok Sabha: ' + lsName(myAc.ls) + ')' : ''}. View only — MLAs cannot suspend or reassign officers.` },
    mp:    { badge:`MP · ${myLs ? myLs.name : ''}`, title:`${myLs ? myLs.name : 'Lok Sabha'} — Lok Sabha desk`, sub:`Grievances of the people living in the ${myLs ? lsAcs(myLs.id).length : ''} Vidhan Sabha constituencies that fall inside your Lok Sabha seat${myLs ? ' (' + myLs.name + ')' : ''}; filter by constituency. View only — MPs cannot suspend officers, reassign files or create posts or roles.` },
    cmo:   { badge:'CMO Punjab', title:"Chief Minister's Office — statewide oversight", sub:"The top of the escalation chain. Every grievance is visible from filing to resolution, with authority to refer any file directly to a department's senior-most officer, and to suspend any officer in the state." },
    minister: { badge: me.title || 'Minister', title: myMin && myMin.isCM ? 'Chief Minister — statewide oversight' : `${myMin ? myMin.title : 'Ministry'} — ministry desk`,
      sub: myMin && myMin.isCM ? 'Every department in Punjab. You may suspend any officer in the state.' : `You see only the employees and grievances of: ${deptNames(myMin ? myMin.depts : [])}. Use the filters to look district- or tehsil-wise. You may suspend officers of these departments only.` }
  };
  const meta = ROLE_META[me.role];
  const scopeWord = isState ? (myMin && !myMin.isCM ? `${myMin.title}` : 'Punjab') : SC.level === 'district' ? dn : SC.level === 'ac' ? `${myAc ? myAc.name : ''} constituency` : SC.level === 'ls' ? `${myLs ? myLs.name : ''} Lok Sabha seat` : un;

  document.getElementById('uName').textContent = me.name;
  document.getElementById('uMeta').textContent = me.title;
  document.getElementById('uBadge').textContent = meta.badge;
  document.getElementById('pgTitle').textContent = meta.title;
  document.getElementById('pgSub').textContent = meta.sub;
  document.getElementById('globalSearch').placeholder = `Search grievances in ${scopeWord}…`;
  document.getElementById('slaTitle').textContent = `${scopeWord} SLA compliance`;
  document.getElementById('grievSub').textContent = `Full record for ${scopeWord} — every department${SC.level === 'ulb' ? ', every ward' : ', every council'}.`;
  document.getElementById('deptPerfSub').textContent = `Disposal rate and load for every department in ${scopeWord}.`;
  document.getElementById('deptPerfTitle').textContent = SC.depts && SC.depts !== '*' ? `${SC.depts.length} department${SC.depts.length === 1 ? '' : 's'} in your ministry` : `All ${allDepartments().length} departments`;
  document.getElementById('notifList').parentElement.querySelector('h5').textContent = `${scopeWord} escalations`;

  const hr = new Date().getHours();
  document.getElementById('greet').textContent = `${hr<12?t('greetMorning'):hr<17?t('greetAfternoon'):t('greetEvening')}, ${me.name.split(' ')[0]}`;
  document.getElementById('dateLine').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('avaBtn').textContent = me.name[0];
  document.getElementById('popName').textContent = me.name;
  document.getElementById('popMeta').textContent = me.title;

  const themeBtn = document.getElementById('themeBtn');
  const applyTheme = t => { document.documentElement.dataset.theme=t; themeBtn.innerHTML = t === 'dark' ? '<i class="mi mi-sun"></i>' : '<i class="mi mi-moon"></i>'; localStorage.setItem('saarthi_theme_v3',t); };
  applyTheme(localStorage.getItem('saarthi_theme_v3')||'light');
  themeBtn.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
  const toggle=(btn,pop)=>btn.addEventListener('click',e=>{e.stopPropagation();document.querySelectorAll('.pop').forEach(p=>p!==pop&&p.classList.remove('open'));pop.classList.toggle('open');});
  toggle(document.getElementById('bellBtn'),document.getElementById('bellPop'));
  toggle(document.getElementById('avaBtn'),document.getElementById('avaPop'));
  document.addEventListener('click',()=>document.querySelectorAll('.pop').forEach(p=>p.classList.remove('open')));
  document.querySelectorAll('.pop').forEach(p=>p.addEventListener('click',e=>e.stopPropagation()));

  function go(sec){
    document.querySelectorAll('.dash-sec').forEach(s=>s.classList.toggle('on', s.id==='sec-'+sec));
    document.querySelectorAll('.side a[data-sec]').forEach(a=>a.classList.toggle('on', a.dataset.sec===sec));
    window.scrollTo({top:0,behavior:'smooth'});
    if (sec === 'livemap' && window.__lm) window.__lm.refresh();
  }
  document.querySelectorAll('.side a[data-sec]').forEach(a=>a.addEventListener('click',()=>go(a.dataset.sec)));

  // ---- which sidebar items each role gets ----
  const show = (id, yes) => { document.getElementById(id).hidden = !yes; };
  const R = me.role;
  show('navCred', [...POWER, 'eo'].includes(R));
  show('navSettings', POWER.includes(R));
  show('navPeople', POWER.includes(R));
  show('navDeptManage', POWER.includes(R));
  show('navHier', ['admin','dadmin','dc','cmo'].includes(R));
  show('navEmp', ['admin','dadmin','dc','cmo','minister'].includes(R));
  show('navGeo', R !== 'mla' && R !== 'mp');
  show('navDistricts', ['admin','dadmin','dc','cmo'].includes(R));
  show('navConst', true);
  show('navCabinet', ['admin','cmo','minister'].includes(R));
  show('navBearers', ['admin','dadmin','dc','cmo','eo','mayor'].includes(R));
  document.getElementById('navWardsLbl').textContent = SC.level === 'ulb' ? 'Wards' : 'Councils';

  // ---- view filter (district · tehsil · Lok Sabha) for the statewide roles ----
  const VF = { district:'', tehsil:'', ls:'', ac:'' };
  const acOfC = c => { const l = ulbAcs(c.ulb || DEFAULT_ULB).filter(x => !SC.ls || (acByNo(x.ac) || {}).ls === SC.ls).find(x => !(x.from || x.to) || (Number(c.ward) >= (x.from || 1) && Number(c.ward) <= (x.to || 9999))); return l ? acByNo(l.ac) : null; };
  const _gc = {}; const geoOf = id => _gc[id] || (_gc[id] = ulbGeo(id) || { tehsil:null, ls:[], acs:[] });
  const vfOk = c => (!VF.ac || (acOfC(c) || {}).no === Number(VF.ac)) && (!VF.district || c.district === VF.district) && (!VF.tehsil || (geoOf(c.ulb).tehsil || {}).id === VF.tehsil) && (!VF.ls || geoOf(c.ulb).ls.some(l => l.id === VF.ls));
  const vfBar = document.getElementById('viewFilter'), vfD = document.getElementById('vfDist'), vfT = document.getElementById('vfTehsil'), vfL = document.getElementById('vfLs');
  if (isState) {
    vfBar.hidden = false;
    vfD.innerHTML = '<option value="">All districts</option>' + allDistricts().map(d => `<option value="${d.id}">${esc(districtFull(d.id))}</option>`).join('');
    vfL.innerHTML = '<option value="">All Lok Sabha seats</option>' + LOK_SABHA.map(l => `<option value="${l.id}">Lok Sabha: ${esc(l.name)}</option>`).join('');
    const fillT = () => { vfT.innerHTML = '<option value="">All tehsils</option>' + (VF.district ? tehsilsOfDistrict(VF.district) : allTehsils()).sort((a,b) => a.name.localeCompare(b.name)).map(t => `<option value="${t.id}">${esc(t.name)}${VF.district ? '' : ' (' + esc(districtName(t.district)) + ')'}</option>`).join(''); vfT.value = VF.tehsil; };
    fillT();
    vfD.addEventListener('change', () => { VF.district = vfD.value; VF.tehsil = ''; fillT(); renderAll(); });
    vfT.addEventListener('change', () => { VF.tehsil = vfT.value; renderAll(); });
    vfL.addEventListener('change', () => { VF.ls = vfL.value; renderAll(); });
    document.getElementById('vfReset').addEventListener('click', () => { VF.district = VF.tehsil = VF.ls = ''; vfD.value = vfL.value = ''; fillT(); renderAll(); });
  }
  if (SC.level === 'ls') {
    vfBar.hidden = false; vfD.hidden = vfT.hidden = true;
    vfL.innerHTML = '<option value="">All constituencies in ' + esc(myLs.name) + '</option>' + lsAcs(myLs.id).sort((a,b) => a.no - b.no).map(a => `<option value="${a.no}">${a.no} · ${esc(a.name)} — ${esc(districtName(a.district))}</option>`).join('');
    vfL.addEventListener('change', () => { VF.ac = vfL.value; renderAll(); });
    document.getElementById('vfReset').addEventListener('click', () => { VF.ac = ''; vfL.value = ''; renderAll(); });
  }
  if (myMin && !myMin.isCM && (!myMin.depts.length || !myMin.holder)) {
    const eb = document.getElementById('emptyMinistry'); eb.hidden = false;
    eb.textContent = !myMin.holder ? 'This ministry is vacant.' : 'No department is mapped to your ministry yet, so there are no grievances or employees to show. The State Administrator maps departments to ministries under Cabinet & MLAs.';
  }

  const isDone = c => [STATUS.RESOLVED, STATUS.CLOSED].includes(c.status);
  const allComplaints = () => DB.get('complaints').filter(c => complaintInScope(SC, c)).filter(vfOk);
  const placeOf = c => SC.level === 'ulb' ? `Ward ${c.ward}` : SC.level === 'ls' ? `${(acOfC(c) || { name:'—' }).name} · ${ulbName(c.ulb)} · Ward ${c.ward}` : `${ulbName(c.ulb)} · Ward ${c.ward}`;

  let selectedRangeDays = 30;
  document.querySelectorAll('#rangeCtl button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#rangeCtl button').forEach(x => x.classList.remove('on')); b.classList.add('on');
    selectedRangeDays = Number(b.dataset.range);
    renderOverview();
  }));
  const inRange = c => selectedRangeDays === 0 || (Date.now() - c.createdAt) <= selectedRangeDays * 864e5;

  function renderOverview(){
    const all = allComplaints().filter(inRange), open = all.filter(c => !isDone(c));
    document.getElementById('kTotal').textContent = all.length;
    document.getElementById('kOpen').textContent = open.length;
    document.getElementById('kDone').textContent = all.length - open.length;
    document.getElementById('kEsc').textContent = all.filter(c => c.escalated).length;

    const byDept = Object.entries(all.reduce((a,c)=>{const n=(deptById(c.dept)||{name:c.dept}).name;a[n]=(a[n]||0)+1;return a;},{}))
      .map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);
    document.getElementById('chDonut').innerHTML = donut(byDept);

    const pct = all.length ? Math.round(all.filter(c=>!c.escalated).length/all.length*100) : 100;
    document.getElementById('chGauge').innerHTML = gauge(pct) + `<p style="font-size:.78rem;color:var(--muted);margin-top:.6rem">${all.length-all.filter(c=>c.escalated).length} of ${all.length} resolved without escalation, in this range.</p>`;

    const mine = allComplaints();
    let labels = [], counts = [];
    if (selectedRangeDays === 1) {
      document.getElementById('trendLabel').textContent = 'Last 24 hours';
      for (let i = 23; i >= 0; i--) {
        const from = Date.now() - (i+1)*36e5, to = Date.now() - i*36e5;
        labels.push(new Date(to).getHours() + 'h');
        counts.push(mine.filter(c => c.createdAt >= from && c.createdAt < to).length);
      }
    } else if (selectedRangeDays === 7 || selectedRangeDays === 30) {
      document.getElementById('trendLabel').textContent = `Last ${selectedRangeDays} days`;
      const step = selectedRangeDays === 7 ? 1 : 5;
      for (let i = selectedRangeDays; i >= 0; i -= step) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const from = new Date(d); from.setHours(0,0,0,0);
        const to = new Date(from); to.setDate(to.getDate() + step);
        labels.push(d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }));
        counts.push(mine.filter(c => c.createdAt >= from.getTime() && c.createdAt < to.getTime()).length);
      }
    } else {
      document.getElementById('trendLabel').textContent = selectedRangeDays === 180 ? 'Last 6 months' : 'All time, by month';
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        labels.push(d.toLocaleString('en-IN', { month:'short' }));
        counts.push(mine.filter(c => { const cd = new Date(c.createdAt); return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear(); }).length);
      }
    }
    document.getElementById('chBars').innerHTML = bars(labels.map((l,i) => ({ label:l, value:counts[i] })));

    const watch = open.filter(c => c.escalated).sort((a,b)=>a.createdAt-b.createdAt).slice(0,8);
    document.getElementById('watchList').innerHTML = watch.length
      ? watch.map(c=>`<div class="card qcard pri" style="margin-bottom:.6rem;padding:.8rem 1rem;cursor:pointer" onclick="openC('${c.appNo}')">
          <div style="display:flex;justify-content:space-between;gap:.5rem"><b style="font-size:.86rem">${esc(c.subject)}</b>${badge(c)}</div>
          <div style="font-size:.74rem;color:var(--muted);margin-top:.2rem">${c.appNo} · ${esc((deptById(c.dept)||{}).name)} · ${esc(placeOf(c))}</div></div>`).join('')
      : `<div class="chart-empty">No escalations pending in this range.</div>`;

    document.getElementById('bellDot').hidden = !watch.length;
    document.getElementById('notifList').innerHTML = watch.length
      ? watch.slice(0,6).map(c=>`<div class="item" style="cursor:pointer" onclick="openC('${c.appNo}')"><div>⚠️</div>
          <div><div class="t">${esc(c.subject)}</div><div class="s">${c.appNo} · ${esc((deptById(c.dept)||{}).name)}</div></div></div>`).join('')
      : `<div class="item"><div class="s">No escalations. All departments on track.</div></div>`;

    // The Deputy Commissioner also sees direct system alerts for their own district
    if (me.role === 'dc') {
      const alerts = DB.get('systemAlerts').filter(a => a.toRole === 'dc' && (a.district || DEFAULT_DISTRICT) === me.district && !a.read).sort((a,b) => b.at - a.at);
      if (alerts.length) {
        document.getElementById('bellDot').hidden = false;
        document.getElementById('notifList').innerHTML =
          alerts.slice(0,6).map(a => `<div class="item" style="cursor:pointer" onclick="openC('${a.appNo}')"><div>📨</div>
            <div><div class="t">${esc(a.message)}</div><div class="s">${fmt(a.at)}</div></div></div>`).join('')
          + document.getElementById('notifList').innerHTML;
      }
    }
  }

  // ---- All grievances ----
  document.getElementById('fStatus').innerHTML += Object.values(STATUS).map(s=>`<option>${s}</option>`).join('');
  document.getElementById('fDept').innerHTML += allDepartments().map(d=>`<option value="${d.id}">${d.name}</option>`).join('') + `<option value="mc-office">Municipal Councillor</option>`;
  const scopeUlbs = () => allUlbs().filter(u => SC.level === 'state' || (SC.level === 'district' ? u.district === SC.district : SC.level === 'ac' ? ulbAcs(u.id).some(l => l.ac === SC.ac) : SC.level === 'ls' ? ulbAcs(u.id).some(l => (acByNo(l.ac) || {}).ls === SC.ls) : u.id === SC.ulb));
  document.getElementById('fWard').innerHTML = SC.level === 'ulb'
    ? `<option value="" data-i18n="allWards">All wards</option>` + wardNumbers(me.ulb).map(n=>`<option value="${n}">Ward ${n}</option>`).join('')
    : `<option value="">All councils</option>` + scopeUlbs().map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('');
  ['fStatus','fDept','fWard','fSearch'].forEach(id=>document.getElementById(id).addEventListener('input',renderList));
  document.getElementById('globalSearch').addEventListener('input', e => { document.getElementById('fSearch').value=e.target.value; go('grievances'); renderList(); });

  function renderList(){
    const s=document.getElementById('fStatus').value, d=document.getElementById('fDept').value, wd=document.getElementById('fWard').value, q=document.getElementById('fSearch').value.toLowerCase();
    const list = allComplaints().filter(c=>!s||c.status===s).filter(c=>!d||c.dept===d)
      .filter(c=>!wd|| (SC.level === 'ulb' ? c.ward===Number(wd) : c.ulb===wd))
      .filter(c=>!q||c.appNo.includes(q)||c.subject.toLowerCase().includes(q)||c.name.toLowerCase().includes(q))
      .sort((a,b)=>b.createdAt-a.createdAt);
    const area = document.getElementById('listArea');
    if (!list.length){ area.innerHTML=`<div class="card empty"><div class="big">🗃️</div><p><b>No records match.</b></p></div>`; return; }
    area.innerHTML = `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>${t('thAppNo')}</th><th>${t('thSubjectCitizen')}</th><th>${t('thDept')}</th><th>${t('thWard')}</th><th>${t('thStatus')}</th><th></th></tr></thead><tbody>` +
      list.slice(0,300).map(c=>`<tr><td class="mono">${c.appNo}</td>
        <td><b>${esc(c.subject)}</b><br><span style="font-size:.73rem;color:var(--muted)">${esc(c.name)} · ${fmt(c.createdAt)}</span></td>
        <td>${esc((deptById(c.dept)||{}).name)}</td><td>${esc(placeOf(c))}</td><td>${badge(c)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="openC('${c.appNo}')">Open</button></td></tr>`).join('') + '</tbody></table></div>'
      + (list.length > 300 ? `<p style="font-size:.78rem;color:var(--muted);margin-top:.5rem">Showing the latest 300 of ${list.length}. Use the filters to narrow down.</p>` : '');
  }

  function renderDepartments(){
    const all = allComplaints();
    const rows = allDepartments().map(d => ({ label:`${d.ico} ${d.name}`,
      total: all.filter(c=>c.dept===d.id).length, done: all.filter(c=>c.dept===d.id&&isDone(c)).length }))
      .sort((a,b)=>b.total-a.total);
    document.getElementById('deptRows').innerHTML = progressRows(rows);
  }
  function renderWards(){
    const all = allComplaints();
    let rows;
    if (SC.level === 'ulb') {
      document.getElementById('wardsTitle').textContent = 'Ward performance';
      document.getElementById('wardsSub').textContent = `All ${ulbWardCount(me.ulb)} wards of ${un} — grievance load and resolution.`;
      document.getElementById('wardsPanelTitle').textContent = `Wards of ${un}`;
      rows = wardNumbers(me.ulb).map(n => { const w = wardByNo(n, me.ulb); return { label:`Ward ${n} — ${w.mcName}`,
        total: all.filter(c=>c.ward===n).length, done: all.filter(c=>c.ward===n&&isDone(c)).length }; }).sort((a,b)=>b.total-a.total);
    } else {
      document.getElementById('wardsTitle').textContent = 'Council performance';
      document.getElementById('wardsSub').textContent = `Grievance load and resolution for every council and corporation in ${scopeWord}. Councils with no grievances yet are hidden.`;
      document.getElementById('wardsPanelTitle').textContent = `Councils in ${scopeWord}`;
      rows = scopeUlbs().map(u => ({ label:`${u.name} (${u.type === 'corp' ? 'Corp.' : u.type === 'np' ? 'NP' : 'MC'}${isState ? ', ' + districtName(u.district) : ''})`,
        total: all.filter(c=>c.ulb===u.id).length, done: all.filter(c=>c.ulb===u.id&&isDone(c)).length }))
        .filter(r => r.total).sort((a,b)=>b.total-a.total).slice(0, 60);
    }
    document.getElementById('wardRows').innerHTML = rows.length ? progressRows(rows) : '<div class="chart-empty">No grievances filed yet.</div>';
  }

  function exportCSV(){
    const rows=[['Application No','Subject','Citizen','Department','District','Council','Ward','Status','Filed On','Escalated']]
      .concat(allComplaints().map(c=>[c.appNo,`"${c.subject}"`,c.name,(deptById(c.dept)||{}).name,districtName(c.district),ulbName(c.ulb),c.ward,c.status,fmt(c.createdAt),c.escalated?'Yes':'No']));
    const blob=new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`saarthi-${_slug(scopeWord)}-record.csv`; a.click();
    toast(`Downloaded the ${scopeWord} record as CSV.`);
  }
  window.exportCSV = exportCSV;

  function openC(appNo){
    const c = DB.get('complaints').find(x=>x.appNo===appNo);
    document.getElementById('mTitle').textContent = 'File '+c.appNo;

    if (me.role === 'dc') {
      const alerts = DB.get('systemAlerts');
      let changed = false;
      alerts.forEach(a => { if (a.toRole === 'dc' && a.appNo === appNo && !a.read) { a.read = true; changed = true; } });
      if (changed) DB.set('systemAlerts', alerts);
    }
    const canClose = ['admin','dadmin','dc','cmo','minister'].includes(me.role);
    let closeAction;
    if (c.forceClosed && c.status === STATUS.CLOSED) {
      closeAction = canClose ? `
        <div style="border-top:1px solid var(--line);margin-top:1rem;padding-top:1rem">
          <div class="notice info">This file was force-closed by administrative order.</div>
          <button class="btn btn-pine btn-sm" onclick="reopenFile('${c.appNo}')">🔓 Reopen this grievance</button>
        </div>` : `<div class="notice info" style="margin-top:1rem">This file is permanently closed.</div>`;
    } else if (c.status !== STATUS.CLOSED && canClose) {
      closeAction = `
        <div style="border-top:1px solid var(--line);margin-top:1rem;padding-top:1rem">
          <p style="font-weight:700;font-size:.85rem;margin-bottom:.5rem">Administrative action</p>
          <button class="btn btn-danger btn-sm" onclick="forceClose('${c.appNo}')">🔒 Force close this grievance</button>
          <p style="font-size:.72rem;color:var(--muted);margin-top:.4rem">Permanently closes the file regardless of current status. Only the DC, District or State Administrator, CMO Punjab, or a Minister can reopen it. Use only for duplicate, resolved-offline, or invalid grievances.</p>
        </div>`;
    } else {
      closeAction = `<div class="notice info" style="margin-top:1rem">${c.status === STATUS.CLOSED ? 'This file is closed.' : 'View only.'}</div>`;
    }

    const cmoBlock = (['cmo','minister'].includes(me.role) && !isDone(c) && c.dept !== 'mc-office') ? (() => {
      const top = topOfficerOfDept(c.dept, c.district);
      return top ? `
        <div style="border-top:1px solid var(--line);margin-top:1rem;padding-top:1rem">
          <p style="font-weight:700;font-size:.85rem;margin-bottom:.5rem">🚨 ${esc(meta.badge)} — urgent referral</p>
          <p style="font-size:.82rem;color:var(--muted);margin-bottom:.6rem">Sends this file directly to <b>${esc(top.name)}</b> (${esc(top.designation)}), the senior-most officer in ${esc(deptById(c.dept).name)}, ${esc(districtName(c.district))}, flagged for immediate action.</p>
          <label style="display:flex;align-items:center;gap:.5rem;font-size:.82rem;margin-bottom:.7rem"><input type="checkbox" id="cmoAutoBanCk" style="width:auto"> Automatically suspend this officer's account if they fail to act within the SLA window</label>
          <button class="btn btn-danger btn-sm" onclick="cmoUrgentForward('${c.appNo}')">🚨 Send urgent referral</button>
        </div>` : '';
    })() : '';

    const holder = c.currentOfficerId ? officerById(c.currentOfficerId) : null;
    document.getElementById('mBody').innerHTML = `
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem">${badge(c)} ${slaTag(c)}</div>
      ${c.urgentFromCMO && !isDone(c) ? `<div class="notice warn" style="border-left:4px solid var(--danger)">🚨 This file carries an urgent referral from ${esc(c.urgentFromRole || 'CMO Punjab')}${c.cmoAutoBan ? ' with auto-suspension enabled for inaction' : ''}.</div>` : ''}
      <dl class="kv"><dt>Citizen</dt><dd><b>${esc(c.name)}</b> · 📞 ${esc(c.phone)} · ${esc(ulbName(c.ulb))}, Ward ${c.ward}</dd>
        <dt>District</dt><dd>${esc(districtWithLs(c.district))}</dd>
        <dt>Area</dt><dd style="font-size:.84rem">${esc(ulbPlace(c.ulb))}</dd>
        <dt>Subject</dt><dd><b>${esc(c.subject)}</b></dd><dt>Department</dt><dd>${deptById(c.dept)?.ico||''} ${esc(deptById(c.dept)?.name||'')}${c.depotId ? ' · ' + esc((DEPOTS.find(d => d.id === c.depotId) || {}).name || '') + ' depot' : ''}</dd>
        ${holder ? `<dt>Now with</dt><dd>${esc(holder.name)} (${esc(holder.designation)}, ${esc((deptById(holder.dept)||{}).name)}) · <span class="mono">${esc(holder.empId)}</span></dd>` : c.level === 'dc' ? '<dt>Now with</dt><dd>Deputy Commissioner</dd>' : c.level === 'cmo' ? '<dt>Now with</dt><dd>CMO Punjab</dd>' : ''}
        <dt>Description</dt><dd>${esc(c.description)}</dd>
        <dt>Location</dt><dd>${esc(c.address||'Ward '+c.ward+', '+ulbName(c.ulb))}${c.coords?`<br><a style="color:var(--primary);font-size:.78rem;font-weight:700" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${c.coords.lat},${c.coords.lng}">📍 View on Google Maps ↗</a>`:''}</dd>
        ${c.assignedOfficer?`<dt>Assigned officer</dt><dd>${esc(c.assignedOfficer.name)} · 📞 ${esc(c.assignedOfficer.phone)}</dd>`:''}</dl>
      ${c.photo?`<p style="font-weight:700;font-size:.85rem;margin:1rem 0 .4rem">Photo evidence</p><img src="${c.photo}" style="max-height:200px;border-radius:10px;border:1px solid var(--line)">`:''}
      <p style="font-weight:700;font-size:.85rem;margin:1.2rem 0 .6rem">File movement record</p><div class="ledger">${ledgerHTML(c)}</div>
      ${closeAction}
      ${cmoBlock}`;
    document.getElementById('modalBg').classList.add('open');
  }
  window.openC = openC;
  window.__lm = LiveMap.mount({ el: document.getElementById('mapMount'), getComplaints: () => allComplaints(), onOpen: appNo => { go('grievances'); setTimeout(() => openC(appNo), 60); } });
  document.addEventListener('saarthi:sync', () => { try { renderAll(); } catch (e) {} });
  window.forceClose = async function(appNo){
    const ok = await confirmDialog({
      icon:'🔒', title:'Force close this grievance?',
      message: 'This permanently closes the file. Only the DC, District or State Administrator, CMO Punjab, or a Minister can reopen it. The citizen will see it as closed.',
      okLabel:'Force close', cancelLabel:'Cancel', danger:true
    });
    if (!ok) return;
    const list = DB.get('complaints'); const c = list.find(x => x.appNo === appNo);
    c.status = STATUS.CLOSED; c.forceClosed = true;
    c.timeline.push({ status: STATUS.CLOSED, note: `Grievance force-closed by administrative order.`, by: `${me.title} ${me.name}`, at: Date.now() });
    DB.set('complaints', list);
    openC(appNo); renderAll();
    toast('Grievance force-closed.', 'bad');
  };
  window.reopenFile = async function(appNo){
    const ok = await confirmDialog({
      icon:'🔓', title:'Reopen this grievance?',
      message: 'The file returns to its original department officer for fresh action.',
      okLabel:'Reopen', cancelLabel:'Cancel'
    });
    if (!ok) return;
    const list = DB.get('complaints'); const c = list.find(x => x.appNo === appNo);
    c.forceClosed = false; c.status = STATUS.REOPENED;
    if (c.dept !== 'mc-office') {
      const fl = frontLineOfficer(c.dept, c.district);
      c.currentOfficerId = fl ? fl.id : c.currentOfficerId;
      c.level = fl ? fl.rank : c.level;
      c.holdDept = c.dept; c.viaDepts = [];
    }
    c.levelStartedAt = Date.now(); c.escalated = false;
    c.timeline.push({ status: STATUS.REOPENED, note: `Force-closed file reopened by ${me.title} ${me.name} for further action.`, by: `${me.title} ${me.name}`, at: Date.now() });
    DB.set('complaints', list);
    openC(appNo); renderAll();
    toast('Grievance reopened.');
  };
  window.cmoUrgentForward = async function(appNo){
    const autoBan = document.getElementById('cmoAutoBanCk').checked;
    const ok = await confirmDialog({
      icon:'🚨', title:'Send urgent referral?',
      message: `This immediately reassigns the file to the department's senior-most officer with an urgent flag${autoBan ? ', and will suspend their account automatically if they fail to act in time' : ''}.`,
      okLabel:'Send referral', cancelLabel:'Cancel', danger:true
    });
    if (!ok) return;
    const list = DB.get('complaints'); const c = list.find(x => x.appNo === appNo);
    const top = topOfficerOfDept(c.dept, c.district);
    c.currentOfficerId = top.id; c.level = top.rank; c.levelStartedAt = Date.now(); c.holdDept = c.dept; c.viaDepts = [];
    c.urgentFromCMO = true; c.cmoAutoBan = autoBan; c.urgentFromRole = meta.badge;
    c.timeline.push({
      status: 'Escalated',
      note: `🚨 Urgent referral by ${meta.badge} to ${top.name} (${top.designation}) — immediate action required.` + (autoBan ? ' Account will be suspended automatically for inaction.' : ''),
      by: meta.badge, at: Date.now()
    });
    DB.set('complaints', list);
    systemAlert('dc', `${meta.badge} referred grievance ${c.appNo} directly to ${deptById(c.dept).name}.`, c.appNo, c.district);
    openC(appNo); renderAll();
    toast('Urgent referral sent. The Deputy Commissioner has been notified.', 'bad');
  };
  window.closeModal = () => document.getElementById('modalBg').classList.remove('open');
  document.getElementById('modalBg').addEventListener('click', e => { if (e.target.id==='modalBg') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });

  let empMounted = false;
  function renderAll(){
    // Each section renders independently — one throwing never blanks the rest.
    [() => { for (const k in _gc) delete _gc[k]; }, renderOverview, renderList, renderDepartments, renderWards, renderCredentials, renderSettings, renderPeople, renderDeptManage, renderHierarchy, renderEmployees, renderGeo, renderDistricts, renderConstituencies, renderCabinet, renderBearers, renderAuthProfile]
      .forEach(fn => { try { fn(); } catch (err) { console.error('Saarthi render error in', fn.name, err); } });
  }
  window.__afterEmployeeChange = () => { try { renderCredentials(); renderHierarchy(); renderDeptManage(); renderDistricts(); renderList(); renderOverview(); } catch (e) { console.error(e); } };

  /* ---------- My profile ---------- */
  function renderAuthProfile(){
    document.getElementById('authProfileKV').innerHTML = `
      <dt>Name</dt><dd><b>${esc(me.name)}</b></dd>
      <dt>Role</dt><dd>${esc(meta.badge)}</dd>
      <dt>Sign-in ID</dt><dd class="mono">${esc(me.username || me.role)}</dd>
      ${me.district ? `<dt>District</dt><dd>${esc(districtWithLs(me.district))}</dd>` : ''}
      ${me.ulb ? `<dt>Council</dt><dd>${esc(un)}<br><span style="font-size:.8rem;color:var(--muted)">${esc(ulbPlace(me.ulb))}</span></dd>` : ''}
      ${myAc ? `<dt>Constituency</dt><dd>${esc(myAc.name)} (AC ${myAc.no}) · Lok Sabha: ${esc(lsName(myAc.ls))} · ${esc(districtName(myAc.district))}</dd>` : ''}
      ${myMin ? `<dt>Ministry</dt><dd>${esc(myMin.title)}<br><span style="font-size:.8rem;color:var(--muted)">Departments overseen: ${esc(deptNames(myMin.isCM ? '*' : myMin.depts))}</span></dd>` : ''}
      <dt>Scope</dt><dd>${esc(meta.sub)}</dd>`;
  }
  document.getElementById('adminPwForm').addEventListener('submit', e => {
    e.preventDefault();
    const cur = document.getElementById('curPw').value, nw = document.getElementById('newPw').value, cf = document.getElementById('confirmPw').value;
    if (nw.length < 6) return toast('New password must be at least 6 characters.', 'bad');
    if (nw !== cf) return toast('New password and confirmation do not match.', 'bad');
    API.changePassword(cur, nw).then(r => {
      if (!r.ok) return toast(r.error, 'bad');
      e.target.reset(); toast('Your password has been updated. Use it next time you sign in.');
    });
    return;
    e.target.reset();
    toast('Your password has been updated. Use it next time you sign in.');
  });

  /* ---------- Credentials: officers · councillors · authority accounts ---------- */
  let credView = 'officers';
  let credDist = isState ? DEFAULT_DISTRICT : (SC.district || DEFAULT_DISTRICT);
  let credUlb = me.ulb || (ulbsInDistrict(credDist)[0] || {}).id;
  if (me.role === 'eo') credView = 'mcs';
  const credDistSel = document.getElementById('credDist'), credUlbSel = document.getElementById('credUlb'), credQ = document.getElementById('credQ');
  credDistSel.innerHTML = allDistricts().map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  credDistSel.value = credDist;
  credDistSel.style.display = isState ? '' : 'none';
  credDistSel.addEventListener('change', () => { credDist = credDistSel.value; credUlb = (ulbsInDistrict(credDist)[0] || {}).id; renderCredentials(); });
  credUlbSel.addEventListener('change', () => { credUlb = credUlbSel.value; renderCredentials(); });
  credQ.addEventListener('input', () => renderCredentials());
  const setCredTab = v => {
    credView = v;
    ['Officers:officers','MCs:mcs','Auth:auth'].forEach(p => { const [id, k] = p.split(':'); document.getElementById('cred' + id).classList.toggle('on', k === v); });
    renderCredentials();
  };
  document.getElementById('credOfficers').addEventListener('click', () => setCredTab('officers'));
  document.getElementById('credMCs').addEventListener('click', () => setCredTab('mcs'));
  document.getElementById('credAuth').addEventListener('click', () => setCredTab('auth'));
  document.getElementById('credAuth').hidden = me.role !== 'admin';
  if (me.role === 'eo') { document.getElementById('credOfficers').hidden = true; setCredTab('mcs'); }

  function renderCredentials(){
    const area = document.getElementById('credArea');
    credUlbSel.style.display = credView === 'mcs' && me.role !== 'eo' ? '' : 'none';
    credQ.style.display = credView === 'mcs' ? 'none' : '';
    const q = (credQ.value || '').toLowerCase();
    if (credView === 'officers') {
      if (me.role === 'eo') { area.innerHTML = ''; return; }
      const byDept = {};
      DB.get('officers').filter(o => o.district === credDist)
        .filter(o => !q || o.name.toLowerCase().includes(q) || (o.empId || '').toLowerCase().includes(q) || (o.designation || '').toLowerCase().includes(q))
        .forEach(o => { (byDept[o.dept] = byDept[o.dept] || []).push(o); });
      Object.values(byDept).forEach(arr => arr.sort((a,b) => (a.rank||9) - (b.rank||9)));
      const canEdit = ['admin','dadmin','dc','cmo'].includes(me.role);
      area.innerHTML = `<p style="font-size:.8rem;color:var(--muted);margin-bottom:.7rem">Showing officers of <b>${esc(districtName(credDist))}</b>. Roll IDs, postings and transfers are under <b>Employees &amp; transfers</b>.</p>` +
        (Object.entries(byDept).map(([deptId, officers]) => {
        const d = deptById(deptId);
        return `<div class="panel" style="margin-bottom:1rem">
          <div class="p-head"><h3>${d ? d.ico + ' ' + esc(d.name) : esc(deptId)}</h3><span class="sub">${officers.length} in hierarchy</span></div>
          ` + officers.map(o => `<div class="cred-row" style="flex-direction:column;align-items:stretch">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
              <div class="who"><b>${o.blocked ? '🚫 ' : ''}${esc(o.name)}</b><span>Rank ${o.rank||1} · ${esc(o.designation)} · <span class="mono">${esc(o.empId)}</span> · 📞 ${esc(o.phone)}${o.blocked ? (o.suspension ? ` · SUSPENDED by ${esc(o.suspension.by)}` : ' · BLOCKED') : ''}</span></div>
              <div style="display:flex;gap:.5rem">
                <button class="btn btn-outline btn-sm" onclick="EmpUI.openDetails('${o.id}')">🪪 Details</button>
                ${canEdit ? `<button class="btn btn-outline btn-sm" onclick="toggleEdit('off-${o.id}')">✏️ Edit</button>
                ${o.blocked ? (canReinstate(ACTOR, o) ? `<button class="btn btn-pine btn-sm" onclick="EmpUI.openReinstate('${o.id}')">✔ Reinstate</button>` : (canSuspend(ACTOR, o) ? '<button class="btn btn-outline btn-sm" disabled title="Ordered by a higher authority">Suspended</button>' : ''))
                  : (canSuspend(ACTOR, o) ? `<button class="btn btn-danger btn-sm" onclick="EmpUI.openSuspend('${o.id}')">🚫 Suspend</button>` : '')}` : ''}
              </div>
            </div>
            ${canEdit ? `<div id="edit-off-${o.id}" style="display:none;margin-top:.8rem;padding-top:.8rem;border-top:1px dashed var(--line)">
              <div class="form-grid">
                <div class="field"><label>Officer name</label><input id="edn-off-${o.id}" value="${esc(o.name)}"></div>
                <div class="field"><label>Designation</label><input id="edd-off-${o.id}" value="${esc(o.designation)}"></div>
                <div class="field"><label>Contact number</label><input id="edp-off-${o.id}" maxlength="10" value="${esc(o.phone)}"></div>
                <div class="field"><label>Hierarchy rank</label><input id="edr-off-${o.id}" type="number" min="1" value="${o.rank||1}">
                  <div class="hint">1 = department head. Higher numbers are more junior — the front-line officer receives new files.</div></div>
                <div class="field full"><label>Office address</label><input id="edo-off-${o.id}" value="${esc(o.office || '')}"></div>
              </div>
              <button class="btn btn-pine btn-sm" onclick="saveOfficerDetails('${o.id}')">Save details</button>
            </div>
            <div class="pwbox" style="margin-top:.7rem">
              <input type="text" id="pw-off-${o.id}" placeholder="New password" minlength="6">
              <button class="btn btn-outline btn-sm" onclick="resetOfficerPw('${o.id}')">Set password</button>
            </div>` : ''}</div>`).join('') + `</div>`;
      }).join('') || '<div class="card empty"><p>No officers match.</p></div>');
    } else if (credView === 'mcs') {
      const ulbId = me.role === 'eo' ? me.ulb : credUlb;
      const ulbs = ulbsInDistrict(me.role === 'eo' ? (SC.district) : credDist);
      if (me.role !== 'eo') credUlbSel.innerHTML = ulbs.map(u => `<option value="${u.id}" ${u.id === ulbId ? 'selected' : ''}>${esc(u.name)} (${u.wards || '?'} wards)</option>`).join('');
      const n = ulbWardCount(ulbId);
      if (!n) { area.innerHTML = `<div class="card empty"><p><b>${esc(ulbName(ulbId))}</b> has no verified ward count yet. Ask the District or State Administrator to enter it under <b>Punjab structure</b>.</p></div>`; return; }
      const canBlock = CAN_BLOCK.includes(me.role);
      const rowsHtml = wardNumbers(ulbId).map(w => {
        const m = mcOf(ulbId, w);
        if (!m) return `<div class="cred-row" style="flex-direction:column;align-items:stretch">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
            <div class="who"><b>Ward ${w} — vacant</b><span>No councillor is registered yet.</span></div>
            <button class="btn btn-outline btn-sm" onclick="toggleEdit('mcnew-${w}')">➕ Register councillor</button></div>
          <div id="edit-mcnew-${w}" style="display:none;margin-top:.8rem;padding-top:.8rem;border-top:1px dashed var(--line)">
            <div class="form-grid">
              <div class="field"><label>Councillor name</label><input id="nmn-${w}"></div>
              <div class="field"><label>Contact number</label><input id="nmp-${w}" maxlength="10"></div>
            </div>
            <button class="btn btn-pine btn-sm" onclick="registerMC('${ulbId}',${w})">Register (password mc@123)</button>
          </div></div>`;
        return `<div class="cred-row" style="flex-direction:column;align-items:stretch">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
            <div class="who"><b>${m.blocked ? '🚫 ' : '🤝 '}${esc(m.name)}${officeTagOf(ulbId, m.ward) ? ` <span class="badge b-res">${esc(officeTagOf(ulbId, m.ward))}</span>` : ''}</b><span>Ward ${m.ward} Councillor${m.office ? ' · ' + esc(m.office) : ''} · 📞 ${esc(m.phone)}${m.blocked ? ' · BLOCKED' : ''}</span></div>
            <div style="display:flex;gap:.5rem">
              <button class="btn btn-outline btn-sm" onclick="toggleEdit('mc-${m.ward}')">✏️ Edit details</button>
              ${canBlock ? `<button class="btn ${m.blocked ? 'btn-pine' : 'btn-danger'} btn-sm" onclick="toggleBlockMC('${ulbId}',${m.ward})">${m.blocked ? '✔ Unblock' : '🚫 Block'}</button>` : ''}
            </div>
          </div>
          <div id="edit-mc-${m.ward}" style="display:none;margin-top:.8rem;padding-top:.8rem;border-top:1px dashed var(--line)">
            <div class="form-grid">
              <div class="field"><label>Councillor name</label><input id="edn-mc-${m.ward}" value="${esc(m.name)}"></div>
              <div class="field"><label>Contact number</label><input id="edp-mc-${m.ward}" maxlength="10" value="${esc(m.phone)}"></div>
              <div class="field"><label>Ward number</label>
                <select id="edw-mc-${m.ward}">${wardNumbers(ulbId).map(x => `<option value="${x}" ${x===m.ward?'selected':''}>Ward ${x}</option>`).join('')}</select>
                <div class="hint">Use this only after an election result changes which ward a councillor represents.</div></div>
              <div class="field full"><label>Office address</label><input id="edo-mc-${m.ward}" value="${esc(m.office || '')}"></div>
            </div>
            <button class="btn btn-pine btn-sm" onclick="saveMCDetails('${ulbId}',${m.ward})">Save details</button>
          </div>
          <div class="pwbox" style="margin-top:.7rem">
            <input type="text" id="pw-mc-${m.ward}" placeholder="New password" minlength="6">
            <button class="btn btn-outline btn-sm" onclick="resetMCPw('${ulbId}',${m.ward})">Set password</button>
          </div></div>`;
      }).join('');
      area.innerHTML = `<div class="panel"><div class="p-head"><h3>${esc(ulbName(ulbId))} · ${n} wards</h3><span class="sub">${DB.get('mcs').filter(m => (m.ulb||DEFAULT_ULB) === ulbId).length} councillors registered</span></div>${rowsHtml}</div>`;
    } else if (credView === 'auth') {
      if (me.role !== 'admin') { area.innerHTML = ''; return; }
      const auths = DB.get('authorities').filter(a => a.username !== 'admin')
        .filter(a => !q || a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q) || (a.title || '').toLowerCase().includes(q));
      const LBL = { dadmin:'District Admin', dc:'Deputy Commissioner', eo:'Executive Officer', mayor:'Mayor', mla:'MLA', mp:'MP (Lok Sabha)', cmo:'CMO', minister:'Minister' };
      area.innerHTML = `<p style="font-size:.8rem;color:var(--muted);margin-bottom:.7rem">${auths.length} accounts match${auths.length > 60 ? ' — showing the first 60; use the search box to find one' : ''}. Includes a District Administrator and Deputy Commissioner for every district, an Executive Officer for each council, a Mayor for each corporation, an MLA for each of the 117 constituencies, and a login for every ministry.</p>` +
        `<div class="panel">` + auths.slice(0,60).map(a => `<div class="cred-row">
          <div class="who"><b>${esc(a.name)}</b><span>${LBL[a.role] || a.role}${a.district ? ' · ' + esc(districtName(a.district)) : ''}${a.blocked ? ' · <b style="color:var(--danger)">inactive</b>' : ''} · sign-in ID <span class="mono">${esc(a.username)}</span></span></div>
          <div class="pwbox">
            <input type="text" id="pw-auth-${a.username}" placeholder="New password" minlength="6">
            <button class="btn btn-outline btn-sm" onclick="resetAuthPw('${a.username}')">Set password</button>
          </div></div>`).join('') + `</div>`;
    }
  }
  window.resetAuthPw = function(username){
    const input = document.getElementById('pw-auth-' + username);
    const pw = input.value.trim();
    if (pw.length < 6) return toast('Password must be at least 6 characters.', 'bad');
    const list = DB.get('authorities'); const a = list.find(x => x.username === username);
    a.password = pw; DB.set('authorities', list); input.value = '';
    toast(`Password updated for ${a.name}.`);
  };
  window.toggleEdit = id => {
    const el = document.getElementById('edit-' + id);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  };
  window.saveOfficerDetails = function(officerId){
    const name = document.getElementById('edn-off-' + officerId).value.trim();
    const designation = document.getElementById('edd-off-' + officerId).value.trim();
    const phone = document.getElementById('edp-off-' + officerId).value.trim();
    const office = document.getElementById('edo-off-' + officerId).value.trim();
    const rank = Number(document.getElementById('edr-off-' + officerId).value) || 1;
    if (name.length < 3) return toast('Enter a valid officer name.', 'bad');
    if (!/^[6-9]\d{9}$/.test(phone)) return toast('Enter a valid 10-digit contact number.', 'bad');
    const list = DB.get('officers'); const o = list.find(x => x.id === officerId);
    const moved = o.rank !== rank || o.designation !== designation;
    o.name = name; o.designation = designation; o.phone = phone; o.office = office; o.rank = rank;
    const cur = (o.postings || []).find(p => !p.to); if (cur && moved) { cur.designation = designation; cur.rank = rank; cur.office = office; }
    DB.set('officers', list);
    toast(`Details updated for ${name}.`);
    renderCredentials(); renderHierarchy();
  };
  window.resetOfficerPw = function(officerId){
    const input = document.getElementById('pw-off-' + officerId);
    const pw = input.value.trim();
    if (pw.length < 6) return toast('Password must be at least 6 characters.', 'bad');
    const list = DB.get('officers'); const o = list.find(x => x.id === officerId);
    o.password = pw; DB.set('officers', list); input.value = '';
    toast(`Password updated for ${o.name}.`);
  };
  window.registerMC = function(ulb, ward){
    const name = document.getElementById('nmn-' + ward).value.trim(), phone = document.getElementById('nmp-' + ward).value.trim();
    if (name.length < 3) return toast('Enter a valid councillor name.', 'bad');
    if (!/^[6-9]\d{9}$/.test(phone)) return toast('Enter a valid 10-digit contact number.', 'bad');
    const list = DB.get('mcs');
    if (list.some(m => (m.ulb || DEFAULT_ULB) === ulb && m.ward === ward)) return toast('That ward already has a councillor.', 'bad');
    list.push({ ulb, ward, name, phone, office: `Ward ${ward} Office, ${ulbName(ulb)}`, password: 'mc@123', blocked: false });
    DB.set('mcs', list);
    toast(`${name} registered as councillor of Ward ${ward}, ${ulbName(ulb)}. Password: mc@123`);
    renderCredentials(); renderWards();
  };
  window.toggleBlockMC = async function(ulb, ward){
    if (!CAN_BLOCK.includes(me.role)) return;
    const list = DB.get('mcs'); const m = list.find(x => (x.ulb || DEFAULT_ULB) === ulb && x.ward === ward);
    const action = m.blocked ? 'unblock' : 'block';
    const ok = await confirmDialog({
      icon: m.blocked ? '✔️' : '🚫', title: `${action === 'block' ? 'Block' : 'Unblock'} this councillor's account?`,
      message: action === 'block' ? `${m.name} will immediately lose access to their dashboard.` : `${m.name} will regain access.`,
      okLabel: action === 'block' ? 'Block account' : 'Unblock account', cancelLabel: 'Cancel', danger: action === 'block'
    });
    if (!ok) return;
    m.blocked = !m.blocked; DB.set('mcs', list);
    toast(`${m.name} has been ${m.blocked ? 'blocked' : 'unblocked'}.`, m.blocked ? 'bad' : 'ok');
    renderCredentials();
  };
  window.saveMCDetails = function(ulb, currentWard){
    const name = document.getElementById('edn-mc-' + currentWard).value.trim();
    const phone = document.getElementById('edp-mc-' + currentWard).value.trim();
    const office = document.getElementById('edo-mc-' + currentWard).value.trim();
    const newWard = Number(document.getElementById('edw-mc-' + currentWard).value);
    if (name.length < 3) return toast('Enter a valid councillor name.', 'bad');
    if (!/^[6-9]\d{9}$/.test(phone)) return toast('Enter a valid 10-digit contact number.', 'bad');
    const list = DB.get('mcs');
    if (newWard !== currentWard && list.some(m => (m.ulb || DEFAULT_ULB) === ulb && m.ward === newWard)) {
      return toast(`Ward ${newWard} already has a councillor on record. Reassign or remove that one first.`, 'bad');
    }
    const m = list.find(x => (x.ulb || DEFAULT_ULB) === ulb && x.ward === currentWard);
    m.name = name; m.phone = phone; m.office = office; m.ward = newWard;
    DB.set('mcs', list);
    toast(`Details updated for ${name} (Ward ${newWard}).`);
    renderCredentials();
  };
  window.resetMCPw = function(ulb, ward){
    const input = document.getElementById('pw-mc-' + ward);
    const pw = input.value.trim();
    if (pw.length < 6) return toast('Password must be at least 6 characters.', 'bad');
    const list = DB.get('mcs'); const m = list.find(x => (x.ulb || DEFAULT_ULB) === ulb && x.ward === ward);
    m.password = pw; DB.set('mcs', list); input.value = '';
    toast(`Password updated for ${m.name} (Ward ${ward}).`);
  };

  /* ---------- Notification settings, data export, maintenance ---------- */
  let notifyBound = false;
  function renderSettings(){
    if (!POWER.includes(me.role)) return;
    const s = notifySettings();
    const tg = document.getElementById('notifyToggle');
    tg.checked = s.enabled;
    if (!notifyBound) {
      notifyBound = true;
      tg.addEventListener('change', () => {
        setNotifySettings({ enabled: tg.checked });
        toast(tg.checked ? 'Notifications turned ON for all citizens.' : 'Notifications turned OFF for all citizens.', tg.checked ? 'ok' : 'bad');
      });
    }
    const log = DB.get('notifications').sort((a,b) => b.at - a.at).slice(0, 25);
    document.getElementById('notifCount').textContent = `${DB.get('notifications').length} total sent`;
    document.getElementById('notifLog').innerHTML = log.length
      ? log.map(n => `<div class="log-row"><div class="li">${n.sent ? '📧' : '🚫'}</div>
          <div style="flex:1"><b>${esc(n.subject)}</b>
          <div class="lm">To ${esc(n.citizenName)} · ${esc(n.email || 'no email')} · 📱 ${esc(n.phone)}</div>
          <div class="lt">${fmt(n.at)} ${n.sent ? '' : '(blocked — notifications were off)'}</div></div></div>`).join('')
      : `<div class="chart-empty">No notifications sent yet.</div>`;
    renderMaintenance();
  }

  const SAARTHI_DATA_KEYS = ['users','complaints','officers','mcs','authorities','customDepartments','notifications','notify','systemAlerts','positions','rules','transfers','customUlbs','ulbOverrides','empseq','seq','deptcode_seq','schema','customDistricts','distOverrides','customTehsils','tehsilOverrides','acOverrides','ulbMap','mlas','ministries','officeBearers','officeLog','geoLog','cabinetLog','mergeRequests'];
  if (false) {
    document.getElementById('dataMovePanel').style.display = 'none';   // data now lives in MongoDB
    document.getElementById('exportDataBtn').addEventListener('click', () => {
      const dump = {};
      SAARTHI_DATA_KEYS.forEach(k => { const raw = localStorage.getItem('saarthi_' + k); if (raw !== null) dump[k] = JSON.parse(raw); });
      dump._exportedAt = new Date().toISOString();
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `saarthi-data-${new Date().toISOString().slice(0,10)}.json`; a.click();
      toast('Exported. Bring this file to wherever you want the same data to appear.');
    });
    document.getElementById('importDataInput').addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const text = await file.text();
        const dump = JSON.parse(text);
        const ok = await confirmDialog({
          icon:'⚠️', title:'Replace all data in this browser?',
          message: `This will overwrite every citizen, complaint, officer, and setting currently stored here with the contents of "${file.name}". This cannot be undone.`,
          okLabel:'Replace everything', cancelLabel:'Cancel', danger:true
        });
        if (!ok) { e.target.value = ''; return; }
        SAARTHI_DATA_KEYS.forEach(k => { if (dump[k] !== undefined) localStorage.setItem('saarthi_' + k, JSON.stringify(dump[k])); });
        toast('Data imported. Reloading…');
        setTimeout(() => location.reload(), 800);
      } catch (err) {
        toast('That file could not be read — make sure it\'s a Saarthi export.', 'bad');
      }
      e.target.value = '';
    });
  }

  function renderMaintenance(){
    if (me.role !== 'admin') return;
    document.getElementById('maintenancePanel').style.display = 'block';
    const m = getMaintenance();
    document.getElementById('maintToggle').checked = m.enabled;
    document.getElementById('maintMessage').value = m.message || '';
    if (m.reopenAt) {
      const d = new Date(m.reopenAt);
      const pad = n => String(n).padStart(2, '0');
      document.getElementById('maintReopenAt').value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } else {
      document.getElementById('maintReopenAt').value = '';
    }
    document.getElementById('maintStatusBadge').textContent = maintenanceActive() ? '🔴 Site is currently OFFLINE' : '🟢 Site is currently live';
  }
  document.getElementById('maintReopenAt').addEventListener('change', () => {
    const m = getMaintenance();
    if (!m.enabled) return;
    const raw = document.getElementById('maintReopenAt').value;
    const reopenAt = raw ? new Date(raw).getTime() : null;
    setMaintenance({ ...m, reopenAt });
    renderMaintenance();
    toast(reopenAt ? `Auto-reopen updated to ${new Date(reopenAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}.` : 'Auto-reopen time cleared — site stays offline until you switch it back on.');
  });
  document.getElementById('maintSaveBtn').addEventListener('click', async () => {
    if (me.role !== 'admin') return;
    const enabled = document.getElementById('maintToggle').checked;
    const message = document.getElementById('maintMessage').value.trim();
    const reopenRaw = document.getElementById('maintReopenAt').value;
    const reopenAt = reopenRaw ? new Date(reopenRaw).getTime() : null;
    if (enabled) {
      const ok = await confirmDialog({
        icon:'🛠️', title:'Take the site offline?',
        message: reopenAt
          ? `Citizens, officers, and councillors will be locked out until ${new Date(reopenAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}, when it reopens automatically.`
          : 'Citizens, officers, and councillors will be locked out until you switch this back on.',
        okLabel:'Take offline', cancelLabel:'Cancel', danger:true
      });
      if (!ok) return;
    }
    setMaintenance({ enabled, message, reopenAt });
    renderMaintenance();
    toast(enabled ? 'Site is now offline for citizens, officers, and MCs.' : 'Site is live again.', enabled ? 'bad' : 'ok');
  });

  /* ---------- People directory ---------- */
  const ppWard = document.getElementById('ppWard');
  ppWard.innerHTML = SC.level === 'ulb' ? '' : `<option value="">All councils</option>` + scopeUlbs().map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('');
  ppWard.style.display = SC.level === 'ulb' ? 'none' : '';
  let ppView = 'citizens';
  document.getElementById('ppCitizens').addEventListener('click', () => { ppView='citizens';
    document.getElementById('ppCitizens').classList.add('on'); document.getElementById('ppOfficers').classList.remove('on'); renderPeople(); });
  document.getElementById('ppOfficers').addEventListener('click', () => { ppView='officers';
    document.getElementById('ppOfficers').classList.add('on'); document.getElementById('ppCitizens').classList.remove('on'); renderPeople(); });
  ppWard.addEventListener('change', renderPeople);
  document.getElementById('ppSearch').addEventListener('input', renderPeople);

  const peopleCitizens = () => DB.get('users').filter(u => inScope(SC, u));
  const peopleOfficers = () => DB.get('officers').filter(o => SC.level === 'state' || (SC.level === 'district' && o.district === SC.district));
  const peopleMcs = () => DB.get('mcs').filter(m => SC.level === 'state' || scopeUlbs().some(u => u.id === (m.ulb || DEFAULT_ULB)));

  function renderPeople(){
    if (!POWER.includes(me.role)) return;
    const area = document.getElementById('peopleArea');
    const q = (document.getElementById('ppSearch').value || '').toLowerCase();
    if (ppView === 'citizens') {
      const f = ppWard.value;
      const users = peopleCitizens().filter(u => !f || u.ulb === f)
        .filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q))
        .sort((a,b) => (a.ulb||'').localeCompare(b.ulb||'') || a.ward - b.ward);
      area.innerHTML = users.length
        ? `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>${t('thWard')}</th><th>${t('thName')}</th><th>${t('thPhone')}</th><th>${t('thEmail')}</th><th>${t('thProfession')}</th><th>${t('thGender')}</th><th>${t('thStatus')}</th><th></th></tr></thead><tbody>` +
          users.slice(0,300).map(u => `<tr${u.blocked ? ' style="opacity:.6"' : ''}><td>${esc(ulbName(u.ulb))}<br><span style="font-size:.73rem;color:var(--muted)">Ward ${u.ward}</span></td><td><b>${esc(u.name)}</b></td><td>${esc(u.phone)}</td><td>${esc(u.email||'—')}</td><td>${esc(u.profession||'—')}</td><td>${esc(u.gender||'—')}</td>
            <td>${u.blocked ? '<span class="badge b-esc">Blocked</span>' : '<span class="badge b-res">Active</span>'}</td>
            <td>${CAN_BLOCK.includes(me.role) ? `<button class="btn ${u.blocked ? 'btn-pine' : 'btn-danger'} btn-sm" onclick="toggleBlockCitizen('${u.id}')">${u.blocked ? 'Unblock' : 'Block'}</button>` : ''}</td></tr>`).join('') + '</tbody></table></div>'
        : `<div class="card empty"><div class="big">👥</div><p>No citizens match.</p></div>`;
    } else {
      const officers = peopleOfficers().filter(o => o.name.toLowerCase().includes(q) || (deptById(o.dept)||{name:''}).name.toLowerCase().includes(q) || (o.empId||'').toLowerCase().includes(q));
      const mcs = peopleMcs().filter(m => m.name.toLowerCase().includes(q));
      area.innerHTML = `<div style="overflow-x:auto">
        <table class="tbl"><thead><tr><th>${t('thName')}</th><th>${t('thRole')}</th><th>${t('thDeptWard')}</th><th>${t('thPhone')}</th></tr></thead><tbody>` +
        officers.slice(0,200).map(o => `<tr><td><b>${esc(o.name)}</b><br><span class="mono" style="font-size:.72rem;color:var(--muted)">${esc(o.empId)}</span></td><td>${esc(o.designation)}</td><td>${esc((deptById(o.dept)||{}).name)}<br><span style="font-size:.73rem;color:var(--muted)">${esc(districtName(o.district))}</span></td><td>${esc(o.phone)}</td></tr>`).join('') +
        mcs.slice(0,200).map(m => `<tr><td><b>${esc(m.name)}</b></td><td>Municipal Councillor</td><td>Ward ${m.ward}<br><span style="font-size:.73rem;color:var(--muted)">${esc(ulbName(m.ulb||DEFAULT_ULB))}</span></td><td>${esc(m.phone)}</td></tr>`).join('') +
        '</tbody></table></div>' + (officers.length > 200 ? '<p style="font-size:.78rem;color:var(--muted);margin-top:.5rem">Showing the first 200 officers — use search, or open Employees &amp; transfers for the full register.</p>' : '');
    }
  }
  window.toggleBlockCitizen = async function(citizenId){
    if (!CAN_BLOCK.includes(me.role)) return;
    const list = DB.get('users'); const u = list.find(x => x.id === citizenId);
    const action = u.blocked ? 'unblock' : 'block';
    const ok = await confirmDialog({
      icon: u.blocked ? '✔️' : '🚫', title: `${action === 'block' ? 'Block' : 'Unblock'} this citizen's account?`,
      message: action === 'block' ? `${u.name} will immediately lose access to their dashboard.` : `${u.name} will regain access.`,
      okLabel: action === 'block' ? 'Block account' : 'Unblock account', cancelLabel: 'Cancel', danger: action === 'block'
    });
    if (!ok) return;
    u.blocked = !u.blocked; DB.set('users', list);
    toast(`${u.name} has been ${u.blocked ? 'blocked' : 'unblocked'}.`, u.blocked ? 'bad' : 'ok');
    renderPeople();
  };
  window.exportPeopleCSV = function(){
    if (ppView === 'citizens') {
      const rows = [['District','Council','Ward','Name','Phone','Email','Profession','Gender']]
        .concat(peopleCitizens().map(u => [districtName(u.district), ulbName(u.ulb), u.ward, `"${u.name}"`, u.phone, u.email||'', u.profession||'', u.gender||'']));
      const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], { type:'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'saarthi-citizens.csv'; a.click();
    } else {
      const rows = [['Roll ID','Name','Role','Department/Ward','District','Phone']]
        .concat(peopleOfficers().map(o => [o.empId, `"${o.name}"`, `"${o.designation}"`, (deptById(o.dept)||{}).name, districtName(o.district), o.phone]))
        .concat(peopleMcs().map(m => ['', `"${m.name}"`, 'Municipal Councillor', 'Ward ' + m.ward + ' ' + ulbName(m.ulb||DEFAULT_ULB), '', m.phone]));
      const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], { type:'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'saarthi-officials.csv'; a.click();
    }
    toast('Downloaded people directory as CSV.');
  };

  /* ---------- Manage departments (state: create departments · district admin: add officers) ---------- */
  const aoDist = document.getElementById('aoDist'), ndDist = document.getElementById('ndDist');
  const distChoices = isState ? allDistricts() : allDistricts().filter(d => d.id === SC.district);
  const distOpts = distChoices.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  aoDist.innerHTML = distOpts; ndDist.innerHTML = distOpts;
  if (isState) { aoDist.value = DEFAULT_DISTRICT; ndDist.value = DEFAULT_DISTRICT; }
  aoDist.disabled = ndDist.disabled = distChoices.length < 2;
  aoDist.addEventListener('change', () => renderDeptManage());

  function renderDeptManage(){
    if (!POWER.includes(me.role)) return;
    const canCreateDept = me.role === 'admin', canAddOfficer = ['admin','dadmin'].includes(me.role);
    document.getElementById('deptFormsPanel').style.display = (canCreateDept || canAddOfficer) ? 'grid' : 'none';
    document.getElementById('newDeptForm').closest('.panel').style.display = canCreateDept ? '' : 'none';
    document.getElementById('addOfficerForm').closest('.panel').style.display = canAddOfficer ? '' : 'none';
    document.getElementById('deptManageSub').textContent = canCreateDept
      ? 'Create new departments for the whole state and build each district\'s officer hierarchy — no code changes required.'
      : canAddOfficer ? `Add officers to the departments of ${dn}. Ranks, positions and reporting lines are under Hierarchy & rules.`
      : 'Read-only view of every department and its officer hierarchy.';
    if (canAddOfficer) document.getElementById('aoDept').innerHTML = allDepartments().map(d => `<option value="${d.id}">${d.ico} ${esc(d.name)}</option>`).join('');
    const listDist = isState ? aoDist.value : SC.district;
    const depts = allDepartments();
    document.getElementById('deptCount').textContent = `${depts.length} departments · ${districtName(listDist)}`;
    document.getElementById('deptHierarchy').innerHTML = depts.map(d => {
      const officers = officersByDept(d.id, listDist);
      return `<div style="margin-bottom:1.1rem;padding-bottom:1.1rem;border-bottom:1px solid var(--line)">
        <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;flex-wrap:wrap">
          <b style="font-size:.95rem">${d.ico} ${esc(d.name)}</b>
          ${d.emergency ? '<span class="badge b-esc">24h emergency SLA</span>' : `<span class="badge b-sub">${d.slaHours||36}h SLA</span>`}
          ${d.custom && me.role === 'admin' ? `<label class="btn btn-outline btn-sm" style="margin-left:auto;cursor:pointer">🖼️ ${d.photo ? 'Change' : 'Add'} photo<input type="file" accept="image/jpeg,image/png,image/webp" data-deptphoto="${esc(d.id)}" hidden></label>${d.photo ? `<img src="${d.photo}" alt="" style="height:34px;border-radius:6px;border:1px solid var(--line)">` : ''}` : ''}
        </div>
        <div class="pipe-mini">${officers.length ? officers.map(o => `<span>Rank ${o.rank||1}: ${esc(o.name)} (${esc(o.designation)})</span>`).join('') : '<span>No officer posted in this district yet</span>'}</div>
      </div>`;
    }).join('');
  }

  document.getElementById('ndPhoto').addEventListener('change', async e => {
    const prev = document.getElementById('ndPhotoPrev'); prev.style.display = 'none';
    try { const p = await resizeDeptPhoto(e.target.files[0]); if (p) { prev.src = p; prev.style.display = 'block'; } }
    catch (err) { e.target.value = ''; toast(err.message, 'bad'); }
  });
  document.getElementById('newDeptForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (me.role !== 'admin') return;
    const name = document.getElementById('ndName').value.trim();
    const ico = document.getElementById('ndIco').value.trim() || '🏢';
    const designation = document.getElementById('ndDesignation').value.trim();
    const officerName = document.getElementById('ndOffName').value.trim();
    const officerPhone = document.getElementById('ndOffPhone').value.trim();
    const office = document.getElementById('ndOffice').value.trim();
    const emergency = document.getElementById('ndEmergency').checked;
    if (name.length < 3) return toast('Enter a department name.', 'bad');
    if (designation.length < 2) return toast("Enter the head officer's designation.", 'bad');
    if (officerName.length < 3) return toast("Enter the head officer's name.", 'bad');
    if (!/^[6-9]\d{9}$/.test(officerPhone)) return toast('Enter a valid 10-digit contact number.', 'bad');
    const district = ndDist.value;
    let photo = ''; try { photo = await resizeDeptPhoto(document.getElementById('ndPhoto').files[0]); } catch (err) { return toast(err.message, 'bad'); }
    const { dept, officer } = addDepartment({ name, ico, designation, emergency, officerName, officerPhone, office, district, photo, by: me });
    toast(`Department "${dept.name}" created in ${districtName(district)} — ${officerName}, roll ID ${officer.empId}. Other districts can add their own officers. Password: officer@123`);
    e.target.reset(); ndDist.value = district; document.getElementById('ndPhotoPrev').style.display = 'none';
    renderAll();
  });

  document.getElementById('addOfficerForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!['admin','dadmin'].includes(me.role)) return;
    const dept = document.getElementById('aoDept').value;
    const district = isState ? aoDist.value : SC.district;
    const name = document.getElementById('aoName').value.trim();
    const designation = document.getElementById('aoDesignation').value.trim();
    const phone = document.getElementById('aoPhone').value.trim();
    const rank = Number(document.getElementById('aoRank').value) || 2;
    const office = document.getElementById('aoOffice').value.trim();
    if (name.length < 3) return toast('Enter the officer\'s name.', 'bad');
    if (designation.length < 2) return toast('Enter the designation.', 'bad');
    if (!/^[6-9]\d{9}$/.test(phone)) return toast('Enter a valid 10-digit contact number.', 'bad');
    const o = addOfficerToDept({ dept, designation, name, phone, office, rank, district, by: me });
    toast(`${name} added to ${deptById(dept).name}, ${districtName(district)} — roll ID ${o.empId}. Password: officer@123`);
    e.target.reset();
    renderAll();
  });

  /* ---------- Hierarchy & reporting rules (the District Administrator's power) ---------- */
  const canShape = ['admin','dadmin'].includes(me.role);
  let hierDist = isState ? DEFAULT_DISTRICT : (SC.district || DEFAULT_DISTRICT), hierDept = 'police';
  const hDist = document.getElementById('hierDist'), hDept = document.getElementById('hierDept');
  hDist.innerHTML = allDistricts().map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  hDist.value = hierDist; hDist.style.display = isState ? '' : 'none';
  hDept.innerHTML = allDepartments().map(d => `<option value="${d.id}">${d.ico} ${esc(d.name)}</option>`).join('');
  hDept.value = hierDept;
  hDist.addEventListener('change', () => { hierDist = hDist.value; renderHierarchy(); });
  hDept.addEventListener('change', () => { hierDept = hDept.value; renderHierarchy(); });

  function renderHierarchy(){
    if (!['admin','dadmin','dc','cmo'].includes(me.role)) return;
    hDept.innerHTML = allDepartments().map(d => `<option value="${d.id}">${d.ico} ${esc(d.name)}</option>`).join(''); hDept.value = hierDept;
    document.getElementById('hierSub').textContent = canShape
      ? `Shape ${districtName(hierDist)}'s chain of command: create positions, and decide which department a file reports to when a department breaches its SLA.`
      : `Read-only view of ${districtName(hierDist)}'s chain of command and reporting lines. Only the District or State Administrator can change them.`;
    const dep = deptById(hierDept);
    document.getElementById('posTitle').textContent = `${dep.ico} ${dep.name} — positions`;
    const poss = positionsOf(hierDept, hierDist);
    document.getElementById('posList').innerHTML = poss.length ? poss.map(p => `
      <div class="cred-row" style="flex-direction:column;align-items:stretch">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
          <div class="who"><b>Rank ${p.rank} — ${esc(p.title)}${p.rank === 1 ? ' <span class="badge b-sub">Dept. head</span>' : ''}</b>
            <span>${p.officers.length ? p.officers.map(o => `${esc(o.name)} <span class="mono">${esc(o.empId)}</span>`).join(' · ') : 'Vacant — nobody holds this position yet'}</span></div>
          ${canShape ? `<div class="filter-bar" style="margin:0;gap:.5rem;align-items:center">
            <input id="rn-${p.rank}" value="${esc(p.title)}" style="width:190px;flex:0 1 190px">
            <button class="btn btn-outline btn-sm" onclick="renameRank(${p.rank})">Rename</button>
            ${p.officers.length ? '' : `<button class="btn btn-danger btn-sm" onclick="deleteRank(${p.rank})">Remove</button>`}</div>` : ''}
        </div></div>`).join('') : '<div class="chart-empty">No positions in this department yet.</div>';
    document.getElementById('posRank').value = poss.length + 1;
    document.getElementById('posForm').style.display = canShape ? '' : 'none';

    const rules = rulesOf(hierDist);
    document.getElementById('ruleList').innerHTML = rules.length ? rules.map(r => `
      <div class="cred-row"><div class="who"><b>${deptById(r.from).ico} ${esc(deptById(r.from).name)} <span style="color:var(--primary)">→</span> ${deptById(r.to).ico} ${esc(deptById(r.to).name)}</b>
        <span>Set by ${esc(r.by || 'administrator')} · ${fmt(r.at)}</span></div>
        ${canShape ? `<button class="btn btn-danger btn-sm" onclick="deleteRule('${r.id}')">Remove</button>` : ''}</div>`).join('')
      : '<div class="notice info">No reporting lines set. After a department\'s own ranks, files go straight to the Deputy Commissioner.</div>';
    const withOfficers = allDepartments().filter(d => officersByDept(d.id, hierDist).length);
    document.getElementById('ruleFrom').innerHTML = allDepartments().map(d => `<option value="${d.id}">${d.ico} ${esc(d.name)}</option>`).join('');
    document.getElementById('ruleTo').innerHTML = withOfficers.map(d => `<option value="${d.id}">${d.ico} ${esc(d.name)}</option>`).join('');
    document.getElementById('ruleForm').style.display = canShape ? '' : 'none';
  }
  window.renameRank = rank => {
    const v = document.getElementById('rn-' + rank).value.trim();
    if (v.length < 2) return toast('Enter a title for this position.', 'bad');
    renamePosition({ dept: hierDept, district: hierDist, rank, title: v });
    toast('Position renamed.'); renderHierarchy(); renderCredentials(); renderDeptManage();
  };
  window.deleteRank = async rank => {
    const ok = await confirmDialog({ icon:'🗑️', title:'Remove this position?', message:'The position is removed from the chain of command. It has no officers, so no files are affected.', okLabel:'Remove', cancelLabel:'Cancel', danger:true });
    if (!ok) return;
    if (removePosition({ dept: hierDept, district: hierDist, rank })) { toast('Position removed.'); renderHierarchy(); }
    else toast('Officers still hold this position.', 'bad');
  };
  window.deleteRule = id => { removeRule(id); toast('Reporting line removed.'); renderHierarchy(); };
  document.getElementById('posForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!canShape) return;
    const title = document.getElementById('posName').value.trim(), rank = Number(document.getElementById('posRank').value);
    if (title.length < 2) return toast('Enter a position title.', 'bad');
    if (!rank || rank < 1) return toast('Enter a rank of 1 or more.', 'bad');
    const insert = document.getElementById('posInsert').checked;
    if (!insert && positionsOf(hierDept, hierDist).some(p => p.rank === rank && p.officers.length)) return toast(`Rank ${rank} is already held. Tick "insert" to move it down, or pick another rank.`, 'bad');
    addPosition({ dept: hierDept, district: hierDist, rank, title, insert });
    toast(`Position "${title}" created at rank ${rank}.`);
    e.target.reset(); document.getElementById('posInsert').checked = true;
    renderAll();
  });
  document.getElementById('ruleForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!canShape) return;
    const from = document.getElementById('ruleFrom').value, to = document.getElementById('ruleTo').value;
    const r = addRule({ district: hierDist, from, to, by: `${me.name}` });
    if (!r.ok) return toast(r.msg, 'bad');
    toast(`${deptById(from).name} now reports to ${deptById(to).name} after an SLA breach in ${districtName(hierDist)}.`);
    renderHierarchy();
  });

  /* ---------- Employees & transfers (shared module) ---------- */
  function renderEmployees(){
    if (!['admin','dadmin','dc','cmo','minister'].includes(me.role)) return;
    if (!empMounted) { empMounted = true; EmpUI.mount({ el: document.getElementById('empMount'), actor: ACTOR }); }
    else EmpUI.render();
  }

  /* ---------- shared helpers for the geography / cabinet screens ---------- */
  const isAdmin = me.role === 'admin';
  const amodal = (title, html) => { document.getElementById('mTitle').textContent = title; document.getElementById('mBody').innerHTML = html; document.getElementById('modalBg').classList.add('open'); };
  const closeM = () => document.getElementById('modalBg').classList.remove('open');
  const redraw = () => { try { renderAll(); } catch (e) { console.error(e); } };
  const TYPE_SHORT = { corp:'Corporation', council:'Council', np:'Nagar Panchayat' };
  const fmtShort = ts => new Date(ts).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const logHtml = (key, n) => { const l = DB.get(key).sort((a, b) => b.at - a.at).slice(0, n || 12);
    return l.length ? l.map(x => `<div style="padding:.45rem 0;border-bottom:1px solid var(--line);font-size:.83rem">${esc(x.text)}<br><span style="font-size:.74rem;color:var(--muted)">${fmt(x.at)}${x.by ? ' · ' + esc(x.by) : ''}</span></div>`).join('') : '<div class="chart-empty">Nothing yet.</div>'; };

  /* ---------- Punjab structure: councils, wards, depots ---------- */
  const geoDist = document.getElementById('geoDist'), geoType = document.getElementById('geoType'), geoQ = document.getElementById('geoQ');
  const geoDistChoices = SC.level === 'state' ? allDistricts() : allDistricts().filter(d => d.id === SC.district);
  geoDist.innerHTML = (geoDistChoices.length > 1 ? '<option value="">All districts</option>' : '') + geoDistChoices.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  const depotDist = document.getElementById('depotDist'), depotOp = document.getElementById('depotOp');
  depotDist.innerHTML = geoDist.innerHTML;
  [geoDist, geoType, geoQ, depotDist, depotOp].forEach(el => el.addEventListener('input', () => renderGeo()));
  const canEditUlb = u => me.role === 'admin' || (me.role === 'dadmin' && u.district === me.district);
  const ulbForm = document.getElementById('ulbForm');
  ulbForm.hidden = !['admin','dadmin'].includes(me.role);
  const fillUlbDist = () => { document.getElementById('ulbDist').innerHTML = (isState ? allDistricts() : allDistricts().filter(d => d.id === SC.district)).map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join(''); };
  fillUlbDist();

  function renderGeo(){
    const all = scopeUlbs();
    const known = all.filter(u => u.wards);
    document.getElementById('geoKpi').innerHTML = [
      ['c-blue', isState ? 'Districts' : 'District', isState ? allDistricts().length : 1, 'mi-map'],
      ['c-amber', 'Corporations', all.filter(u => u.type === 'corp').length, 'mi-building'],
      ['c-green', 'Councils & nagar panchayats', all.filter(u => u.type !== 'corp').length, 'mi-users'],
      ['c-red', 'Wards on record', known.reduce((a,u) => a + u.wards, 0), 'mi-grid']
    ].map(([c,l,v,i]) => `<div class="card kpi ${c}"><div class="top"><span class="lbl">${l}</span><div class="ic"><i class="mi ${i}"></i></div></div><b>${v}</b></div>`).join('');

    const q = geoQ.value.toLowerCase(), fd = geoDist.value, ft = geoType.value;
    const rows = all.filter(u => !fd || u.district === fd).filter(u => !ft || u.type === ft).filter(u => !q || u.name.toLowerCase().includes(q))
      .sort((a,b) => (a.type === 'corp' ? 0 : 1) - (b.type === 'corp' ? 0 : 1) || districtName(a.district).localeCompare(districtName(b.district)) || a.name.localeCompare(b.name));
    document.getElementById('geoCount').textContent = `${rows.length} shown · ${rows.filter(u => u.verify).length} need checking · ${rows.filter(u => !ulbGeo(u.id).acs.length).length} not yet linked to a constituency`;
    const mcCount = {}; DB.get('mcs').forEach(m => { const k = m.ulb || DEFAULT_ULB; mcCount[k] = (mcCount[k] || 0) + 1; });
    document.getElementById('geoTable').innerHTML = `<table class="tbl"><thead><tr><th>Council</th><th>Type</th><th>Tehsil · District</th><th>Constituencies</th><th>Wards</th><th>Councillors</th><th>Sign-in IDs</th><th></th></tr></thead><tbody>` +
      rows.map(u => { const g = ulbGeo(u.id);
        return `<tr><td><b>${esc(u.name)}</b>${u.verify ? ' <span class="badge b-esc" title="Sources disagree or the ward count could not be verified. Confirm and correct it here.">verify</span>' : ''}${u.edited ? ' <span class="badge b-res">edited</span>' : ''}${u.promoted ? ' <span class="badge b-prog">promoted</span>' : ''}</td>
        <td>${TYPE_SHORT[u.type]}</td>
        <td style="font-size:.82rem">${g.tehsil ? 'Tehsil ' + esc(g.tehsil.name) : '<i style="color:var(--muted)">tehsil not set</i>'}<br><span style="font-size:.73rem;color:var(--muted)">${esc(districtName(u.district))} · LS: ${g.ls.length ? esc(g.ls.map(l => l.name).join(' / ')) : '—'}</span></td>
        <td style="font-size:.8rem">${g.acs.length ? g.acs.map(l => `${esc(l.rec.name)}${l.from ? ` <span style="color:var(--muted)">(w${l.from}–${l.to || '…'})</span>` : ''}`).join(', ') + `<br><span style="font-size:.72rem;color:var(--muted)">MLA: ${esc([...new Set(g.acs.map(l => l.rec.mla))].join(', '))}</span>` : '<i style="color:var(--muted)">not linked</i>'}</td>
        <td>${canEditUlb(u) ? `<input id="uw-${u.id}" type="number" min="1" max="150" value="${u.wards || ''}" placeholder="?" style="width:78px">` : (u.wards || '<i>not on record</i>')}</td>
        <td>${mcCount[u.id] || 0}/${u.wards || '?'}</td>
        <td class="mono" style="font-size:.72rem">eo-${esc(u.id)}${u.type === 'corp' ? `<br>mayor-${esc(u.id)}` : ''}</td>
        <td style="white-space:nowrap">${canEditUlb(u) ? `<button class="btn btn-outline btn-sm" onclick="saveUlbWards('${u.id}')">Save</button>` : ''}
          ${isAdmin ? ` <button class="btn btn-outline btn-sm" onclick="openUlbMap('${u.id}')">Map</button>${u.type !== 'corp' ? ` <button class="btn btn-outline btn-sm" onclick="promoteUlb('${u.id}')">⬆ Corporation</button>` : ''}` : ''}</td></tr>`; }).join('') + '</tbody></table>';

    // Depots
    const dd = depotDist.value, dop = depotOp.value;
    const depots = DEPOTS.filter(d => SC.level === 'state' || resolveDistrict(d.district) === SC.district).filter(d => !dd || resolveDistrict(d.district) === dd).filter(d => !dop || d.operator === dop);
    const rw = depots.filter(d => d.operator === 'roadways').length, pr = depots.filter(d => d.operator === 'prtc').length;
    document.getElementById('depotCount').textContent = `${rw} Punjab Roadways · ${pr} PRTC`;
    const tOff = DB.get('officers').filter(o => o.dept === 'transport');
    document.getElementById('depotTable').innerHTML = depots.length ? `<table class="tbl"><thead><tr><th>Depot</th><th>Operator</th><th>District</th><th>Depot manager</th></tr></thead><tbody>` +
      depots.map(d => { const m = tOff.find(o => o.depotId === d.id);
        return `<tr><td><b>${esc(d.name)}</b>${d.verify ? ' <span class="badge b-esc" title="Chandigarh is a Union Territory; this depot is administered here under SAS Nagar.">verify</span>' : ''}</td>
          <td><span class="badge ${d.operator === 'prtc' ? 'b-asg' : 'b-prog'}">${OPERATOR_LABEL[d.operator]}</span></td><td>${esc(districtFull(resolveDistrict(d.district)))}</td>
          <td>${m ? `${esc(m.name)}<br><span class="mono" style="font-size:.72rem;color:var(--muted)">${esc(m.empId)}</span>` : '—'}</td></tr>`; }).join('') + '</tbody></table>'
      : '<div class="chart-empty">No depots in this view.</div>';
  }
  window.saveUlbWards = id => {
    const n = Number(document.getElementById('uw-' + id).value);
    if (!n || n < 1 || n > 150) return toast('Enter a ward count between 1 and 150.', 'bad');
    const custom = DB.get('customUlbs'); const ci = custom.find(u => u.id === id);
    if (ci) { ci.wards = n; ci.verify = false; DB.set('customUlbs', custom); }
    else { const ov = DB.get('ulbOverrides'); const prev = ov.find(o => o.id === id) || {}; DB.set('ulbOverrides', ov.filter(o => o.id !== id).concat([{ ...prev, id, wards: n }])); }
    toast(`Ward count for ${ulbName(id)} set to ${n}.`);
    redraw();
  };
  ulbForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!['admin','dadmin'].includes(me.role)) return;
    const name = document.getElementById('ulbName').value.trim(), type = document.getElementById('ulbType').value;
    const district = document.getElementById('ulbDist').value, wards = Number(document.getElementById('ulbWards').value);
    if (name.length < 3) return toast('Enter the council name.', 'bad');
    if (!wards || wards < 1 || wards > 150) return toast('Enter a ward count between 1 and 150.', 'bad');
    if (!isState && district !== SC.district) return toast('You can only add councils in your own district.', 'bad');
    let id = _slug(name); if (allUlbs().some(u => u.id === id)) id = id + '-' + _slug(districtName(district));
    if (allUlbs().some(u => u.id === id)) return toast('That council is already on the list.', 'bad');
    const u = { id, name, district, type, wards, verify: false, custom: true };
    const custom = DB.get('customUlbs'); custom.push(u); DB.set('customUlbs', custom);
    _ensureAuthorities();
    toast(`${name} added with ${wards} wards. Its Executive Officer can sign in as eo-${id} (password eo@123)${type === 'corp' ? '; the Mayor as mayor-' + id + ' (mayor@123)' : ''}.`);
    e.target.reset(); redraw();
  });

  // Map a council to its tehsil and Vidhan Sabha constituencies (State Administrator)
  window.openUlbMap = id => {
    const u = ulbRec(id), g = ulbGeo(id), cur = new Map(g.acs.map(l => [l.ac, l]));
    const own = acsOfDistrict(u.district), ownNos = new Set(own.map(a => a.no));
    const extra = [...cur.keys()].filter(n => !ownNos.has(n)).map(acByNo);
    const row = a => { const l = cur.get(a.no); return `<div class="cred-row" data-ac="${a.no}" style="gap:.6rem;flex-wrap:wrap">
      <label style="display:flex;align-items:center;gap:.5rem;flex:1;min-width:170px"><input type="checkbox" class="mpOn" style="width:auto" ${l ? 'checked' : ''}><span><b>${esc(a.name)}</b> <span style="font-size:.74rem;color:var(--muted)">AC ${a.no} · ${esc(lsName(a.ls))} · ${esc(a.mla)}</span></span></label>
      <span style="font-size:.74rem;color:var(--muted)">wards</span><input class="mpFrom" type="number" min="1" placeholder="all" value="${l && l.from || ''}" style="width:70px"><span>–</span><input class="mpTo" type="number" min="1" placeholder="all" value="${l && l.to || ''}" style="width:70px"></div>`; };
    amodal(`Map ${u.name}`, `
      <p style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem">${esc(TYPE_SHORT[u.type])} in <b>${esc(districtName(u.district))}</b>. Choose its tehsil and the Vidhan Sabha constituencies it falls in. If a city is split between several constituencies, give each one its ward range; leave the range empty if the whole council belongs to it. MLAs see grievances only from the wards linked to their constituency.</p>
      <div class="field"><label>Tehsil</label><select id="mpTeh"><option value="">— not set —</option>${tehsilsOfDistrict(u.district).sort((a, b) => a.name.localeCompare(b.name)).map(t => `<option value="${t.id}" ${g.tehsil && g.tehsil.id === t.id ? 'selected' : ''}>${esc(t.name)} (${TEHSIL_KIND_LABEL[t.kind]})</option>`).join('')}</select></div>
      <p style="font-weight:700;font-size:.86rem;margin:.9rem 0 .4rem">Constituencies in ${esc(districtName(u.district))}</p>
      <div id="mpRows">${own.concat(extra).map(row).join('') || '<div class="chart-empty">This district has no constituencies recorded.</div>'}</div>
      <div class="filter-bar" style="margin-top:.7rem"><select id="mpExtra"><option value="">Add a constituency from another district…</option>${allAcs().filter(a => !ownNos.has(a.no) && !cur.has(a.no)).map(a => `<option value="${a.no}">${a.no} · ${esc(a.name)} (${esc(districtName(a.district))})</option>`).join('')}</select><button class="btn btn-outline btn-sm" type="button" id="mpAdd">Add</button></div>
      <button class="btn btn-pine" style="margin-top:1rem" id="mpSave">Save mapping</button>`);
    document.getElementById('mpAdd').onclick = () => { const v = document.getElementById('mpExtra').value; if (!v) return; const a = acByNo(v); document.getElementById('mpRows').insertAdjacentHTML('beforeend', row(a).replace('<input type="checkbox" class="mpOn" style="width:auto" >', '<input type="checkbox" class="mpOn" style="width:auto" checked>')); document.getElementById('mpExtra').querySelector(`[value="${v}"]`).remove(); document.getElementById('mpExtra').value = ''; };
    document.getElementById('mpSave').onclick = () => {
      const acs = [...document.querySelectorAll('#mpRows [data-ac]')].filter(r => r.querySelector('.mpOn').checked).map(r => ({ ac:Number(r.dataset.ac), from:r.querySelector('.mpFrom').value, to:r.querySelector('.mpTo').value }));
      const bad = acs.find(l => (l.from && l.to && Number(l.from) > Number(l.to))); if (bad) return toast('A ward range starts after it ends.', 'bad');
      const r = setUlbGeo({ ulb:id, acs, tehsil:document.getElementById('mpTeh').value });
      if (!r.ok) return toast(r.msg, 'bad');
      closeM(); toast(`${u.name} mapped to ${acs.length} constituenc${acs.length === 1 ? 'y' : 'ies'}.`); redraw();
    };
  };
  window.promoteUlb = async id => {
    const u = ulbRec(id);
    const ok = await confirmDialog({ icon:'⬆️', title:`Promote ${u.name} to a Municipal Corporation?`, message:`${u.name} gets a Mayor account (mayor-${id}, separate from the Executive Officer) and a Deputy Mayor post. Its current President and Vice President posts are vacated — the District Administrator then appoints a Mayor and Deputy Mayor from the registered councillors.`, okLabel:'Promote', cancelLabel:'Cancel' });
    if (!ok) return;
    const r = promoteToCorporation({ id, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad');
    toast(`${u.name} is now a Municipal Corporation. Mayor sign-in: mayor-${id} (password mayor@123).`); redraw();
  };

  /* ---------- Districts & tehsils ---------- */
  const thDist = document.getElementById('thDist'), thQ = document.getElementById('thQ'), distForm = document.getElementById('distForm'), tehForm = document.getElementById('tehForm');
  distForm.hidden = tehForm.hidden = !isAdmin;
  thQ.addEventListener('input', () => renderDistricts());
  thDist.addEventListener('input', () => renderDistricts());

  function renderDistricts(){
    if (!['admin','dadmin','dc','cmo'].includes(me.role)) return;
    const mine = SC.level === 'district' ? SC.district : '';
    const districts = allDistricts().filter(d => !mine || d.id === mine);
    const offs = DB.get('officers'); const empN = {}; offs.forEach(o => { empN[o.district] = (empN[o.district] || 0) + 1; });
    const auths = DB.get('authorities');
    document.getElementById('distCount').textContent = `${districts.length} active${isState ? ' · ' + _distRecs().filter(d => d.abolished).length + ' abolished' : ''}`;
    const abolished = isState ? _distRecs().filter(d => d.abolished) : [];
    document.getElementById('distTable').innerHTML = `<table class="tbl"><thead><tr><th>District</th><th>Lok Sabha</th><th>Tehsils</th><th>Councils</th><th>Constituencies</th><th>Employees</th><th>Administrators</th><th></th></tr></thead><tbody>` +
      districts.map(d => { const adm = auths.filter(a => a.role === 'dadmin' && a.district === d.id && !a.blocked);
        return `<tr><td><b>${esc(d.name)}</b> <span class="mono" style="font-size:.72rem;color:var(--muted)">${esc(d.code)}</span>${d.custom ? ' <span class="badge b-prog">new</span>' : ''}</td>
        <td style="font-size:.82rem">${esc(lsText(d.id))}</td><td>${tehsilsOfDistrict(d.id).length}</td><td>${ulbsInDistrict(d.id).length}</td><td>${acsOfDistrict(d.id).length}</td><td>${empN[d.id] || 0}</td>
        <td style="font-size:.8rem">${adm.map(a => esc(a.name)).join('<br>') || '—'}</td>
        <td style="white-space:nowrap">${isAdmin ? `<button class="btn btn-outline btn-sm" onclick="openDistAdmins('${d.id}')">Admins</button> <button class="btn btn-danger btn-sm" onclick="openMerge('${d.id}')">Merge / abolish</button>` : ''}</td></tr>`; }).join('') +
      abolished.map(d => `<tr style="opacity:.55"><td><b>${esc(d.name)}</b> <span class="badge b-cls">abolished</span></td><td colspan="6">Merged into ${esc(districtName(d.mergedInto))} on ${fmtShort(d.at)}</td><td></td></tr>`).join('') + '</tbody></table>';

    // merge requests: State Administrator sees all, a District Administrator sees those addressed to their district
    const reqs = mergeRequests().filter(r => isAdmin || (me.role === 'dadmin' && r.to === me.district && r.status === 'pending'));
    document.getElementById('mergePanel').hidden = !reqs.length;
    document.getElementById('mergeCount').textContent = `${reqs.filter(r => r.status === 'pending').length} waiting for an answer`;
    const ST = { pending:'<span class="badge b-rev">waiting</span>', accepted:'<span class="badge b-res">accepted</span>', declined:'<span class="badge b-esc">declined</span>', done:'<span class="badge b-cls">completed</span>' };
    document.getElementById('mergeList').innerHTML = reqs.sort((a, b) => b.at - a.at).map(r => `<div class="cred-row"><div class="who"><b>${esc(districtName(r.from))} → ${esc(districtName(r.to))}</b> ${ST[r.status]}<span>Proposed by ${esc(r.by)} · ${fmtShort(r.at)}${r.answeredBy ? ' · answered by ' + esc(r.answeredBy) : ''}</span></div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">${me.role === 'dadmin' && r.status === 'pending' ? `<button class="btn btn-pine btn-sm" onclick="answerMerge('${r.id}',true)">Accept</button><button class="btn btn-danger btn-sm" onclick="answerMerge('${r.id}',false)">Decline</button>` : ''}
        ${isAdmin && r.status === 'accepted' ? `<button class="btn btn-pine btn-sm" onclick="finishMerge('${r.id}',false)">Complete the merge</button>` : ''}
        ${isAdmin && r.status === 'pending' ? `<button class="btn btn-outline btn-sm" onclick="finishMerge('${r.id}',true)">Merge now — consent given offline</button>` : ''}</div></div>`).join('');

    // tehsils
    const tdFilter = thDist.value || mine;
    if (!thDist.options.length) thDist.innerHTML = '<option value="">All districts</option>' + districts.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
    if (mine) { thDist.value = mine; thDist.disabled = true; }
    const q = thQ.value.toLowerCase();
    const ulbIn = {}; allUlbs().forEach(u => { const t = ulbGeo(u.id).tehsil; if (t) (ulbIn[t.id] = ulbIn[t.id] || []).push(u.name); });
    const staffIn = {}; offs.forEach(o => { if (o.tehsil) staffIn[o.tehsil] = (staffIn[o.tehsil] || 0) + 1; });
    const ts = allTehsils().filter(t => !tdFilter || t.district === tdFilter).filter(t => !q || t.name.toLowerCase().includes(q))
      .sort((a, b) => districtName(a.district).localeCompare(districtName(b.district)) || a.name.localeCompare(b.name));
    document.getElementById('tehCount').textContent = `${ts.length} shown · ${allTehsils().filter(t => t.kind === 'T').length} tehsils, ${allTehsils().filter(t => t.kind === 'ST').length} sub-tehsils in Punjab`;
    document.getElementById('tehTable').innerHTML = `<table class="tbl"><thead><tr><th>Tehsil</th><th>Kind</th><th>District · Lok Sabha</th><th>Councils inside</th><th>Staff posted</th><th></th></tr></thead><tbody>` +
      ts.slice(0, 220).map(t => `<tr><td><b>${esc(t.name)}</b>${t.verify ? ' <span class="badge b-esc" title="The source list has no district headings; this assignment is Saarthi\'s best match.">verify</span>' : ''}${t.custom ? ' <span class="badge b-prog">new</span>' : ''}</td>
        <td>${TEHSIL_KIND_LABEL[t.kind]}</td><td style="font-size:.82rem">${esc(districtFull(t.district))}</td><td style="font-size:.8rem">${esc((ulbIn[t.id] || []).join(', ')) || '—'}</td><td>${staffIn[t.id] || 0}</td>
        <td style="white-space:nowrap">${isAdmin ? `<button class="btn btn-outline btn-sm" onclick="openTehMove('${t.id}')">Change district</button> <button class="btn btn-danger btn-sm" onclick="openTehAbolish('${t.id}')">Abolish</button>` : ''}</td></tr>`).join('') + '</tbody></table>';
    if (isAdmin) document.getElementById('ntDist').innerHTML = districts.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
    document.getElementById('geoLogPanel').hidden = !isAdmin;
    if (isAdmin) document.getElementById('geoLogList').innerHTML = logHtml('geoLog');
    document.getElementById('distSub').textContent = isAdmin
      ? 'Create, merge and reshape districts and tehsils. Every change carries the councils, citizens and open files with it.'
      : `${dn} — its tehsils, councils and the merge requests addressed to it.`;
  }
  distForm.addEventListener('submit', e => {
    e.preventDefault(); if (!isAdmin) return;
    const r = createDistrict({ name:document.getElementById('dsName').value, code:document.getElementById('dsCode').value, by:ACTOR });
    if (!r.ok) return toast(r.msg, 'bad');
    toast(`${districtName(r.id)} created. District administrator: admin-${r.id} (district@123) · Deputy Commissioner: dc-${r.id} (dc@123).`);
    e.target.reset(); redraw();
  });
  tehForm.addEventListener('submit', e => {
    e.preventDefault(); if (!isAdmin) return;
    const r = createTehsil({ name:document.getElementById('ntName').value, kind:document.getElementById('ntKind').value, district:document.getElementById('ntDist').value, by:ACTOR });
    if (!r.ok) return toast(r.msg, 'bad');
    toast('Created.'); e.target.reset(); redraw();
  });
  window.openDistAdmins = did => {
    const list = DB.get('authorities').filter(a => a.role === 'dadmin' && a.district === did);
    amodal(`Administrators of ${districtName(did)}`, `
      ${list.map(a => `<div class="cred-row"><div class="who"><b>${esc(a.name)}</b><span>sign-in ID <span class="mono">${esc(a.username)}</span>${a.blocked ? ' · inactive' : ''}</span></div>
        ${list.filter(x => !x.blocked).length > 1 && !a.blocked ? `<button class="btn btn-danger btn-sm" onclick="dropDistAdmin('${a.username}','${did}')">Remove</button>` : ''}</div>`).join('')}
      <p style="font-weight:700;font-size:.88rem;margin:1rem 0 .5rem">➕ Add a district administrator</p>
      <div class="form-grid"><div class="field"><label>Name</label><input id="daName" placeholder="e.g. Rajesh Kumar, System Administrator"></div>
        <div class="field"><label>Password</label><input id="daPw" value="district@123"></div></div>
      <button class="btn btn-pine btn-sm" id="daGo">Create account</button>`);
    document.getElementById('daGo').onclick = () => { const r = addDistrictAdmin({ district:did, name:document.getElementById('daName').value, password:document.getElementById('daPw').value.trim() || 'district@123', by:ACTOR });
      if (!r.ok) return toast(r.msg, 'bad'); toast(`Created ${r.account.username}.`); openDistAdmins(did); redraw(); };
  };
  window.dropDistAdmin = (u, did) => { const r = removeDistrictAdmin(u); if (!r.ok) return toast(r.msg, 'bad'); toast('Administrator removed.'); openDistAdmins(did); redraw(); };
  window.openMerge = did => {
    const d = districtById(did); const others = allDistricts().filter(x => x.id !== did);
    amodal(`Abolish ${d.name}`, `
      <div class="notice warn">Abolishing a district merges it into another one. It cannot be undone from this screen.</div>
      <p style="font-size:.84rem;margin:.8rem 0">${ulbsInDistrict(did).length} councils, ${tehsilsOfDistrict(did).length} tehsils, ${acsOfDistrict(did).length} constituencies and ${DB.get('officers').filter(o => o.district === did).length} employees move to the district you choose. Open grievances stay with their officers. The district's own administrator and Deputy Commissioner accounts are closed. Employees are placed beneath the receiving district's own ranks so each department keeps one head; the District Administrator can reorganise afterwards.</p>
      <div class="field"><label>Merge into (the willing district)</label><select id="mgTo">${others.map(x => `<option value="${x.id}">${esc(districtFull(x.id))}</option>`).join('')}</select></div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem">
        <button class="btn btn-pine" id="mgAsk">Ask the receiving district to accept</button>
        <button class="btn btn-danger" id="mgNow">Merge now — consent already given</button></div>`);
    document.getElementById('mgAsk').onclick = () => { const to = document.getElementById('mgTo').value; const r = proposeMerge({ from:did, to, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad'); closeM(); toast(`Request sent to the administrators of ${districtName(to)}. They accept or decline from their own console.`); redraw(); };
    document.getElementById('mgNow').onclick = async () => { const to = document.getElementById('mgTo').value;
      const ok = await confirmDialog({ icon:'🛑', title:`Merge ${d.name} into ${districtName(to)} now?`, message:'Use this only when the receiving district has already agreed outside Saarthi. The merge happens immediately.', okLabel:'Merge now', cancelLabel:'Cancel', danger:true }); if (!ok) return;
      const p = proposeMerge({ from:did, to, by:ACTOR }); if (!p.ok) return toast(p.msg, 'bad');
      const rq = mergeRequests().find(x => x.from === did && x.status === 'pending'); const r = executeMerge({ id:rq.id, offline:true, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad');
      closeM(); toast(`${d.name} merged into ${districtName(to)} — ${r.staff} employees moved.`); redraw(); };
  };
  window.answerMerge = async (id, accept) => {
    const r = respondMerge({ id, accept, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad');
    toast(accept ? 'You accepted the merge. The State Administrator will complete it.' : 'You declined the merge.'); redraw();
  };
  window.finishMerge = async (id, offline) => {
    const rq = mergeRequests().find(x => x.id === id);
    const ok = await confirmDialog({ icon:'🛑', title:`Merge ${districtName(rq.from)} into ${districtName(rq.to)}?`, message: offline ? 'The receiving district has not answered. Proceed only if it has agreed outside Saarthi.' : 'The receiving district has accepted. This completes the merge.', okLabel:'Merge', cancelLabel:'Cancel', danger:true });
    if (!ok) return;
    const r = executeMerge({ id, offline, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad');
    toast(`${districtName(rq.from)} merged into ${districtName(rq.to)} — ${r.staff} employees moved.`); redraw();
  };
  window.openTehMove = id => {
    const t = tehsilById(id); const inside = allUlbs().filter(u => (ulbGeo(u.id).tehsil || {}).id === id);
    amodal(`Change district of ${t.name}`, `
      <p style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem">Now in <b>${esc(districtName(t.district))}</b>. ${inside.length ? `The ${inside.length} council${inside.length === 1 ? '' : 's'} inside it (${esc(inside.map(u => u.name).join(', '))}) move with it; their citizens change district and any open grievances are re-routed to the new district's front-line officers.` : 'No council is mapped inside it, so nothing else moves.'}</p>
      <div class="field"><label>New district</label><select id="tmTo">${allDistricts().filter(d => d.id !== t.district).map(d => `<option value="${d.id}">${esc(districtFull(d.id))}</option>`).join('')}</select></div>
      <button class="btn btn-pine" id="tmGo">Move tehsil</button>`);
    document.getElementById('tmGo').onclick = () => { const to = document.getElementById('tmTo').value; const r = setTehsilDistrict({ id, district:to, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad'); closeM(); toast(`${t.name} is now in ${districtName(to)}${r.moved ? ' with ' + r.moved + ' council(s)' : ''}.`); redraw(); };
  };
  window.openTehAbolish = id => {
    const t = tehsilById(id); const inside = allUlbs().filter(u => (ulbGeo(u.id).tehsil || {}).id === id);
    const opts = allTehsils().filter(x => x.id !== id).sort((a, b) => districtName(a.district).localeCompare(districtName(b.district)) || a.name.localeCompare(b.name));
    amodal(`Abolish ${t.name}`, `
      <div class="notice warn">${esc(t.name)} (${esc(districtName(t.district))}) will no longer exist.</div>
      <p style="font-size:.84rem;margin:.8rem 0">${inside.length ? `Its ${inside.length} council${inside.length === 1 ? '' : 's'} (${esc(inside.map(u => u.name).join(', '))}) and any staff posted to it merge into the tehsil you choose. If that tehsil is in another district, the councils change district too.` : 'No council is mapped inside it.'}</p>
      <div class="field"><label>Merge into tehsil</label><select id="taTo"><option value="">— none (leave councils without a tehsil) —</option>${opts.map(x => `<option value="${x.id}">${esc(x.name)} · ${esc(districtName(x.district))}</option>`).join('')}</select></div>
      <button class="btn btn-danger" id="taGo">Abolish tehsil</button>`);
    document.getElementById('taGo').onclick = () => { const r = abolishTehsil({ id, mergeInto:document.getElementById('taTo').value, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad'); closeM(); toast(`${t.name} abolished.`); redraw(); };
  };

  /* ---------- Constituencies ---------- */
  const acLs = document.getElementById('acLs'), acDist = document.getElementById('acDist'), acQ = document.getElementById('acQ');
  acLs.innerHTML = '<option value="">All Lok Sabha seats</option>' + LOK_SABHA.map(l => `<option value="${l.id}">${esc(l.name)}${l.sc ? ' (SC)' : ''}</option>`).join('');
  acDist.innerHTML = '<option value="">All districts</option>' + allDistricts().map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  [acLs, acDist, acQ].forEach(el => el.addEventListener('input', () => renderConstituencies()));
  if (SC.level === 'district') { acDist.value = SC.district; acDist.disabled = true; }
  function renderConstituencies(){
    let acs = allAcs();
    if (SC.level === 'ac') acs = acs.filter(a => a.no === SC.ac);
    if (SC.level === 'ls') acs = acs.filter(a => a.ls === SC.ls);
    if (SC.level === 'ulb') { const mine = new Set(ulbAcs(SC.ulb).map(l => l.ac)); acs = acs.filter(a => mine.has(a.no)); }
    const fl = acLs.value, fd = acDist.value, q = acQ.value.toLowerCase();
    const rows = acs.filter(a => !fl || a.ls === fl).filter(a => !fd || a.district === fd).filter(a => !q || a.name.toLowerCase().includes(q) || a.mla.toLowerCase().includes(q));
    const ulbsByAc = {}; allUlbs().forEach(u => ulbAcs(u.id).forEach(l => { (ulbsByAc[l.ac] = ulbsByAc[l.ac] || []).push(u.name); }));
    const mapped = allUlbs().filter(u => ulbAcs(u.id).length).length;
    document.getElementById('constKpi').innerHTML = [['c-blue','Lok Sabha seats',LOK_SABHA.length,'mi-map'],['c-amber','Vidhan Sabha seats',allAcs().length,'mi-users'],['c-green','Reserved (SC) seats',allAcs().filter(a => a.sc).length,'mi-shield'],['c-red','Councils linked',`${mapped}/${allUlbs().length}`,'mi-building']]
      .map(([c,l,v,i]) => `<div class="card kpi ${c}"><div class="top"><span class="lbl">${l}</span><div class="ic"><i class="mi ${i}"></i></div></div><b>${v}</b></div>`).join('');
    document.getElementById('acCount').textContent = `${rows.length} shown`;
    const minOf = {}; allMinistries().forEach(m => { if (m.holder) minOf[m.holder.ac] = m; });
    document.getElementById('acTable').innerHTML = `<table class="tbl"><thead><tr><th>No.</th><th>Constituency</th><th>Lok Sabha</th><th>District</th><th>Councils inside</th><th>MLA</th><th></th></tr></thead><tbody>` +
      rows.map(a => `<tr><td class="mono">${a.no}</td><td><b>${esc(a.name)}</b>${a.sc ? ' <span class="badge b-sub">SC</span>' : ''}</td><td>${esc(lsName(a.ls))}</td><td>${esc(districtName(a.district))}</td>
        <td style="font-size:.8rem">${esc((ulbsByAc[a.no] || []).join(', ')) || '<i style="color:var(--muted)">none linked yet</i>'}</td>
        <td>${esc(a.mla)}${minOf[a.no] ? `<br><span style="font-size:.72rem;color:var(--primary)">${minOf[a.no].isCM ? 'Chief Minister' : 'Minister, ' + esc(minOf[a.no].title)}</span>` : ''}</td>
        <td>${isAdmin ? `<button class="btn btn-outline btn-sm" onclick="openAcEdit(${a.no})">Edit</button>` : ''}</td></tr>`).join('') + '</tbody></table>';
    document.getElementById('acTable').insertAdjacentHTML('beforeend', `<h4 style="margin:1.2rem 0 .5rem">Lok Sabha seats &amp; MPs</h4><table class="tbl"><thead><tr><th>No.</th><th>Lok Sabha seat</th><th>Vidhan Sabha seats</th><th>MP</th><th></th></tr></thead><tbody>` + LOK_SABHA.filter(l => SC.level !== 'ls' || l.id === SC.ls).filter(l => SC.level === 'ac' ? l.id === (myAc || {}).ls : true).map(l => `<tr><td class="mono">${l.no}</td><td><b>${esc(l.name)}</b>${l.sc ? ' <span class="badge b-sub">SC</span>' : ''}</td><td>${lsAcs(l.id).length}</td><td>${esc(mpOf(l.id))}</td><td>${isAdmin ? `<button class="btn btn-outline btn-sm" onclick="openMpEdit('${l.id}')">Edit</button>` : ''}</td></tr>`).join('') + '</tbody></table>');
    document.getElementById('constSub').textContent = SC.level === 'ls' ? `The Vidhan Sabha constituencies inside your Lok Sabha seat, with their MLAs, districts and councils.` : SC.level === 'ac' ? `Your constituency, its Lok Sabha seat and the councils inside it.` : 'The 13 Lok Sabha seats and 117 Vidhan Sabha constituencies, with the districts, councils and MLAs they cover.';
  }
  window.openMpEdit = id => {
    amodal(`MP — ${lsName(id)} Lok Sabha`, `<div class="form-grid"><div class="field full"><label>Sitting MP</label><input id="mpName" value="${esc(mpOf(id))}"><div class="hint">Changing the MP resets the Lok Sabha login (mp-${id}) to its default password.</div></div></div><button class="btn btn-pine" id="mpGo">Save</button>`);
    document.getElementById('mpGo').onclick = () => { const r = setMp({ ls:id, name:document.getElementById('mpName').value, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad'); closeM(); toast('MP updated.'); renderConstituencies(); };
  };
  window.openAcEdit = no => {
    const a = acByNo(no);
    amodal(`${a.name} (AC ${a.no})`, `
      <div class="form-grid">
        <div class="field full"><label>Sitting MLA</label><input id="aeMla" value="${esc(a.mla)}"><div class="hint">Changing the MLA resets the constituency login to its default password. If the old MLA was a minister, the ministry becomes vacant.</div></div>
        <div class="field"><label>District</label><select id="aeDist">${allDistricts().map(d => `<option value="${d.id}" ${d.id === a.district ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Lok Sabha seat</label><select id="aeLs">${LOK_SABHA.map(l => `<option value="${l.id}" ${l.id === a.ls ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></div>
      </div><button class="btn btn-pine" id="aeGo">Save</button>`);
    document.getElementById('aeGo').onclick = () => {
      const name = document.getElementById('aeMla').value.trim();
      const g = setAcGeo({ no, district:document.getElementById('aeDist').value, ls:document.getElementById('aeLs').value }); if (!g.ok) return toast(g.msg, 'bad');
      let note = '';
      if (name !== a.mla) { const r = setMla({ ac:no, name, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad'); if (r.vacated) note = ` The ${r.vacated.title} ministry is now vacant.`; }
      closeM(); toast(`${a.name} updated.${note}`); redraw();
    };
  };

  /* ---------- Cabinet & MLAs ---------- */
  document.getElementById('minForm').hidden = !isAdmin;
  const ALL_DEPT_CHOICES = () => allDepartments().concat([MC_DEPT]);
  function renderCabinet(){
    if (!['admin','cmo','minister'].includes(me.role)) return;
    const ms = allMinistries();
    document.getElementById('cabCount').textContent = `${ms.length} ministries · ${ms.filter(m => !m.holder).length} vacant`;
    document.getElementById('cabTable').innerHTML = `<table class="tbl"><thead><tr><th>Ministry</th><th>Held by</th><th>Departments overseen</th><th>Sign-in ID</th><th></th></tr></thead><tbody>` +
      ms.map(m => { const a = m.holder ? acByNo(m.holder.ac) : null;
        return `<tr${me.ministryKey === m.key ? ' style="background:rgba(255,122,26,.07)"' : ''}><td><b>${esc(m.title)}</b><br><span style="font-size:.72rem;color:var(--muted)">${esc(m.portfolio)}</span></td>
        <td>${m.holder ? `<b>${esc(m.holder.name)}</b><br><span style="font-size:.74rem;color:var(--muted)">MLA ${esc(a ? a.name : '')} · ${esc(a ? lsName(a.ls) : '')}</span>` : '<span class="badge b-esc">vacant</span>'}</td>
        <td style="font-size:.8rem">${m.isCM ? 'Every department' : m.depts.length ? esc(m.depts.map(d => (deptById(d) || { name:d }).name).join(', ')) : '<i style="color:var(--muted)">none mapped</i>'}</td>
        <td class="mono" style="font-size:.72rem">min-${esc(m.key)}</td>
        <td style="white-space:nowrap">${isAdmin ? `<button class="btn btn-outline btn-sm" onclick="openMinChange('${m.key}')">${m.holder ? 'Change minister' : 'Appoint'}</button>${m.holder ? ` <button class="btn btn-danger btn-sm" onclick="dropMinister('${m.key}')">Remove</button>` : ''}${m.isCM ? '' : ` <button class="btn btn-outline btn-sm" onclick="openMinDepts('${m.key}')">Departments</button>`}` : ''}</td></tr>`; }).join('') + '</tbody></table>';
    renderQuickLink(ms);
    document.getElementById('cabLogPanel').hidden = !isAdmin;
    if (isAdmin) document.getElementById('cabLogList').innerHTML = logHtml('cabinetLog');
  }
  function renderQuickLink(ms){
    const pnl = document.getElementById('linkPanel'); pnl.hidden = !isAdmin; if (!isAdmin) return;
    const owner = id => (ms.find(m => !m.isCM && m.depts.includes(id)) || {}).key || '';
    const deps = allDepartments().concat([MC_DEPT]);
    document.getElementById('linkCount').textContent = `${deps.filter(d => !owner(d.id)).length} not linked to any ministry`;
    document.getElementById('linkTable').innerHTML = `<table class="tbl"><thead><tr><th>Department</th><th>Ministry (minister)</th></tr></thead><tbody>` + deps.map(d => `<tr><td>${d.ico} ${esc(d.name)}</td><td><select data-dept="${esc(d.id)}" style="min-width:230px"><option value="">— not linked (Chief Minister only) —</option>${ms.filter(m => !m.isCM).map(m => `<option value="${m.key}" ${owner(d.id) === m.key ? 'selected' : ''}>${esc(m.title)} — ${esc(m.holder ? m.holder.name : 'vacant')}</option>`).join('')}</select></td></tr>`).join('') + '</tbody></table>';
    document.querySelectorAll('#linkTable select').forEach(sl => sl.onchange = () => {
      const id = sl.dataset.dept, to = sl.value;
      allMinistries().filter(m => !m.isCM && m.depts.includes(id) && m.key !== to).forEach(m => setMinistryDepts({ key:m.key, depts:m.depts.filter(x => x !== id), by:ACTOR }));
      if (to) { const m = ministryByKey(to); if (!m.depts.includes(id)) setMinistryDepts({ key:to, depts:m.depts.concat(id), by:ACTOR }); }
      toast('Department linked.'); redraw();
    });
  }
  window.openMinChange = key => {
    const m = ministryByKey(key); const holders = {}; allMinistries().forEach(x => { if (x.holder) holders[x.holder.ac] = x; });
    const acs = allAcs().sort((a, b) => a.mla.localeCompare(b.mla));
    amodal(`${m.isCM ? 'Chief Minister' : m.title}`, `
      <p style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem">Current holder: <b>${m.holder ? esc(m.holder.name) : 'none (vacant)'}</b>. Pick the MLA to appoint${m.holder ? '; the present minister leaves this ministry and stays an MLA' : ''}. The ministry's login is handed to the new minister with the default password.</p>
      <div class="field"><label>MLA</label><input id="mcQ" placeholder="Search MLA or constituency" style="margin-bottom:.4rem"><select id="mcSel" size="8" style="height:auto">${acs.map(a => `<option value="${a.no}">${esc(a.mla)} — ${esc(a.name)} (${esc(lsName(a.ls))})${holders[a.no] ? ' · already ' + esc(holders[a.no].isCM ? 'CM' : 'Minister, ' + holders[a.no].title) : ''}</option>`).join('')}</select></div>
      <div class="field"><label>…or give the minister rank to a person who is not a sitting MLA</label><input id="mcName" placeholder="Full name (optional — used only if no MLA is picked above)"></div>
      <button class="btn btn-pine" id="mcGo">Appoint</button>`);
    const sel = document.getElementById('mcSel'), all = [...sel.options].map(o => [o.value, o.textContent]);
    document.getElementById('mcQ').oninput = e => { const q = e.target.value.toLowerCase(); sel.innerHTML = all.filter(x => x[1].toLowerCase().includes(q)).map(x => `<option value="${x[0]}">${esc(x[1])}</option>`).join(''); };
    document.getElementById('mcGo').onclick = () => { const own = document.getElementById('mcName').value.trim(); const useAc = own ? 0 : Number(sel.value); const r = appointMinister({ key, ac:useAc, name:own, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad');
      closeM(); toast(`${own || mlaOf(useAc)} appointed${r.replaced ? ' — replacing ' + r.replaced : ''}. Sign-in: min-${key} (minister@123).`); redraw(); };
  };
  window.dropMinister = async key => {
    const m = ministryByKey(key);
    const ok = await confirmDialog({ icon:'🎖️', title:`Remove ${m.holder.name} from ${m.title}?`, message:`${m.holder.name} leaves the cabinet and stays an MLA. The ministry login is locked until another MLA is appointed.`, okLabel:'Remove from cabinet', cancelLabel:'Cancel', danger:true });
    if (!ok) return; const r = vacateMinistry({ key, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad'); toast('Ministry is now vacant.', 'bad'); redraw();
  };
  window.openMinDepts = key => {
    const m = ministryByKey(key);
    amodal(`Departments — ${m.title}`, `
      <p style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem">The minister sees only the employees and grievances of the ticked departments.</p>
      ${ALL_DEPT_CHOICES().map(d => `<label style="display:flex;gap:.5rem;align-items:center;padding:.3rem 0"><input type="checkbox" class="mdChk" value="${d.id}" style="width:auto" ${m.depts.includes(d.id) ? 'checked' : ''}> ${d.ico} ${esc(d.name)}</label>`).join('')}
      <button class="btn btn-pine" style="margin-top:1rem" id="mdGo">Save</button>`);
    document.getElementById('mdGo').onclick = () => { const r = setMinistryDepts({ key, depts:[...document.querySelectorAll('.mdChk:checked')].map(x => x.value), by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad'); closeM(); toast('Departments updated.'); redraw(); };
  };
  document.getElementById('minForm').addEventListener('submit', e => {
    e.preventDefault(); if (!isAdmin) return;
    const r = addMinistry({ title:document.getElementById('nmName').value, by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad');
    toast(`Ministry created. Appoint an MLA and map its departments.`); e.target.reset(); redraw();
  });

  /* ---------- Office-bearers ---------- */
  const beDist = document.getElementById('beDist'), beType = document.getElementById('beType'), beQ = document.getElementById('beQ');
  const canAppoint = u => me.role === 'admin' || (me.role === 'dadmin' && u.district === me.district);
  beDist.innerHTML = (geoDistChoices.length > 1 ? '<option value="">All districts</option>' : '') + geoDistChoices.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  [beDist, beType, beQ].forEach(el => el.addEventListener('input', () => renderBearers()));
  function renderBearers(){
    if (!['admin','dadmin','dc','cmo','eo','mayor'].includes(me.role)) return;
    const q = beQ.value.toLowerCase(), fd = beDist.value, ft = beType.value;
    const rows = scopeUlbs().filter(u => !fd || u.district === fd).filter(u => !ft || u.type === ft).filter(u => !q || u.name.toLowerCase().includes(q))
      .sort((a, b) => (a.type === 'corp' ? 0 : 1) - (b.type === 'corp' ? 0 : 1) || districtName(a.district).localeCompare(districtName(b.district)) || a.name.localeCompare(b.name));
    const regd = {}; DB.get('mcs').forEach(m => { const k = m.ulb || DEFAULT_ULB; regd[k] = (regd[k] || 0) + 1; });
    document.getElementById('bearSub').textContent = canAppoint({ district: SC.district || '' }) || isAdmin
      ? 'Choose the President & Vice President of every council and the Mayor & Deputy Mayor of every corporation from its registered councillors.'
      : 'Office-bearers of the councils and corporations in your scope (view only).';
    const cell = (u, [post, label]) => { const b = officeBearer(u.id, post);
      return `<div style="margin-bottom:.45rem"><span style="font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">${label}</span><br>${b ? `<b>${esc(b.name)}</b> <span style="font-size:.74rem;color:var(--muted)">Ward ${b.ward}</span>` : '<i style="color:var(--muted)">vacant</i>'}
        ${canAppoint(u) ? ` <button class="btn btn-outline btn-sm" onclick="openAppoint('${u.id}','${post}')">${b ? 'Change' : 'Appoint'}</button>${b ? ` <button class="btn btn-danger btn-sm" onclick="removeBearer('${u.id}','${post}')">Remove</button>` : ''}` : ''}</div>`; };
    document.getElementById('bearTable').innerHTML = rows.length ? `<table class="tbl"><thead><tr><th>Council</th><th>Type</th><th>District</th><th>Councillors registered</th><th>Office-bearers</th></tr></thead><tbody>` +
      rows.slice(0, 150).map(u => { const posts = officePostsOf(u.id);
        return `<tr><td><b>${esc(u.name)}</b>${u.type === 'corp' ? `<br><span class="mono" style="font-size:.7rem;color:var(--muted)">mayor-${esc(u.id)}</span>` : ''}</td><td>${TYPE_SHORT[u.type]}</td><td>${esc(districtName(u.district))}</td><td>${regd[u.id] || 0}/${u.wards || '?'}</td><td>${posts.map(p => cell(u, p)).join('')}</td></tr>`; }).join('') + '</tbody></table>'
      + (rows.length > 150 ? '<p style="font-size:.78rem;color:var(--muted);margin-top:.5rem">Showing the first 150 — use the filters.</p>' : '')
      : '<div class="card empty"><p>No councils match.</p></div>';
  }
  window.openAppoint = (ulb, post) => {
    const u = ulbRec(ulb); const regs = DB.get('mcs').filter(m => (m.ulb || DEFAULT_ULB) === ulb).sort((a, b) => a.ward - b.ward);
    if (!regs.length) return amodal(`Appoint ${OFFICE_LABEL[post]}`, `<div class="notice warn">No councillor is registered in ${esc(u.name)} yet. The Executive Officer (or the District / State Administrator) registers councillors under <b>Credentials → Councillors</b>; then you can appoint office-bearers from them.</div>`);
    amodal(`${OFFICE_LABEL[post]} — ${u.name}`, `
      <div class="field"><label>Councillor</label><select id="apSel">${regs.map(m => { const tag = officeTagOf(ulb, m.ward); return `<option value="${m.ward}" ${tag && tag !== OFFICE_LABEL[post] ? 'disabled' : ''}>Ward ${m.ward} — ${esc(m.name)}${tag ? ' · ' + esc(tag) : ''}${m.blocked ? ' (blocked)' : ''}</option>`; }).join('')}</select></div>
      <button class="btn btn-pine" id="apGo">Appoint</button>`);
    document.getElementById('apGo').onclick = () => { const r = appointOfficeBearer({ ulb, post, ward:Number(document.getElementById('apSel').value), by:ACTOR }); if (!r.ok) return toast(r.msg, 'bad');
      closeM(); toast(`${OFFICE_LABEL[post]} of ${u.name} appointed${post === 'mayor' ? ` — the Mayor's login mayor-${ulb} now carries this name` : ''}.`); redraw(); };
  };
  window.removeBearer = async (ulb, post) => {
    const b = officeBearer(ulb, post);
    const ok = await confirmDialog({ icon:'🎗️', title:`Remove ${b ? b.name : 'the'} ${OFFICE_LABEL[post]}?`, message:'The post becomes vacant. The councillor remains a councillor.', okLabel:'Remove', cancelLabel:'Cancel', danger:true });
    if (!ok) return; clearOfficeBearer({ ulb, post, by:ACTOR }); toast('Post is now vacant.'); redraw();
  };

  // Called last, after every render function and every let/const it depends on has been
  // declared above — calling this any earlier throws a temporal-dead-zone error that silently
  // aborts the rest of renderAll(). Exposed globally so the language switcher can re-render in place.
  window.__renderAuthority = renderAll;
  renderAll();
}

document.addEventListener('change', async e => {
  const inp = e.target.closest && e.target.closest('input[data-deptphoto]'); if (!inp) return;
  try { const p = await resizeDeptPhoto(inp.files[0]); const r = setDepartmentPhoto(inp.dataset.deptphoto, p, Session.current());
    toast(r.ok ? 'Department photo updated — it now shows on the home page.' : r.msg, r.ok ? 'ok' : 'bad'); if (r.ok && window.__afterEmployeeChange) window.__afterEmployeeChange(); }
  catch (err) { toast(err.message, 'bad'); }
});
