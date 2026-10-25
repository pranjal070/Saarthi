/* ============================================================
   SAARTHI · employees.js — Employee register, roll IDs & transfers
   Used by the State / District administrators (authority.html) and by
   Department administrators (officer.html, rank-1 officers).
   Who may do what:
     State Administrator      create + transfer anywhere in Punjab
     District Administrator   create + transfer within their own district
     Department Administrator create + re-post within their own department & district
     DC / CMO / Minister      view details and posting history; may SUSPEND (never transfer):
                              DC → officers of his district · Minister → officers of his ministry's
                              departments · CMO / Chief Minister → any officer in Punjab
     MLA / EO / Mayor         no access to this register
   ============================================================ */
const EmpUI = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const day = ts => ts ? new Date(ts).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'Present';
  let ctx = null;      // { el, actor, scope, perms, filters, shown }

  function permsOf(actor){
    if (actor.role === 'admin')   return { create:true, transfer:true, anyDistrict:true, anyDept:true, label:'State Administrator' };
    if (actor.role === 'dadmin')  return { create:true, transfer:true, district:actor.district, anyDept:true, label:'District Administrator' };
    if (actor.role === 'officer') return { create:true, transfer:true, district:actor.district, dept:actor.dept, label:'Department Administrator' };
    if (actor.role === 'dc') return { create:false, transfer:false, label:'Deputy Commissioner (view · suspend within district)' };
    if (actor.role === 'cmo') return { create:false, transfer:false, label:'CMO Punjab (view · suspend any officer)' };
    if (actor.role === 'minister') { const m = ministryByKey(actor.ministryKey); return { create:false, transfer:false, label: m && m.isCM ? 'Chief Minister (view · suspend any officer)' : 'Minister (view · suspend within ministry)' }; }
    return { create:false, transfer:false, label:'View only' };
  }
  function scopeFor(actor){
    if (actor.role === 'officer') return { district:actor.district, dept:actor.dept };
    if (['dadmin','dc'].includes(actor.role)) return { district:actor.district, dept:null };
    if (actor.role === 'minister') { const m = ministryByKey(actor.ministryKey); const d = m ? (m.depts.includes('*') ? null : m.depts.slice()) : []; return { district:null, dept:null, depts:d }; }
    return { district:null, dept:null };
  }
  const canTouch = (p, o) => p.transfer && (p.anyDistrict || (o.district === p.district && (p.anyDept || o.dept === p.dept)));

  function mount(opts){
    const actor = opts.actor;
    ctx = { el: opts.el, actor, perms: permsOf(actor), scope: scopeFor(actor), q:'', fd:'', fdep:'', ft:'', limit:100 };
    ctx.fd = ctx.scope.district || ''; ctx.fdep = ctx.scope.dept || '';
    render();
  }

  function rows(){
    const { scope, q, fd, fdep, ft } = ctx; const ql = q.toLowerCase();
    return DB.get('officers')
      .filter(o => (!scope.district || o.district === scope.district) && (!scope.dept || o.dept === scope.dept) && (!scope.depts || scope.depts.includes(o.dept)))
      .filter(o => !fd || o.district === fd).filter(o => !fdep || o.dept === fdep).filter(o => !ft || o.tehsil === ft)
      .filter(o => !ql || o.name.toLowerCase().includes(ql) || (o.empId || '').toLowerCase().includes(ql) || (o.designation || '').toLowerCase().includes(ql) || (o.phone || '').includes(ql))
      .sort((a, b) => (a.district || '').localeCompare(b.district || '') || (a.dept || '').localeCompare(b.dept || '') || (a.rank || 9) - (b.rank || 9));
  }

  function render(){
    if (!ctx) return;
    const { el, perms, scope } = ctx;
    const list = rows();
    const dOpts = (scope.district ? allDistricts().filter(d => d.id === scope.district) : allDistricts())
      .map(d => `<option value="${d.id}" ${ctx.fd === d.id ? 'selected' : ''}>${esc(districtFull(d.id))}</option>`).join('');
    const tList = (ctx.fd || scope.district) ? tehsilsOfDistrict(ctx.fd || scope.district) : allTehsils();
    const tOpts = tList.slice().sort((a, b) => a.name.localeCompare(b.name)).map(t => `<option value="${t.id}" ${ctx.ft === t.id ? 'selected' : ''}>${esc(t.name)}${ctx.fd || scope.district ? '' : ' · ' + esc(districtName(t.district))}</option>`).join('');
    const pOpts = (scope.dept ? allDepartments().filter(d => d.id === scope.dept) : scope.depts ? allDepartments().concat([MC_DEPT]).filter(d => scope.depts.includes(d.id)) : allDepartments())
      .map(d => `<option value="${d.id}" ${ctx.fdep === d.id ? 'selected' : ''}>${d.ico} ${esc(d.name)}</option>`).join('');
    const shown = list.slice(0, ctx.limit);
    const recent = DB.get('transfers').filter(t => (!scope.district || t.from.district === scope.district || t.to.district === scope.district) && (!scope.dept || t.from.dept === scope.dept || t.to.dept === scope.dept))
      .sort((a, b) => b.at - a.at).slice(0, 6);

    el.innerHTML = `
      <div class="notice info" style="margin-bottom:1rem">Acting as <b>${perms.label}</b>${scope.district ? ` · ${esc(districtName(scope.district))}` : ' · all of Punjab'}${scope.dept ? ` · ${esc(deptById(scope.dept).name)}` : ''}${scope.depts ? ` · ${scope.depts.length ? esc(scope.depts.map(d => (deptById(d) || { name:d }).name).join(', ')) : 'no department mapped to your ministry yet'}` : ''}.
        Every employee has a permanent roll ID that stays the same across transfers.</div>
      <div class="filter-bar">
        ${scope.district ? '' : `<select id="emDist"><option value="">All districts</option>${dOpts}</select>`}
        <select id="emTeh"><option value="">All tehsils</option>${tOpts}</select>
        ${scope.dept ? '' : `<select id="emDept"><option value="">All departments</option>${pOpts}</select>`}
        <input id="emQ" value="${esc(ctx.q)}" placeholder="Search name, roll ID, post or phone" style="min-width:230px">
        ${perms.create ? `<button class="btn btn-pine btn-sm" id="emNew">➕ Register employee</button>` : ''}
        <button class="btn btn-outline btn-sm" id="emCsv">⬇️ CSV</button>
      </div>
      <div style="font-size:.78rem;color:var(--muted);margin:-.3rem 0 .6rem">${list.length} employee${list.length === 1 ? '' : 's'} in view${list.length > shown.length ? ` — showing first ${shown.length}, refine the search to narrow down` : ''}</div>
      ${shown.length ? `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Roll ID</th><th>Name</th><th>Present post</th><th>Department</th><th>District</th><th>Since</th><th></th></tr></thead><tbody>` +
        shown.map(o => {
          const cur = (o.postings || []).find(p => !p.to);
          return `<tr><td class="mono">${esc(o.empId)}</td>
            <td><b>${o.blocked ? '🚫 ' : ''}${esc(o.name)}</b>${o.suspension ? ' <span class="badge b-esc">suspended</span>' : ''}${o.demo ? ' <span class="badge b-sub" title="Placeholder record created to populate the district">demo</span>' : ''}<br><span style="font-size:.73rem;color:var(--muted)">📞 ${esc(o.phone)}</span></td>
            <td>${esc(o.designation)}<br><span style="font-size:.73rem;color:var(--muted)">Rank ${o.rank || 1}</span></td>
            <td>${deptById(o.dept) ? deptById(o.dept).ico + ' ' + esc(deptById(o.dept).name) : esc(o.dept)}</td>
            <td>${esc(districtName(o.district))}<br><span style="font-size:.72rem;color:var(--muted)">${o.tehsil ? 'Tehsil ' + esc(tehsilName(o.tehsil)) + ' · ' : ''}LS: ${esc(lsText(o.district))}</span></td><td>${day(cur ? cur.from : o.joinedAt)}</td>
            <td style="white-space:nowrap"><button class="btn btn-outline btn-sm" data-view="${o.id}">View</button>
              ${canTouch(perms, o) ? ` <button class="btn btn-outline btn-sm" data-tr="${o.id}">Transfer</button>` : ''}
              ${o.blocked ? (canReinstate(ctx.actor, o) ? ` <button class="btn btn-pine btn-sm" data-ri="${o.id}">Reinstate</button>` : '') : (canSuspend(ctx.actor, o) ? ` <button class="btn btn-danger btn-sm" data-sp="${o.id}">Suspend</button>` : '')}</td></tr>`;
        }).join('') + `</tbody></table></div>`
        : `<div class="card empty"><div class="big">🪪</div><p>No employees match.</p></div>`}
      ${recent.length ? `<div class="panel" style="margin-top:1.1rem"><div class="p-head"><h3>Recent transfers</h3></div><div class="p-body">${recent.map(t => `
        <div style="padding:.5rem 0;border-bottom:1px solid var(--line);font-size:.83rem"><b>${esc(t.name)}</b> <span class="mono" style="color:var(--muted)">${esc(t.empId)}</span><br>
          ${esc(districtName(t.from.district))} · ${esc(deptById(t.from.dept) ? deptById(t.from.dept).name : t.from.dept)} (${esc(t.from.designation)}) → <b>${esc(districtName(t.to.district))} · ${esc(deptById(t.to.dept) ? deptById(t.to.dept).name : t.to.dept)} (${esc(t.to.designation)})</b>
          <br><span style="color:var(--muted);font-size:.74rem">${fmt(t.at)} · Order ${esc(t.orderNo)} · by ${esc(t.by)}</span></div>`).join('')}</div></div>` : ''}`;

    const $ = id => el.querySelector('#' + id);
    if ($('emDist')) $('emDist').onchange = e => { ctx.fd = e.target.value; ctx.ft = ''; ctx.limit = 100; render(); };
    if ($('emDept')) $('emDept').onchange = e => { ctx.fdep = e.target.value; ctx.limit = 100; render(); };
    if ($('emTeh')) $('emTeh').onchange = e => { ctx.ft = e.target.value; ctx.limit = 100; render(); };
    el.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => openSuspend(b.dataset.sp));
    el.querySelectorAll('[data-ri]').forEach(b => b.onclick = () => openReinstate(b.dataset.ri));
    $('emQ').oninput = e => { ctx.q = e.target.value; ctx.limit = 100; const pos = e.target.selectionStart; render(); const n = el.querySelector('#emQ'); n.focus(); n.setSelectionRange(pos, pos); };
    if ($('emNew')) $('emNew').onclick = () => openRegister();
    $('emCsv').onclick = exportCsv;
    el.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openDetails(b.dataset.view));
    el.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => openTransfer(b.dataset.tr));
  }

  function modal(title, html){
    document.getElementById('mTitle').textContent = title;
    document.getElementById('mBody').innerHTML = html;
    document.getElementById('modalBg').classList.add('open');
  }

  function openDetails(id){
    const o = DB.get('officers').find(x => x.id === id); if (!o) return;
    const d = deptById(o.dept);
    const held = DB.get('complaints').filter(c => c.currentOfficerId === o.id && ![STATUS.RESOLVED, STATUS.CLOSED].includes(c.status)).length;
    const hist = (o.postings || []).slice().reverse();
    modal('Employee details', `
      <dl class="kv">
        <dt>Roll ID</dt><dd class="mono"><b>${esc(o.empId)}</b></dd>
        <dt>Name</dt><dd><b>${esc(o.name)}</b>${o.demo ? ' <span class="badge b-sub">demo record</span>' : ''}${o.blocked ? (o.suspension ? ' <span class="badge b-esc">Suspended</span>' : ' <span class="badge b-esc">Blocked</span>') : ''}</dd>
        ${o.suspension ? `<dt>Suspension</dt><dd>${esc(o.suspension.reason)}<br><span style="font-size:.76rem;color:var(--muted)">by ${esc(o.suspension.by)} (${esc(o.suspension.title)}) · ${day(o.suspension.at)}</span></dd>` : ''}
        <dt>Contact</dt><dd>📞 ${esc(o.phone)}</dd>
        <dt>Present post</dt><dd>${esc(o.designation)} · Rank ${o.rank || 1}</dd>
        <dt>Department</dt><dd>${d ? d.ico + ' ' + esc(d.name) : esc(o.dept)}</dd>
        <dt>District</dt><dd>${esc(districtWithLs(o.district))}</dd>
        ${o.tehsil ? `<dt>Tehsil</dt><dd>${esc(tehsilName(o.tehsil))}</dd>` : ''}
        <dt>Office</dt><dd>${esc(o.office || '—')}</dd>
        <dt>In service since</dt><dd>${day(o.joinedAt)}</dd>
        <dt>Files on desk</dt><dd>${held}</dd>
        ${o.createdBy ? `<dt>Registered by</dt><dd>${esc(o.createdBy.name)} (${esc(o.createdBy.role)}) · ${day(o.createdBy.at)}</dd>` : ''}
      </dl>
      <p style="font-weight:700;font-size:.9rem;margin:1.2rem 0 .6rem">Posting history <span style="font-weight:400;color:var(--muted);font-size:.78rem">· ${hist.length} posting${hist.length === 1 ? '' : 's'}</span></p>
      <div class="ledger">${hist.map((p, i) => `
        <div class="entry ${i === hist.length - 1 ? 'last' : ''}">
          <b>${esc(p.designation)} — ${deptById(p.dept) ? esc(deptById(p.dept).name) : esc(p.dept)}, ${esc(districtName(p.district))}${!p.to ? ' · <span style="color:var(--primary)">present posting</span>' : ''}</b>
          <div class="note">${day(p.from)} → ${day(p.to)} · Rank ${p.rank || 1}${p.office ? ' · ' + esc(p.office) : ''}</div>
          <div class="meta">${p.orderNo ? 'Order ' + esc(p.orderNo) : ''}${p.reason ? ' · ' + esc(p.reason) : ''}${p.by ? ' · by ' + esc(p.by) : ''}</div>
        </div>`).join('')}</div>
      ${(o.suspensions || []).length ? `<p style="font-weight:700;font-size:.9rem;margin:1.2rem 0 .6rem">Suspension record</p>${o.suspensions.slice().reverse().map(x => `<div style="font-size:.82rem;padding:.4rem 0;border-bottom:1px solid var(--line)">${day(x.at)} · ${esc(x.reason)} — <i>${esc(x.by)}</i>${x.revokedAt ? `<br><span style="color:var(--muted)">Lifted ${day(x.revokedAt)} by ${esc(x.revokedBy)}${x.revokeNote ? ': ' + esc(x.revokeNote) : ''}</span>` : ' <b style="color:var(--danger)">· in force</b>'}</div>`).join('')}` : ''}
      <div style="margin-top:1rem;display:flex;gap:.6rem;flex-wrap:wrap">
        ${canTouch(ctx.perms, o) ? `<button class="btn btn-pine btn-sm" id="emTrFromView">Transfer / re-post</button>` : ''}
        ${o.blocked ? (canReinstate(ctx.actor, o) ? `<button class="btn btn-pine btn-sm" id="emRiFromView">Reinstate</button>` : '') : (canSuspend(ctx.actor, o) ? `<button class="btn btn-danger btn-sm" id="emSpFromView">Suspend</button>` : '')}
      </div>`);
    const b = document.getElementById('emTrFromView'); if (b) b.onclick = () => openTransfer(o.id);
    const sp = document.getElementById('emSpFromView'); if (sp) sp.onclick = () => openSuspend(o.id);
    const ri = document.getElementById('emRiFromView'); if (ri) ri.onclick = () => openReinstate(o.id);
  }

  function posOptions(dept, district){
    return positionsOf(dept, district).map(p => `Rank ${p.rank}: ${esc(p.title)}`).join(' · ') || 'No positions yet — your entry becomes the first.';
  }

  function openTransfer(id){
    const o = DB.get('officers').find(x => x.id === id); if (!o) return;
    const p = ctx.perms;
    const dChoices = p.anyDistrict ? allDistricts() : allDistricts().filter(d => d.id === (p.district || o.district));
    const depChoices = p.anyDept ? allDepartments() : allDepartments().filter(d => d.id === (p.dept || o.dept));
    modal(`Transfer — ${o.name}`, `
      <p style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem"><span class="mono">${esc(o.empId)}</span> · currently ${esc(o.designation)}, ${esc(deptById(o.dept).name)}, ${esc(districtName(o.district))}. The present posting is closed and a new one opened — history is kept.</p>
      <div class="form-grid">
        <div class="field"><label>New district</label><select id="trD" ${dChoices.length < 2 ? 'disabled' : ''}>${dChoices.map(d => `<option value="${d.id}" ${d.id === o.district ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>
        <div class="field"><label>New department</label><select id="trP" ${depChoices.length < 2 ? 'disabled' : ''}>${depChoices.map(d => `<option value="${d.id}" ${d.id === o.dept ? 'selected' : ''}>${d.ico} ${esc(d.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Designation <span class="req">*</span></label><input id="trDes" value="${esc(o.designation)}"></div>
        <div class="field"><label>Rank <span class="req">*</span></label><input id="trRank" type="number" min="1" value="${o.rank || 1}">
          <div class="hint" id="trPos"></div></div>
        <div class="field"><label>Tehsil (optional)</label><select id="trTeh"></select></div>
        <div class="field full"><label>Office address (optional)</label><input id="trOff" placeholder="Leave blank for the default office"></div>
        <div class="field"><label>Transfer order no. (optional)</label><input id="trOrd" placeholder="e.g. LG/Tr/2026/114"></div>
        <div class="field"><label>Reason <span class="req">*</span></label><input id="trWhy" placeholder="e.g. Administrative grounds"></div>
      </div>
      <p style="font-size:.76rem;color:var(--muted);margin-bottom:.8rem">Files this employee still holds are handed to the next officer in the old post.</p>
      <button class="btn btn-pine" id="trGo">Confirm transfer</button>`);
    const hint = () => { document.getElementById('trPos').textContent = 'Positions there: ' + posOptions(document.getElementById('trP').value, document.getElementById('trD').value).replace(/&amp;/g, '&'); };
    const fillTeh = () => { document.getElementById('trTeh').innerHTML = '<option value="">District level</option>' + tehsilsOfDistrict(document.getElementById('trD').value).sort((a, b) => a.name.localeCompare(b.name)).map(t => `<option value="${t.id}" ${t.id === o.tehsil ? 'selected' : ''}>${esc(t.name)}</option>`).join(''); };
    document.getElementById('trD').onchange = () => { hint(); fillTeh(); }; document.getElementById('trP').onchange = hint; hint(); fillTeh();
    document.getElementById('trGo').onclick = () => {
      const des = document.getElementById('trDes').value.trim(), why = document.getElementById('trWhy').value.trim();
      const rank = Number(document.getElementById('trRank').value);
      if (des.length < 2) return toast('Enter the designation.', 'bad');
      if (!rank || rank < 1) return toast('Enter a rank of 1 or more.', 'bad');
      if (why.length < 3) return toast('Enter the reason for the transfer.', 'bad');
      const toDistrict = document.getElementById('trD').value, toDept = document.getElementById('trP').value;
      if (!canTouch(p, { district:o.district, dept:o.dept })) return toast('You are not authorised to transfer this employee.', 'bad');
      if (!p.anyDistrict && toDistrict !== p.district) return toast('You can only post within your own district.', 'bad');
      if (!p.anyDept && toDept !== p.dept) return toast('You can only post within your own department.', 'bad');
      transferEmployee({ officerId:o.id, toDistrict, toDept, toDesignation:des, toRank:rank, toOffice:document.getElementById('trOff').value.trim(), toTehsil:document.getElementById('trTeh').value,
        orderNo:document.getElementById('trOrd').value.trim(), reason:why, by:ctx.actor });
      document.getElementById('modalBg').classList.remove('open');
      toast(`${o.name} posted to ${districtName(toDistrict)} · ${deptById(toDept).name}.`);
      render();
      if (typeof window.__afterEmployeeChange === 'function') window.__afterEmployeeChange();
    };
  }

  function openRegister(){
    const p = ctx.perms, sc = ctx.scope;
    const dChoices = p.anyDistrict ? allDistricts() : allDistricts().filter(d => d.id === p.district);
    const depChoices = p.anyDept ? allDepartments() : allDepartments().filter(d => d.id === p.dept);
    modal('Register a new employee', `
      <div class="form-grid">
        <div class="field"><label>Full name <span class="req">*</span></label><input id="rgN"></div>
        <div class="field"><label>Mobile number <span class="req">*</span></label><input id="rgPh" maxlength="10" inputmode="numeric"></div>
        <div class="field"><label>District <span class="req">*</span></label><select id="rgD" ${dChoices.length < 2 ? 'disabled' : ''}>${dChoices.map(d => `<option value="${d.id}" ${d.id === (sc.district || '') ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Department <span class="req">*</span></label><select id="rgP" ${depChoices.length < 2 ? 'disabled' : ''}>${depChoices.map(d => `<option value="${d.id}">${d.ico} ${esc(d.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Designation <span class="req">*</span></label><input id="rgDes" placeholder="e.g. Sub-Divisional Officer"></div>
        <div class="field"><label>Rank <span class="req">*</span></label><input id="rgRank" type="number" min="1" value="2"><div class="hint" id="rgPos"></div></div>
        <div class="field"><label>Tehsil (optional)</label><select id="rgTeh"></select></div>
        <div class="field full"><label>Office address (optional)</label><input id="rgOff"></div>
      </div>
      <p style="font-size:.76rem;color:var(--muted);margin-bottom:.8rem">A permanent roll ID is generated automatically. The employee signs in with the roll ID and the default password <b>officer@123</b>, and should change it on first use.</p>
      <button class="btn btn-pine" id="rgGo">Register employee</button>`);
    const hint = () => { document.getElementById('rgPos').textContent = '1 = department head. Existing: ' + posOptions(document.getElementById('rgP').value, document.getElementById('rgD').value).replace(/&amp;/g, '&'); };
    const fillRgTeh = () => { document.getElementById('rgTeh').innerHTML = '<option value="">District level</option>' + tehsilsOfDistrict(document.getElementById('rgD').value).sort((a, b) => a.name.localeCompare(b.name)).map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join(''); };
    document.getElementById('rgD').onchange = () => { hint(); fillRgTeh(); }; document.getElementById('rgP').onchange = hint; hint(); fillRgTeh();
    document.getElementById('rgGo').onclick = () => {
      const name = document.getElementById('rgN').value.trim(), phone = document.getElementById('rgPh').value.trim();
      const des = document.getElementById('rgDes').value.trim(), rank = Number(document.getElementById('rgRank').value);
      const district = document.getElementById('rgD').value, dept = document.getElementById('rgP').value;
      if (name.length < 3) return toast("Enter the employee's name.", 'bad');
      if (!/^[6-9]\d{9}$/.test(phone)) return toast('Enter a valid 10-digit mobile number.', 'bad');
      if (des.length < 2) return toast('Enter the designation.', 'bad');
      if (!rank || rank < 1) return toast('Enter a rank of 1 or more.', 'bad');
      if (!p.anyDistrict && district !== p.district) return toast('You can only register employees in your own district.', 'bad');
      if (!p.anyDept && dept !== p.dept) return toast('You can only register employees in your own department.', 'bad');
      const o = createEmployee({ name, phone, dept, district, designation:des, rank, office:document.getElementById('rgOff').value.trim(), tehsil:document.getElementById('rgTeh').value, by:ctx.actor });
      modal('Employee registered', `<div class="notice info">✔ <b>${esc(o.name)}</b> has been registered as ${esc(o.designation)}, ${esc(deptById(dept).name)}, ${esc(districtName(district))}.</div>
        <dl class="kv"><dt>Roll ID</dt><dd class="mono"><b>${esc(o.empId)}</b></dd><dt>Default password</dt><dd>officer@123</dd></dl>`);
      render();
      if (typeof window.__afterEmployeeChange === 'function') window.__afterEmployeeChange();
    };
  }

  function openSuspend(id){
    const o = DB.get('officers').find(x => x.id === id); if (!o) return;
    if (!canSuspend(ctx.actor, o)) return toast('You do not have the power to suspend this officer.', 'bad');
    const held = DB.get('complaints').filter(c => c.currentOfficerId === o.id && ![STATUS.RESOLVED, STATUS.CLOSED].includes(c.status)).length;
    modal(`Suspend — ${o.name}`, `
      <p style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem"><span class="mono">${esc(o.empId)}</span> · ${esc(o.designation)}, ${esc(deptById(o.dept) ? deptById(o.dept).name : o.dept)}, ${esc(districtName(o.district))}. The officer loses access to their dashboard at once. ${held ? `The ${held} open file${held === 1 ? '' : 's'} on their desk go to the next officer in the post.` : 'They hold no open files.'} The order is recorded in their service record.</p>
      <div class="field"><label>Reason for suspension <span class="req">*</span></label><textarea id="spWhy" rows="3" placeholder="State the ground for suspension"></textarea></div>
      <button class="btn btn-danger" id="spGo">Suspend officer</button>`);
    document.getElementById('spGo').onclick = () => {
      const r = suspendOfficer({ officerId:o.id, reason:document.getElementById('spWhy').value, by:ctx.actor });
      if (!r.ok) return toast(r.msg, 'bad');
      document.getElementById('modalBg').classList.remove('open'); toast(`${o.name} has been suspended.`, 'bad'); render();
      if (typeof window.__afterEmployeeChange === 'function') window.__afterEmployeeChange();
    };
  }
  function openReinstate(id){
    const o = DB.get('officers').find(x => x.id === id); if (!o) return;
    modal(`Reinstate — ${o.name}`, `
      <p style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem">${o.suspension ? `Suspended by ${esc(o.suspension.by)} on ${day(o.suspension.at)}: “${esc(o.suspension.reason)}”.` : 'This account is blocked.'} Reinstating restores their dashboard access.</p>
      <div class="field"><label>Note (optional)</label><input id="riNote"></div>
      <button class="btn btn-pine" id="riGo">Reinstate officer</button>`);
    document.getElementById('riGo').onclick = () => {
      const r = reinstateOfficer({ officerId:o.id, note:document.getElementById('riNote').value, by:ctx.actor });
      if (!r.ok) return toast(r.msg, 'bad');
      document.getElementById('modalBg').classList.remove('open'); toast(`${o.name} has been reinstated.`); render();
      if (typeof window.__afterEmployeeChange === 'function') window.__afterEmployeeChange();
    };
  }

  function exportCsv(){
    const rows = [['Roll ID','Name','Phone','Designation','Rank','Department','District','Tehsil','Status','Office','In service since','Postings']]
      .concat(rows_().map(o => [o.empId, `"${o.name}"`, o.phone, `"${o.designation}"`, o.rank, deptById(o.dept) ? deptById(o.dept).name : o.dept, districtName(o.district), o.tehsil ? tehsilName(o.tehsil) : '', o.blocked ? 'Suspended' : 'Active', `"${o.office || ''}"`, day(o.joinedAt),
        `"${(o.postings || []).map(p => `${districtName(p.district)}/${p.dept}/${p.designation} ${day(p.from)}-${day(p.to)}`).join(' | ')}"`]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type:'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'saarthi-employees.csv'; a.click();
    toast('Downloaded employee register as CSV.');
  }
  const rows_ = rows;

  return { mount, render, openDetails, openSuspend, openReinstate };
})();
