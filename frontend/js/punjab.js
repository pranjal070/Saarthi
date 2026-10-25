/* ============================================================
   SAARTHI · punjab.js — Punjab-wide reference data
   23 districts · 14 municipal corporations · municipal councils
   & nagar panchayats · transport depots · council of ministers.

   SOURCES (fetched Oct 2026) and honest caveats:
   - Corporations / councils / nagar panchayats and ward counts:
     Wikipedia "2021 Punjab local elections", "2024 Punjab local
     elections", "2026 Punjab local elections" (seat counts = wards).
   - Roadways depots: punjabroadways.punjab.gov.in/en/about-us (18 depots).
   - PRTC depots: pepsurtc.com (9 depots).
   - Ministers / portfolios: Wikipedia "Mann ministry" (Oct 2026). Portfolio
     lists differ between sources — verify against the official notification.
   - Vidhan Sabha constituencies (117), their Lok Sabha seat and sitting MLAs:
     Wikipedia "List of constituencies of the Punjab Legislative Assembly" and
     the page of each of the 13 Lok Sabha constituencies (fetched Oct 2026).
     MLAs can change (by-elections, defections) — the State Administrator can
     correct any name from the "Constituencies" screen.
   - Tehsils / sub-tehsils: names from the Punjab Land Records Society list
     (plrs.org.in). That list carries no district headings, so the district of
     each tehsil was assigned by Saarthi and is editable (verify:true = unsure).
   - Council -> constituency / tehsil links are matched by name where that is
     unambiguous and left blank otherwise. The State Administrator completes them.
   Entries with  verify:true  conflict between sources or have no verified
   ward count (wards:null). The State Administrator can correct any ward
   count from the "Districts & councils" screen — nothing needs a code edit.
   ============================================================ */

// id, name, 3-letter code, headquarters
const DISTRICTS = [
  ['amritsar','Amritsar','ASR'],['barnala','Barnala','BNL'],['bathinda','Bathinda','BTI'],
  ['faridkot','Faridkot','FDK'],['fatehgarh-sahib','Fatehgarh Sahib','FGS'],['fazilka','Fazilka','FZK'],
  ['ferozepur','Ferozepur','FZR'],['gurdaspur','Gurdaspur','GSP'],['hoshiarpur','Hoshiarpur','HSP'],
  ['jalandhar','Jalandhar','JLD'],['kapurthala','Kapurthala','KPT'],['ludhiana','Ludhiana','LDH'],
  ['malerkotla','Malerkotla','MLK'],['mansa','Mansa','MNS'],['moga','Moga','MGA'],
  ['pathankot','Pathankot','PTK'],['patiala','Patiala','PTA'],['rupnagar','Rupnagar','RPR'],
  ['sas-nagar','SAS Nagar (Mohali)','SAS'],['sangrur','Sangrur','SGR'],['sbs-nagar','SBS Nagar (Nawanshahr)','SBS'],
  ['sri-muktsar-sahib','Sri Muktsar Sahib','MKS'],['tarn-taran','Tarn Taran','TNT']
].map(([id,name,code]) => ({ id, name, code }));

// Municipal corporations: district|name|wards|flag
const _CORPS = `amritsar|Amritsar|85
jalandhar|Jalandhar|85
ludhiana|Ludhiana|95
patiala|Patiala|60
kapurthala|Phagwara|50
bathinda|Bathinda|50
sas-nagar|Mohali|50
fazilka|Abohar|50
gurdaspur|Batala|50
moga|Moga|50
hoshiarpur|Hoshiarpur|50|v
kapurthala|Kapurthala|50
pathankot|Pathankot|50
barnala|Barnala|50|v`;

