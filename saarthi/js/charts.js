/* ============================================================
   SAARTHI · charts.js
   Hand-built SVG charts — no external library.
   Syllabus: functions, arrays, map/reduce, template literals (T7–16)
   ============================================================ */

const PALETTE = ['#1250A4','#1D6FD8','#4A90E2','#7CB8F2','#0D2B52','#2E7D5B','#B45309','#8E44AD','#C0392B','#0E7490','#6D28D9','#475569'];

/* ---- Donut chart ---- */
function donut(data, size = 190){                 // data: [{label, value}]
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return `<div class="chart-empty">No data yet</div>`;
  const R = 60, C = 2 * Math.PI * R;
  let offset = 0;
  const rings = data.map((d, i) => {
    const len = (d.value / total) * C;
    const seg = `<circle class="seg" cx="80" cy="80" r="${R}" fill="none"
      stroke="${PALETTE[i % PALETTE.length]}" stroke-width="22"
      stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}"
      transform="rotate(-90 80 80)"><title>${d.label}: ${d.value}</title></circle>`;
    offset += len;
    return seg;
  }).join('');
  const legend = data.map((d, i) => `
    <li><span class="sw" style="background:${PALETTE[i % PALETTE.length]}"></span>
      <span class="lb">${d.label}</span><b>${d.value}</b></li>`).join('');
  return `<div class="donut-wrap">
    <svg viewBox="0 0 160 160" width="${size}" height="${size}">
      ${rings}
      <text x="80" y="74" class="d-num">${total}</text>
      <text x="80" y="92" class="d-lab">TOTAL</text>
    </svg>
    <ul class="legend">${legend}</ul>
  </div>`;
}

/* ---- Vertical bar chart ---- */
function bars(data, h = 150){                     // data: [{label, value}]
  const max = Math.max(...data.map(d => d.value), 1);
  return `<div class="bars" style="height:${h + 34}px">` + data.map(d => `
    <div class="bar-col">
      <div class="bar-val">${d.value}</div>
      <div class="bar" style="height:${Math.max((d.value / max) * h, 3)}px"><span></span></div>
      <div class="bar-lab">${d.label}</div>
    </div>`).join('') + '</div>';
}

/* ---- Horizontal progress rows ---- */
function progressRows(rows){                      // rows: [{label, done, total}]
  if (!rows.length) return `<div class="chart-empty">No data yet</div>`;
  return rows.map(r => {
    const pct = r.total ? Math.round(r.done / r.total * 100) : 0;
    return `<div class="prow">
      <div class="prow-top"><span>${r.label}</span><b>${pct}%</b></div>
      <div class="ptrack"><div class="pfill" style="width:${pct}%"></div></div>
      <div class="prow-sub">${r.done} of ${r.total} resolved</div>
    </div>`;
  }).join('');
}

/* ---- Semi-circular SLA gauge ---- */
function gauge(pct){
  const R = 62, C = Math.PI * R;                  // half circumference
  const len = (Math.min(Math.max(pct, 0), 100) / 100) * C;
  const color = pct >= 75 ? '#1E7F4F' : pct >= 40 ? '#B45309' : '#C0392B';
  return `<svg viewBox="0 0 160 92" width="180" height="104" class="gauge">
    <path d="M18,80 A62,62 0 0 1 142,80" fill="none" stroke="#E4EBF5" stroke-width="14" stroke-linecap="round"/>
    <path d="M18,80 A62,62 0 0 1 142,80" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"
      stroke-dasharray="${len} ${C}"/>
    <text x="80" y="66" class="g-num" fill="${color}">${pct}%</text>
    <text x="80" y="84" class="g-lab">within SLA</text>
  </svg>`;
}

/* ---- Tiny sparkline for KPI tiles ---- */
function spark(values, w = 84, h = 26){
  if (values.length < 2) return '';
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) =>
    `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
