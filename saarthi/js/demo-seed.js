/* Optional: load sample grievances so charts have data during a demo.
   Open the browser console on the dashboard and run:  seedDemo()   */
function seedDemo(){
  const u = JSON.parse(sessionStorage.getItem('saarthi_session'));
  if (!u || u.role !== 'citizen') return alert('Sign in as a citizen first.');
  const S = ['Submitted','Received by Department','Under Review','Officer Assigned','In Progress','Resolved','Closed'];
  const samples = [
    ['pwd','Deep pothole near Gol Chowk service lane','Water collects after every rain; two-wheelers slip daily.'],
    ['electricity','Streetlights dead on Patiala Road stretch','Entire lane dark for eleven nights; unsafe for women returning late.'],
    ['water','Sewer overflow behind Model Town market','Drain water on the road, severe smell, shops affected.'],
    ['municipal','Garbage not lifted from Ward dhalao','Heap uncleared for six days; stray dogs around it.'],
    ['animal','Stray cattle blocking main bazaar road','Frequent traffic jam and risk of accidents at peak hours.'],
    ['health','Fogging not done despite dengue cases','Two dengue cases reported in the locality this month.'],
    ['police','Rash driving near school gate at closing time','Requesting patrol between 1:30 and 2:30 pm.'],
    ['food','Stale food sold at bus stand stall','Multiple residents fell ill after eating there.']
  ];
  const list = JSON.parse(localStorage.getItem('saarthi_complaints')) || [];
  samples.forEach((s, i) => {
    const daysAgo = i * 9 + 2;
    const created = Date.now() - daysAgo * 864e5;
    const st = S[Math.min(i, S.length - 1)];
    const seq = String(Number(localStorage.getItem('saarthi_seq') || 0) + 1).padStart(6,'0');
    localStorage.setItem('saarthi_seq', Number(localStorage.getItem('saarthi_seq') || 0) + 1);
    const codes = {police:'01',fire:'02',health:'03',pwd:'04',electricity:'05',municipal:'06',
                   irrigation:'07',water:'08',animal:'09',food:'10',industry:'11'};
    list.push({
      appNo: String(new Date().getFullYear()).slice(2) + codes[s[0]] + seq,
      citizenId: u.id, name: u.name, phone: u.phone, ward: u.ward, dept: s[0],
      subject: s[1], description: s[2],
      coords: { lat: 30.4795 + Math.random()*0.02, lng: 76.5947 + Math.random()*0.02 },
      address: 'Rajpura, Patiala, Punjab', photo: null, files: [],
      status: st, escalated: i % 3 === 0 && !['Resolved','Closed'].includes(st),
      assignedOfficer: ['Officer Assigned','In Progress','Resolved','Closed'].includes(st)
        ? { name:'JE Sukhdev Singh', phone:'9872001234' } : null,
      rating: st === 'Closed' ? 4 : null,
      createdAt: created,
      timeline: [{ status:'Submitted', note:'Grievance registered on Saarthi and forwarded to the concerned department.', by:'Saarthi System', at:created },
        ...(st !== 'Submitted' ? [{ status:st, note:'Status updated by the department during processing.', by:'Department desk', at: created + 36e5*6 }] : [])]
    });
  });
  localStorage.setItem('saarthi_complaints', JSON.stringify(list));
  location.reload();
}