// Municipal councils (c) and nagar panchayats (n): district|name|wards|type|flag
const _COUNCILS = `amritsar|Ajnala|15|c
amritsar|Jandiala Guru|15|c
amritsar|Majitha|13|c
amritsar|Ramdass|11|c
amritsar|Rayya|13|n
barnala|Bhadaur|13|c
barnala|Dhanaula|13|c
barnala|Tapa|15|c
bathinda|Bhucho Mandi|13|c
bathinda|Bhagta Bhai Ka|13|n
bathinda|Bhai Rupa|13|n
bathinda|Goniana|13|c
bathinda|Raman|15|c
bathinda|Maluka|11|n
bathinda|Maur|17|c
bathinda|Nathana|11|n
bathinda|Kot Shamir|13|n
bathinda|Kotha Guru|11|n
bathinda|Kot Fatta|11|c
bathinda|Lehra Mohabbat|11|n
bathinda|Mehraj|13|n
bathinda|Sangat|9|c
faridkot|Faridkot|25|c
faridkot|Jaito|17|c
faridkot|Kotkapura|29|c
fatehgarh-sahib|Bassi Pathana|16|c
fatehgarh-sahib|Khamano|13|n
fatehgarh-sahib|Mandi Gobindgarh|29|c
fatehgarh-sahib|Sirhind-Fatehgarh Sahib|23|c
fazilka|Arniwala Sheikh Subhan|11|n
fazilka|Fazilka|25|c
fazilka|Jalalabad|17|c
ferozepur|Ferozepur|33|c
ferozepur|Guru Har Sahai|13|c
ferozepur|Mudki|13|n
ferozepur|Mamdot|13|c
ferozepur|Talwandi Bhai|13|c
ferozepur|Zira|17|c
gurdaspur|Dhariwal|13|c
gurdaspur|Dinanagar|15|c
gurdaspur|Fatehgarh Churian|13|c
gurdaspur|Gurdaspur|29|c
gurdaspur|Qadian|15|c
gurdaspur|Sri Hargobindpur|11|c
hoshiarpur|Dasuya|15|c
hoshiarpur|Garhdiwala|11|c
hoshiarpur|Garh Shankar|13|c
hoshiarpur|Hariana|11|c
hoshiarpur|Mukerian|15|c
hoshiarpur|Sham Churasi|9|c
hoshiarpur|Urmar Tanda|15|c
jalandhar|Adampur|13|c
jalandhar|Alawalpur|11|c
jalandhar|Kartarpur|15|c
jalandhar|Nakodar|17|c
jalandhar|Noormahal|13|c
jalandhar|Phillaur|15|c
jalandhar|Lohian Khas|13|n
jalandhar|Mehatpur|13|n
kapurthala|Sultanpur Lodhi|13|c
ludhiana|Doraha|15|c
ludhiana|Jagraon|23|c
ludhiana|Khanna|33|c
ludhiana|Payal|11|c
ludhiana|Raikot|15|c
ludhiana|Samrala|15|c
malerkotla|Malerkotla|33|c
malerkotla|Ahmedgarh|17|c
malerkotla|Amargarh|11|n
mansa|Bareta|13|c
mansa|Budhlada|19|c
mansa|Joga|13|n
mansa|Boha|13|n
mansa|Mansa|27|c
moga|Badhni Kalan|13|c
moga|Kot Ise Khan|13|n
moga|Nihal Singh Wala|13|c
pathankot|Sujanpur|15|c
patiala|Nabha|23|c
patiala|Patran|17|c
patiala|Rajpura|31|c|v
patiala|Samana|21|c
rupnagar|Anandpur Sahib|13|c
rupnagar|Kiratpur Sahib|11|n
rupnagar|Morinda|15|c
rupnagar|Nangal|19|c
rupnagar|Sri Chamkaur Sahib|13|c
rupnagar|Rupnagar|21|c
sas-nagar|Banur|13|c
sas-nagar|Dera Bassi|19|c
sas-nagar|Kharar|27|c
sas-nagar|Kurali|17|c
sas-nagar|Lalru|17|c
sas-nagar|Nayagaon|21|c
sas-nagar|Zirakpur|31|c
sangrur|Sangrur|null|c|v
sangrur|Bhawanigarh|15|c
sangrur|Dhuri|21|c
sangrur|Lehragaga|15|c
sangrur|Longowal|15|c
sangrur|Sunam|23|c
sbs-nagar|Banga|15|c
sbs-nagar|Nawanshahr|19|c
sbs-nagar|Rahon|13|c
sri-muktsar-sahib|Gidderbaha|19|c
sri-muktsar-sahib|Malout|27|c
sri-muktsar-sahib|Sri Muktsar Sahib|31|c
tarn-taran|Tarn Taran|null|c|v
tarn-taran|Patti|19|c
tarn-taran|Bhikhiwind|13|n`;

