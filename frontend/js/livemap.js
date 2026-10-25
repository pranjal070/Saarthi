/* ============================================================
   SAARTHI · livemap.js — live complaint map (Leaflet + OpenStreetMap, no paid APIs)
   Reads complaints from the shared DB cache (MongoDB through js/api.js); it refreshes on every sync.

   LiveMap.mount({ el, getComplaints, onOpen, simulate })
     el            container element
     getComplaints () => complaint[]   (already filtered to what this user may see)
     onOpen        (appNo) => void     opens the complaint in the dashboard
     simulate      optional () => void creates a demo complaint (showcase button)
   ============================================================ */
const LiveMap = (() => {
  const CENTERS = {
    amritsar:[31.634,74.872], barnala:[30.378,75.548], bathinda:[30.211,74.945], faridkot:[30.676,74.757],
    'fatehgarh-sahib':[30.644,76.394], fazilka:[30.403,74.028], ferozepur:[30.925,74.613], gurdaspur:[32.041,75.405],
    hoshiarpur:[31.532,75.917], jalandhar:[31.326,75.576], kapurthala:[31.380,75.381], ludhiana:[30.901,75.857],
    malerkotla:[30.531,75.880], mansa:[29.988,75.393], moga:[30.816,75.174], pathankot:[32.274,75.652],
    patiala:[30.340,76.386], rupnagar:[30.966,76.533], 'sas-nagar':[30.704,76.717], sangrur:[30.245,75.844],
    'sbs-nagar':[31.125,76.116], 'sri-muktsar-sahib':[30.474,74.516], 'tarn-taran':[31.451,74.928]
  };
  const PUNJAB = [30.9, 75.5];
  const NEW_MS = 30 * 60 * 1000;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const done = c => [STATUS.RESOLVED, STATUS.CLOSED].includes(c.status);

  function priorityOf(c){
    if (c.urgentFromCMO || c.escalated || c.status === STATUS.REOPENED) return 'Urgent';
    if (!done(c) && hoursLeft(c) <= 12) return 'High';
    return 'Normal';
  }
  const isNew = c => !done(c) && c.status === STATUS.SUBMITTED && Date.now() - c.createdAt < NEW_MS;
  const isUrgent = c => !done(c) && priorityOf(c) === 'Urgent';
  const colourOf = c => done(c) ? '#2fbf86' : isUrgent(c) ? '#ef4444' : c.status === STATUS.SUBMITTED ? '#f97316' : '#3b82f6';

  function loadLeaflet(){
    if (window.L) return Promise.resolve();
    return new Promise((res, rej) => {
      if (!document.querySelector('link[data-lf]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; l.dataset.lf = '1'; document.head.appendChild(l); }
      const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = res; s.onerror = () => rej(new Error('Leaflet could not be loaded')); document.head.appendChild(s);
    });
  }
  function injectCss(){
    if (document.getElementById('lm-css')) return;
    const st = document.createElement('style'); st.id = 'lm-css';
    st.textContent = `
.lm-wrap{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:1rem}
.lm-map{height:520px;border-radius:14px;border:1px solid var(--line);overflow:hidden;background:var(--card);z-index:0}
.lm-side{display:flex;flex-direction:column;gap:.6rem;min-width:0}
.lm-feed{max-height:420px;overflow:auto;display:flex;flex-direction:column;gap:.45rem}
.lm-item{border:1px solid var(--line);background:var(--card);border-radius:10px;padding:.55rem .7rem;cursor:pointer;font-size:.8rem}
.lm-item:hover{border-color:var(--primary)}
.lm-item b{display:block;font-size:.82rem}
.lm-item span{color:var(--muted);font-size:.72rem}
.lm-legend{display:flex;flex-wrap:wrap;gap:.9rem;font-size:.76rem;color:var(--muted);margin:.2rem 0 .8rem;align-items:center}
.lm-legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:.35rem;vertical-align:middle}
.lm-chips{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.7rem;align-items:center}
.lm-chip{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:.3rem .8rem;font-size:.76rem;cursor:pointer}
.lm-chip.on{background:var(--primary);border-color:var(--primary);color:#fff}
.lm-live{display:inline-flex;align-items:center;gap:.4rem;font-size:.74rem;color:var(--muted);margin-left:auto}
.lm-live:before{content:"";width:8px;height:8px;border-radius:50%;background:#2fbf86;animation:lmblink 1.4s infinite}
.lm-pin{position:relative;width:18px;height:18px}
.lm-pin i{position:absolute;inset:3px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)}
.lm-pin.pulse:before,.lm-pin.pulse:after{content:"";position:absolute;inset:-4px;border-radius:50%;background:var(--pc);opacity:.55;animation:lmpulse 1.6s ease-out infinite}
.lm-pin.pulse:after{animation-delay:.8s}
.lm-pin.pulse i{animation:lmblink 1.1s ease-in-out infinite}
@keyframes lmpulse{0%{transform:scale(.5);opacity:.7}100%{transform:scale(2.3);opacity:0}}
@keyframes lmblink{0%,100%{opacity:1}50%{opacity:.35}}
.lm-pop{font-size:.8rem;line-height:1.45;min-width:220px;color:#1a1d24}
.lm-pop h4{margin:0 0 .35rem;font-size:.9rem}
.lm-pop dl{display:grid;grid-template-columns:auto 1fr;gap:.15rem .6rem;margin:.3rem 0}
.lm-pop dt{color:#6b7280}
.lm-pop dd{margin:0;font-weight:600;word-break:break-word}
.lm-pop button{margin-top:.4rem;background:#f97316;color:#fff;border:0;border-radius:8px;padding:.35rem .8rem;cursor:pointer;font-weight:600}
.lm-tag{display:inline-block;border-radius:999px;padding:.05rem .5rem;font-size:.68rem;font-weight:700;color:#fff}
.lm-toast{position:absolute;bottom:34px;left:12px;max-width:80%;z-index:999;background:#ef4444;color:#fff;padding:.45rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,.4);display:none}
@media(max-width:900px){.lm-wrap{grid-template-columns:1fr}.lm-map{height:400px}.lm-feed{max-height:260px}}`;
    document.head.appendChild(st);
  }

  function mount(opts){
    injectCss();
    const root = opts.el;
    root.innerHTML = `
      <div class="lm-chips" id="lmChips">
        <button class="lm-chip on" data-f="all">All</button><button class="lm-chip" data-f="new">New</button>
        <button class="lm-chip" data-f="urgent">Urgent</button><button class="lm-chip" data-f="open">Open</button><button class="lm-chip" data-f="done">Resolved</button>
        ${opts.simulate ? '<button class="btn btn-outline btn-sm" id="lmSim" type="button">➕ Simulate incoming complaint</button>' : ''}
        <span class="lm-live" id="lmLive">Live · updates automatically</span>
      </div>
      <div class="lm-legend"><span><i style="background:#f97316"></i>New / submitted</span><span><i style="background:#3b82f6"></i>In process</span><span><i style="background:#ef4444"></i>Urgent / escalated</span><span><i style="background:#2fbf86"></i>Resolved</span><span>Pulsing marker = new or urgent</span><span id="lmCount"></span></div>
      <div class="lm-wrap"><div style="position:relative"><div class="lm-map" id="lmMap"></div><div class="lm-toast" id="lmToast"></div></div>
        <div class="lm-side"><b style="font-size:.85rem">Latest complaints</b><div class="lm-feed" id="lmFeed"></div></div></div>`;
    let map = null, filter = 'all', first = true, seen = new Set(), sig = '';
    const markers = new Map();
    const q = id => root.querySelector('#' + id);

    root.querySelectorAll('.lm-chip').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.f; root.querySelectorAll('.lm-chip').forEach(x => x.classList.toggle('on', x === b)); refresh(true);
    }));
    if (opts.simulate) q('lmSim').addEventListener('click', () => { opts.simulate(); refresh(); });

    const pass = c => filter === 'all' || (filter === 'new' && isNew(c)) || (filter === 'urgent' && isUrgent(c)) || (filter === 'open' && !done(c)) || (filter === 'done' && done(c));
    const hasLoc = c => c.coords && isFinite(c.coords.lat) && isFinite(c.coords.lng) && (c.coords.lat || c.coords.lng);
    const icon = c => { const col = colourOf(c), pulse = isNew(c) || isUrgent(c);
      return L.divIcon({ className:'', iconSize:[18,18], iconAnchor:[9,9], popupAnchor:[0,-8], html:`<div class="lm-pin ${pulse ? 'pulse' : ''}" style="--pc:${col}"><i style="background:${col}"></i></div>` }); };
    const popup = c => { const pr = priorityOf(c), col = pr === 'Urgent' ? '#ef4444' : pr === 'High' ? '#f59e0b' : '#6b7280';
      const d = deptById(c.dept) || { name:c.dept };
      return `<div class="lm-pop"><h4>${esc(c.subject)} ${isNew(c) ? '<span class="lm-tag" style="background:#f97316">NEW</span>' : ''}</h4>
        <dl><dt>Citizen</dt><dd>${esc(c.name)}</dd><dt>Complaint ID</dt><dd>${esc(c.appNo)}</dd><dt>Department</dt><dd>${esc(d.name)}</dd>
        <dt>Coordinates</dt><dd>${Number(c.coords.lat).toFixed(5)}, ${Number(c.coords.lng).toFixed(5)}</dd>
        <dt>Priority</dt><dd><span class="lm-tag" style="background:${col}">${pr}</span></dd><dt>Status</dt><dd>${esc(c.status)}</dd></dl>
        <div style="color:#374151">${esc((c.description || '').slice(0, 170))}${(c.description || '').length > 170 ? '…' : ''}</div>
        <button type="button" data-open="${esc(c.appNo)}">Open complaint</button></div>`; };

    function ensureMap(){
      if (map) return true;
      if (!window.L) return false;
      map = L.map(q('lmMap'), { scrollWheelZoom:true }).setView(PUNJAB, 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }).addTo(map);
      map.on('popupopen', e => { const b = e.popup.getElement().querySelector('[data-open]'); if (b) b.onclick = () => opts.onOpen && opts.onOpen(b.dataset.open); });
      return true;
    }

    function refresh(force){
      const all = opts.getComplaints() || [];
      const s = all.length + '|' + all.map(c => c.appNo + c.status + (c.escalated ? 1 : 0) + (c.currentOfficerId || '')).join(',').length + '|' + Math.max(0, ...all.map(c => c.createdAt || 0)) + '|' + filter + '|' + all.filter(isNew).length;
      if (!force && s === sig) return; sig = s;
      const shown = all.filter(pass), mapped = shown.filter(hasLoc);
      q('lmCount').textContent = `${shown.length} shown · ${all.filter(isNew).length} new · ${all.filter(isUrgent).length} urgent` + (shown.length - mapped.length ? ` · ${shown.length - mapped.length} without a location` : '');
      const feed = shown.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 25);
      q('lmFeed').innerHTML = feed.map(c => `<div class="lm-item" data-a="${esc(c.appNo)}"><b>${isNew(c) ? '🟠 ' : isUrgent(c) ? '🔴 ' : ''}${esc(c.subject)}</b><span>${esc(c.appNo)} · ${esc(c.status)} · ${esc(c.name)}</span></div>`).join('') || '<div class="lm-item" style="cursor:default"><span>No complaints to show for this filter.</span></div>';
      q('lmFeed').querySelectorAll('[data-a]').forEach(el => el.onclick = () => { const c = all.find(x => x.appNo === el.dataset.a); if (c && hasLoc(c) && map) { map.flyTo([c.coords.lat, c.coords.lng], 15); const m = markers.get(c.appNo); if (m) m.openPopup(); } else if (opts.onOpen) opts.onOpen(el.dataset.a); });
      if (!ensureMap()) return;
      const keep = new Set(mapped.map(c => c.appNo));
      markers.forEach((m, k) => { if (!keep.has(k)) { map.removeLayer(m); markers.delete(k); } });
      const fresh = [];
      mapped.forEach(c => {
        let m = markers.get(c.appNo);
        if (!m) { m = L.marker([c.coords.lat, c.coords.lng], { icon:icon(c) }).addTo(map).bindPopup(popup(c)); markers.set(c.appNo, m); if (!first && !seen.has(c.appNo) && isNew(c)) fresh.push(c); }
        else { m.setIcon(icon(c)); m.setPopupContent(popup(c)); }
        seen.add(c.appNo);
      });
      if (first || force) { const pts = mapped.map(c => [c.coords.lat, c.coords.lng]); if (pts.length) map.fitBounds(pts, { padding:[40, 40], maxZoom:13 }); first = false; }
      if (fresh.length) { const c = fresh[0], t = q('lmToast'); t.textContent = `🆕 New complaint ${c.appNo} — ${c.subject}`; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 4500);
        map.flyTo([c.coords.lat, c.coords.lng], Math.max(map.getZoom(), 13), { duration:1.2 }); const m = markers.get(c.appNo); if (m) setTimeout(() => m.openPopup(), 1300); }
    }

    // real-time: other tabs (citizen filing) fire "storage"; a light poll covers same-tab changes and ageing markers
    document.addEventListener('saarthi:sync', () => refresh());
    const timer = setInterval(() => { if (!document.body.contains(root)) return clearInterval(timer); if (root.offsetParent !== null) refresh(); }, 4000);

    loadLeaflet().then(() => { refresh(true); }).catch(() => { q('lmMap').innerHTML = '<div style="padding:2rem;color:var(--muted)">The map library could not be loaded (check your internet connection). The list on the right still updates live.</div>'; refresh(true); });
    return { refresh:() => { if (map) setTimeout(() => map.invalidateSize(), 50); refresh(true); } };
  }

  // Showcase helper: file a realistic complaint at a random spot near the district centre.
  function demoComplaint({ dept, district, ulb, ward, officer }){
    const BY = {
      police:[['Rash driving near school gate','Vehicles speed past the school at closing time; requesting a patrol.'],['Street brawl outside market','A group fight blocked the road in the evening; residents are scared.'],['Illegal parking blocking ambulance route','Cars are parked on both sides of the hospital road.']],
      electricity:[['Streetlights not working','The entire lane has been dark for a week; residents feel unsafe at night.'],['Low-hanging live wire','A loose electric wire is hanging near the school gate.'],['Transformer sparking','Loud sparks from the transformer every evening.']],
      municipal:[['Garbage not collected','Waste has piled up for five days and stray animals are scattering it.'],['Overflowing sewer near market','Drain water has spilled onto the road; strong smell and mosquitoes.'],['Large pothole on main road','Two-wheelers are skidding daily, a child was injured yesterday.']]
    };
    const SAMPLES = BY[dept] || [['Service request pending','The application has been pending for several weeks without any update.'],['Public facility not working','The facility in our locality has been out of order since last week.']];
    const [subject, description] = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    const base = CENTERS[district] || PUNJAB, now = Date.now();
    const urgent = Math.random() < 0.3;
    const code = (deptById(dept) || { code:'00' }).code;
    const c = {
      appNo: genAppNo(code), citizenId:'DEMO', name:['Gurpreet Kaur','Harman Singh','Simran Arora','Jaswinder Singh','Manpreet Kaur'][Math.floor(Math.random() * 5)], phone:'9876500000',
      ward: ward || 1, ulb: ulb || DEFAULT_ULB, district, dept, holdDept:dept, viaDepts:[], depotId:null, subject, description,
      coords:{ lat: base[0] + (Math.random() - .5) * .12, lng: base[1] + (Math.random() - .5) * .12 }, address:'Demo location', photo:null, files:[],
      status:STATUS.SUBMITTED, escalated:false, assignedOfficer:null, rating:null,
      currentOfficerId: officer ? officer.id : null, level: officer ? officer.rank : null, levelStartedAt:now,
      escalatedToDC:false, escalatedToCMO:false, urgentFromCMO:urgent, cmoAutoBan:false, forceClosed:false, createdAt:now, demo:true,
      timeline:[{ status:STATUS.SUBMITTED, note:'Grievance registered on Saarthi and routed automatically to the concerned department.', by:'Saarthi System', at:now }]
    };
    if (urgent) c.urgentFromRole = 'CMO Punjab';
    const list = DB.get('complaints'); list.push(c); DB.set('complaints', list);
    return c;
  }
  return { mount, demoComplaint, priorityOf, isNew, isUrgent, CENTERS };
})();