const _slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const ULBS = []
  .concat(_CORPS.split('\n').map(l => { const [d,n,w,f] = l.split('|');
    return { id:_slug(n), name:n, district:d, type:'corp', wards:Number(w), verify:f==='v' }; }))
  .concat(_COUNCILS.split('\n').map(l => { const [d,n,w,t,f] = l.split('|');
    return { id:_slug(n), name:n, district:d, type: t==='n' ? 'np' : 'council', wards: w==='null' ? null : Number(w), verify:f==='v' || w==='null' }; }));
const ULB_TYPE_LABEL = { corp:'Municipal Corporation', council:'Municipal Council', np:'Nagar Panchayat' };

// Public-transport depots. operator: 'roadways' (Punjab Roadways / PUNBUS) or 'prtc' (PEPSU Road Transport Corp.)
// Chandigarh depots sit in a Union Territory — mapped to SAS Nagar for administration (verify:true).
const DEPOTS = []
  .concat([['Chandigarh','sas-nagar',1],['Roopnagar','rupnagar'],['Ludhiana','ludhiana'],['Moga','moga'],['Jagraon','ludhiana'],
           ['Nangal','rupnagar'],['Jalandhar-1','jalandhar'],['Jalandhar-2','jalandhar'],['Nawanshahr','sbs-nagar'],['Batala','gurdaspur'],
           ['Pathankot','pathankot'],['Hoshiarpur','hoshiarpur'],['Amritsar-1','amritsar'],['Amritsar-2','amritsar'],
           ['Tarn Taran','tarn-taran'],['Patti','tarn-taran'],['Ferozepur','ferozepur'],['Muktsar','sri-muktsar-sahib']]
    .map(([n,d,v]) => ({ id:'rw-'+_slug(n), name:n, district:d, operator:'roadways', verify:!!v })))
  .concat([['Patiala','patiala'],['Sangrur','sangrur'],['Chandigarh','sas-nagar',1],['Bathinda','bathinda'],['Budhlada','mansa'],
           ['Faridkot','faridkot'],['Kapurthala','kapurthala'],['Barnala','barnala'],['Ludhiana','ludhiana']]
    .map(([n,d,v]) => ({ id:'prtc-'+_slug(n), name:n, district:d, operator:'prtc', verify:!!v })));
const OPERATOR_LABEL = { roadways:'Punjab Roadways', prtc:'PRTC' };


// ============================================================
// Lok Sabha (13) and Vidhan Sabha (117) constituencies
// ============================================================
const LOK_SABHA = [
  ['gurdaspur','Gurdaspur',0],['amritsar','Amritsar',0],['khadoor-sahib','Khadoor Sahib',0],['jalandhar','Jalandhar',1],
  ['hoshiarpur','Hoshiarpur',1],['anandpur-sahib','Anandpur Sahib',0],['ludhiana','Ludhiana',0],['fatehgarh-sahib','Fatehgarh Sahib',1],
  ['faridkot','Faridkot',1],['firozpur','Firozpur',0],['bathinda','Bathinda',0],['sangrur','Sangrur',0],['patiala','Patiala',0]
].map(([id,name,sc],i) => ({ id, name, sc:!!sc, no:i+1 }));

// Sitting MPs — 2024 general election (verify after any by-election)
const MPS_SEED = { gurdaspur:'Sukhjinder Singh Randhawa', amritsar:'Gurjeet Singh Aujla', 'khadoor-sahib':'Amritpal Singh', jalandhar:'Charanjit Singh Channi', hoshiarpur:'Raj Kumar Chabbewal', 'anandpur-sahib':'Malvinder Singh Kang', ludhiana:'Amarinder Singh Raja Warring', 'fatehgarh-sahib':'Amar Singh', faridkot:'Sarabjeet Singh Khalsa', firozpur:'Sher Singh Ghubaya', bathinda:'Harsimrat Kaur Badal', sangrur:'Gurmeet Singh Meet Hayer', patiala:'Dharamvir Gandhi' };

// no | name | district | lok sabha | sitting MLA   (SC = reserved seats, listed in _AC_SC)
const _AC = `1|Sujanpur|pathankot|gurdaspur|Naresh Puri
2|Bhoa|pathankot|gurdaspur|Lal Chand Kataruchakk
3|Pathankot|pathankot|gurdaspur|Ashwani Kumar Sharma
4|Gurdaspur|gurdaspur|gurdaspur|Barindermeet Singh Pahra
5|Dina Nagar|gurdaspur|gurdaspur|Aruna Chaudhary
6|Qadian|gurdaspur|gurdaspur|Partap Singh Bajwa
7|Batala|gurdaspur|gurdaspur|Amansher Singh
8|Sri Hargobindpur|gurdaspur|hoshiarpur|Amarpal Singh
9|Fatehgarh Churian|gurdaspur|gurdaspur|Tripat Rajinder Singh Bajwa
10|Dera Baba Nanak|gurdaspur|gurdaspur|Gurdeep Singh Randhawa
11|Ajnala|amritsar|amritsar|Kuldeep Singh Dhaliwal
12|Raja Sansi|amritsar|amritsar|Sukhbinder Singh Sarkaria
13|Majitha|amritsar|amritsar|Ganieve Kaur Majithia
14|Jandiala|amritsar|khadoor-sahib|Harbhajan Singh ETO
15|Amritsar North|amritsar|amritsar|Kunwar Vijay Pratap Singh
16|Amritsar West|amritsar|amritsar|Jasbir Singh Sandhu
17|Amritsar Central|amritsar|amritsar|Ajay Gupta
18|Amritsar East|amritsar|amritsar|Jeevan Jyot Kaur
19|Amritsar South|amritsar|amritsar|Inderbir Singh Nijjar
20|Attari|amritsar|amritsar|Jaswinder Singh Ramdas
21|Tarn Taran|tarn-taran|khadoor-sahib|Harmeet Singh Sandhu
22|Khem Karan|tarn-taran|khadoor-sahib|Sarvan Singh Dhun
23|Patti|tarn-taran|khadoor-sahib|Laljit Singh Bhullar
24|Khadoor Sahib|tarn-taran|khadoor-sahib|Manjinder Singh Lalpura
25|Baba Bakala|amritsar|khadoor-sahib|Dalbir Singh Tong
26|Bholath|kapurthala|hoshiarpur|Sukhpal Singh Khaira
27|Kapurthala|kapurthala|khadoor-sahib|Rana Gurjeet Singh
28|Sultanpur Lodhi|kapurthala|khadoor-sahib|Rana Inder Pratap Singh
29|Phagwara|kapurthala|hoshiarpur|Balwinder Singh Dhaliwal
30|Phillaur|jalandhar|jalandhar|Vikramjit Singh Chaudhary
31|Nakodar|jalandhar|jalandhar|Inderjit Kaur Mann
32|Shahkot|jalandhar|jalandhar|Hardev Singh Laddi
33|Kartarpur|jalandhar|jalandhar|Balkar Singh
34|Jalandhar West|jalandhar|jalandhar|Mohinder Bhagat
35|Jalandhar Central|jalandhar|jalandhar|Raman Arora
36|Jalandhar North|jalandhar|jalandhar|Avtar Singh Junior
37|Jalandhar Cantt|jalandhar|jalandhar|Pargat Singh
38|Adampur|jalandhar|jalandhar|Sukhwinder Singh Kotli
39|Mukerian|hoshiarpur|hoshiarpur|Jangi Lal Mahajan
40|Dasuya|hoshiarpur|hoshiarpur|Karambir Singh Ghuman
41|Urmar|hoshiarpur|hoshiarpur|Jasvir Singh Raja Gill
42|Sham Chaurasi|hoshiarpur|hoshiarpur|Ravjot Singh
43|Hoshiarpur|hoshiarpur|hoshiarpur|Brahm Shankar Jimpa
44|Chabbewal|hoshiarpur|hoshiarpur|Ishank Kumar
45|Garhshankar|hoshiarpur|anandpur-sahib|Jai Krishan Singh
46|Banga|sbs-nagar|anandpur-sahib|Sukhwinder Kumar Sukhi
47|Nawan Shahr|sbs-nagar|anandpur-sahib|Nachhatar Pal
48|Balachaur|sbs-nagar|anandpur-sahib|Santosh Kataria
49|Anandpur Sahib|rupnagar|anandpur-sahib|Harjot Singh Bains
50|Rupnagar|rupnagar|anandpur-sahib|Dinesh Chadha
51|Chamkaur Sahib|rupnagar|anandpur-sahib|Dr. Charanjit Singh
52|Kharar|sas-nagar|anandpur-sahib|Anmol Gagan Maan
53|S.A.S. Nagar|sas-nagar|anandpur-sahib|Kulwant Singh
54|Bassi Pathana|fatehgarh-sahib|fatehgarh-sahib|Rupinder Singh
55|Fatehgarh Sahib|fatehgarh-sahib|fatehgarh-sahib|Lakhbir Singh Rai
56|Amloh|fatehgarh-sahib|fatehgarh-sahib|Gurinder Singh Garry
57|Khanna|ludhiana|fatehgarh-sahib|Tarunpreet Singh Sond
58|Samrala|ludhiana|fatehgarh-sahib|Jagtar Singh
59|Sahnewal|ludhiana|fatehgarh-sahib|Hardeep Singh Mundian
60|Ludhiana East|ludhiana|ludhiana|Daljit Singh Grewal
61|Ludhiana South|ludhiana|ludhiana|Rajinder Pal Kaur Chhina
62|Atam Nagar|ludhiana|ludhiana|Kulwant Singh Sidhu
63|Ludhiana Central|ludhiana|ludhiana|Ashok Prashar Pappi
64|Ludhiana West|ludhiana|ludhiana|Sanjeev Arora
65|Ludhiana North|ludhiana|ludhiana|Madan Lal Bagga
66|Gill|ludhiana|ludhiana|Jiwan Singh Sangowal
67|Payal|ludhiana|fatehgarh-sahib|Manwinder Singh
68|Dakha|ludhiana|ludhiana|Manpreet Singh Ayali
69|Raikot|ludhiana|fatehgarh-sahib|Hakam Singh Thekedar
70|Jagraon|ludhiana|ludhiana|Saravjit Kaur Manuke
71|Nihal Singhwala|moga|faridkot|Manjit Singh Bilaspur
72|Bhagha Purana|moga|faridkot|Amritpal Singh Sukhanand
73|Moga|moga|faridkot|Amandeep Kaur Arora
74|Dharamkot|moga|faridkot|Devinder Singh Laddi Dhos
75|Zira|ferozepur|khadoor-sahib|Naresh Kataria
76|Firozpur City|ferozepur|firozpur|Ranveer Singh Bhullar
77|Firozpur Rural|ferozepur|firozpur|Rajnish Dahiya
78|Guru Har Sahai|ferozepur|firozpur|Fauja Singh Sarari
79|Jalalabad|fazilka|firozpur|Jagdeep Kamboj Goldy
80|Fazilka|fazilka|firozpur|Narinderpal Singh Sawna
81|Abohar|fazilka|firozpur|Sandeep Jakhar
82|Balluana|fazilka|firozpur|Amandeep Singh Musafir
83|Lambi|sri-muktsar-sahib|bathinda|Gurmeet Singh Khudian
84|Gidderbaha|sri-muktsar-sahib|faridkot|Hardeep Singh Dimpy Dhillon
85|Malout|sri-muktsar-sahib|firozpur|Baljit Kaur
86|Muktsar|sri-muktsar-sahib|firozpur|Jagdeep Singh Brar
87|Faridkot|faridkot|faridkot|Gurdit Singh Sekhon
88|Kotkapura|faridkot|faridkot|Kultar Singh Sandhwan
89|Jaitu|faridkot|faridkot|Amolak Singh
90|Rampura Phul|bathinda|faridkot|Balkar Singh Sidhu
91|Bhucho Mandi|bathinda|bathinda|Master Jagsir Singh
92|Bathinda Urban|bathinda|bathinda|Jagroop Singh Gill
93|Bathinda Rural|bathinda|bathinda|Amit Rattan Kotfatta
94|Talwandi Sabo|bathinda|bathinda|Baljinder Kaur
95|Maur|bathinda|bathinda|Sukhvir Singh Maiserkhana
96|Mansa|mansa|bathinda|Vijay Singla
97|Sardulgarh|mansa|bathinda|Gurpreet Singh Banawali
98|Budhlada|mansa|bathinda|Budh Ram
99|Lehra|sangrur|sangrur|Barinder Kumar Goyal
100|Dirba|sangrur|sangrur|Harpal Singh Cheema
101|Sunam|sangrur|sangrur|Aman Arora
102|Bhadaur|barnala|sangrur|Labh Singh Ugoke
103|Barnala|barnala|sangrur|Kuldeep Singh Dhillon
104|Mehal Kalan|barnala|sangrur|Kulwant Singh Pandori
105|Malerkotla|malerkotla|sangrur|Mohammad Jamil Ur Rehman
106|Amargarh|malerkotla|fatehgarh-sahib|Jaswant Singh Gajjan Majra
107|Dhuri|sangrur|sangrur|Bhagwant Mann
108|Sangrur|sangrur|sangrur|Narinder Kaur Bharaj
109|Nabha|patiala|patiala|Gurdev Singh Dev Maan
110|Patiala Rural|patiala|patiala|Balbir Singh
111|Rajpura|patiala|patiala|Neena Mittal
112|Dera Bassi|sas-nagar|patiala|Kuljit Singh Randhawa
113|Ghanaur|patiala|patiala|Gurlal Ghanaur
114|Sanour|patiala|patiala|Harmit Singh Pathanmajra
115|Patiala|patiala|patiala|Ajit Pal Singh Kohli
116|Samana|patiala|patiala|Chetan Singh Jaura Majra
117|Shutrana|patiala|patiala|Kulwant Singh Bazigar`;
const _AC_SC = new Set([2,5,8,14,16,20,25,29,30,33,34,38,42,44,46,51,54,66,67,69,70,71,77,82,85,89,91,93,98,100,102,104,109,117]);
const ACS_SEED = _AC.split('\n').map(l => { const [no,name,district,ls,mla] = l.split('|');
  return { no:Number(no), name, district, ls, sc:_AC_SC.has(Number(no)), mla }; });

// Council -> constituency links that are unambiguous (matched by name). Anything missing is
// left unmapped and shown as such, for the State Administrator to complete.
const ULB_AC_DEFAULT = {
  amritsar:[15,16,17,18,19], jalandhar:[34,35,36,37], ludhiana:[60,61,62,63,64,65,66], patiala:[115], phagwara:[29], bathinda:[92],
  mohali:[53], abohar:[81], batala:[7], moga:[73], hoshiarpur:[43], kapurthala:[27], pathankot:[3], barnala:[103],
  ajnala:[11], majitha:[13], 'jandiala-guru':[14], bhadaur:[102], 'bhucho-mandi':[91], maur:[95], faridkot:[87], jaito:[89], kotkapura:[88],
  'bassi-pathana':[54], 'mandi-gobindgarh':[56], 'sirhind-fatehgarh-sahib':[55], fazilka:[80], jalalabad:[79], ferozepur:[76], zira:[75],
  'guru-har-sahai':[78], gurdaspur:[4], dinanagar:[5], qadian:[6], 'fatehgarh-churian':[9], 'sri-hargobindpur':[8], dasuya:[40], mukerian:[39],
  'garh-shankar':[45], 'urmar-tanda':[41], 'sham-churasi':[42], adampur:[38], kartarpur:[33], nakodar:[31], phillaur:[30], 'sultanpur-lodhi':[28],
  jagraon:[70], khanna:[57], payal:[67], raikot:[69], samrala:[58], malerkotla:[105], amargarh:[106], mansa:[96], budhlada:[98],
  'nihal-singh-wala':[71], sujanpur:[1], nabha:[109], patran:[117], rajpura:[111], samana:[116], 'anandpur-sahib':[49], rupnagar:[50],
  'sri-chamkaur-sahib':[51], kharar:[52], 'dera-bassi':[112], zirakpur:[112], lalru:[112], banga:[46], nawanshahr:[47], rahon:[47],
  gidderbaha:[84], malout:[85], 'sri-muktsar-sahib':[86], dhuri:[107], sunam:[101], sangrur:[108], lehragaga:[99], 'tarn-taran':[21],
  patti:[23], bhikhiwind:[22]
};

// ============================================================
// Tehsils (T) and sub-tehsils (ST), by district.   '!' = district assignment to be verified
// ============================================================
const _TEHSILS = `amritsar|T:Amritsar-1,Amritsar-2,Baba Bakala,Ajnala|ST:Majitha,Attari,Tarsikka,Ramdas,Lopoke
tarn-taran|T:Tarn Taran,Patti,Khadur Sahib|ST:Khemkaran,Bhikhiwind,Goindwal Sahib,Chohla Sahib,Jhabal
gurdaspur|T:Gurdaspur,Batala,Dera Baba Nanak|ST:Kahnuwan,Kalanaur,Dinanagar,Naushehra Majha Singh,Dhariwal,Sri Hargobindpur,Fatehgarh Churian,Qadian
pathankot|T:Pathankot,Dharkalan|ST:Narot Jaimal Singh,Bamyal
kapurthala|T:Kapurthala,Sultanpur Lodhi,Phagwara,Bholath|ST:Dhilwan
jalandhar|T:Jalandhar-1,Jalandhar-2,Phillaur,Nakodar,Shahkot|ST:Adampur,Kartarpur,Bhogpur,Nurmahal,Goraya,Mehatpur,Lohian
hoshiarpur|T:Hoshiarpur,Dasuya,Garhshankar,Mukerian|ST:Bhunga,Tanda,Garhdiwala,Mahilpur,Talwara
sbs-nagar|T:Nawanshahr,Balachaur|ST:Banga
rupnagar|T:Rupnagar,Chamkaur Sahib,Anandpur Sahib,Nangal|ST:Morinda,Nurpur Bedi
sas-nagar|T:Mohali,Dera Bassi,Kharar|ST:Majri!
fatehgarh-sahib|T:Fatehgarh Sahib,Bassi Pathana,Amloh,Khamanon|ST:Mandi Gobindgarh
ludhiana|T:Ludhiana East,Ludhiana West,Jagraon,Samrala,Khanna,Payal,Raikot|ST:Delhon,Kum Kalan,Mullapur Dhaka,Sidhwan Bet,Machhiwara,Malaud
moga|T:Moga,Nihal Singh Wala|ST:Dharamkot,Badhni Kalan,Bagha Purana
ferozepur|T:Ferozepur,Zira|ST:Mamdot,Talwandi Bhai,Makhu,Guru Har Sahai
fazilka|T:Fazilka,Abohar,Jalalabad|ST:Arniwala Sheikh Subhan,Khuian Sarwar,Sito Guno
sri-muktsar-sahib|T:Muktsar,Malout,Giddarbaha|ST:Lakhewali,Bariwala,Lambi,Doda
faridkot|T:Faridkot|ST:Kotkapura,Sadiq,Jaito
bathinda|T:Bathinda,Rampura Phul,Talwandi Sabo|ST:Nathana,Sangat,Bhagta Bhaika,Maur
mansa|T:Mansa,Budhlada,Sardulgarh|ST:Bhikhi,Bareta,Jhunir
sangrur|T:Sangrur,Sunam,Moonak,Dhuri,Lehra|ST:Bhawanigarh,Longowal,Dirba,Khanauri,Sherpur!
barnala|T:Barnala,Tapa|ST:Bhadaur,Dhanaula!
malerkotla|T:Malerkotla|ST:Ahmedgarh,Amargarh
patiala|T:Patiala,Rajpura,Nabha,Samana,Patran|ST:Ghanaur,Dudhan Sadhan,Bhadson!`;
const TEHSILS_SEED = [];
_TEHSILS.split('\n').forEach(line => { const [did, ...groups] = line.split('|');
  groups.forEach(g => { const kind = g.startsWith('T:') ? 'T' : 'ST'; g.slice(g.indexOf(':') + 1).split(',').forEach(n => {
    const verify = n.endsWith('!'); n = n.replace('!', '');
    TEHSILS_SEED.push({ id:'t-' + _slug(n), name:n, kind, district:did, verify }); }); }); });
const TEHSIL_KIND_LABEL = { T:'Tehsil', ST:'Sub-tehsil' };

// ============================================================
// Council of ministers (Mann ministry) as ministries.  A ministry outlives its holder:
// when a minister leaves the cabinet the State Administrator appoints another MLA to it.
// Portfolios per Wikipedia (Oct 2026) — verify against the official notification.
// depts = departments whose grievances this ministry oversees ('*' = every department).
// ============================================================
const MINISTRIES_SEED = [
  ['cm','Chief Minister','Chief Minister','General Administration; Home Affairs & Justice; Personnel and Training; Vigilance; Cooperation; Legal & Legislative Affairs; Civil Aviation; Science, Technology & Environment; Sports and Youth Services',['*'],107],
  ['finance','Finance','Minister','Finance; Planning; Excise & Taxation; Programme Implementation; Economic & Statistical Organisation',['finance','planning','excise'],100],
  ['grievances','Governance Reforms & Public Grievances','Minister','Governance Reforms and Public Grievances; Employment Generation and Training; New & Renewable Energy Sources; Printing & Stationery',['grievances','employment'],101],
  ['social-justice','Social Justice & Women and Child Development','Minister','Social Justice, Empowerment & Minorities; Social Security and Development of Women and Children',['social-justice'],85],
  ['health','Health & Family Welfare','Minister','Health and Family Welfare; Medical Education and Research; Elections',['health'],110],
  ['food-supplies','Food, Civil Supplies & Consumer Affairs','Minister','Food, Civil Supplies & Consumer Affairs; Forest and Wild Life Preservation',['food'],2],
  ['transport','Transport','Minister','Transport; Jails',['transport','jails'],23],
  ['education','School & Higher Education','Minister','School Education; Higher Education and Languages; Technical Education & Industrial Training; Information & Public Relations',[],49],
  ['power-pwd','Power & Public Works','Minister','Power; Public Works',['electricity','pwd'],14],
  ['agriculture','Agriculture & Animal Husbandry','Minister','Agriculture and Farmer Welfare; Animal Husbandry, Fisheries & Dairy Development; Food Processing',['animal','agriculture','fisheries-dairy','food-processing'],83],
  ['defence-welfare','Defence Services Welfare','Minister','Defence Services Welfare; Freedom Fighters; Horticulture',['defence-welfare','freedom-fighters','horticulture'],34],
  ['rural-development','Rural Development & Panchayats','Minister','Rural Development & Panchayats; Labour; Tourism & Cultural Affairs; Hospitality',['rural-dev','labour','tourism'],57],
  ['local-government','Local Government','Minister','Local Government; Parliamentary Affairs',['municipal','mc-office','fire'],42],
  ['water-resources','Water Resources','Minister','Water Resources; Mines & Geology; Conservation of Soil & Water',['irrigation','mining'],99],
  ['revenue-housing','Revenue, Housing & Water Supply','Minister','Revenue, Rehabilitation & Disaster Management; Housing and Urban Development; Water Supply & Sanitation',['water','revenue','housing'],59],
  ['industries','Industries & Commerce','Minister','Industries & Commerce; Investment Promotion; NRI Affairs',['industry','investment','nri'],64]
].map(([key,title,post,portfolio,depts,ac]) => ({ key, title, post, portfolio, depts, ac, isCM: key === 'cm' }));
