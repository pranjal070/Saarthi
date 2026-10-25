import re, glob

EMOJI_ICON = {'📊':'grid','📋':'list','✍️':'edit','🏘️':'map','🤝':'users','👤':'user','🏠':'home','↩':'logout',
              '🗂️':'folder','📈':'trend','👥':'users','🏢':'building','🏗️':'layers','🔑':'key','⚙️':'cog','📨':'inbox'}
KPI_ICON = {'🗂️':'folder','⏳':'clock','✅':'check','⚠️':'alert','📨':'inbox','↪️':'trend','🏘️':'map','📈':'trend',
            '⏱️':'clock','👥':'users','📋':'list','📊':'grid','🔔':'bell','📞':'phone','🛡️':'shield'}
GROUPS = {
 'citizen':   [('overview','Main'),('ward','Community'),('profile','Account')],
 'officer':   [('overview','Main'),('profile','Account')],
 'mc':        [('overview','Main'),('profile','Account')],
 'authority': [('overview','Overview'),('people','Directory & access'),('settings','System'),('profile','Account')],
}
BRAND = ('<div class="side-brand"><span class="sb-mark">ਸ</span>'
         '<div><b>SAARTHI</b><small>Govt. of Punjab</small></div></div>\n    ')

def mi(name): return f'<i class="mi mi-{name}"></i>'

for path in glob.glob('*.html'):
    h = open(path, encoding='utf8').read(); orig = h
    # 1. stylesheets
    if 'css/console.css' not in h:
        h = h.replace('<link rel="stylesheet" href="css/style.css">',
                      '<link rel="stylesheet" href="css/style.css">\n<link rel="stylesheet" href="css/icons.css">\n<link rel="stylesheet" href="css/console.css">')
    # 2. theme storage key bumped (ignores old saved choice) + default flipped to dark
    h = h.replace('saarthi_theme_v2', 'saarthi_theme_v3')
    h = re.sub(r'(saarthi_theme_v3["\']\)\s*\|\|\s*)(["\'])light\2', r'\1\2dark\2', h)
    # 3. theme toggle glyphs
    h = re.sub(r"themeBtn\.textContent\s*=\s*(\w+)\s*===\s*'dark'\s*\?\s*'☀️'\s*:\s*'🌙'",
               r"themeBtn.innerHTML = \1 === 'dark' ? '" + mi('sun') + "' : '" + mi('moon') + "'", h)
    h = re.sub(r'(id="themeBtn"[^>]*>)\s*🌙\s*(</button>)', r'\1' + mi('moon') + r'\2', h)
    # 4. topbar glyphs
    h = h.replace('🔔<span class="dot-badge"', mi('bell') + '<span class="dot-badge"')
    h = h.replace('🌐 <span id="langCur">', mi('globe') + ' <span id="langCur">')
    h = h.replace('<span class="ic">🔍</span>', '<span class="ic">' + mi('search') + '</span>')
    # 5. KPI icon tiles
    def kpi(m):
        return f'<div class="ic">{mi(KPI_ICON.get(m.group(1), "grid"))}</div>'
    h = re.sub(r'<div class="ic">([^<\s]+)</div>', kpi, h)
    # 6. sidebars (dashboards only)
    base = path.replace('.html', '')
    if base in GROUPS and '<aside class="side">' in h and 'side-brand' not in h:
        def side(m):
            block = m.group(0)
            for emo, ic in EMOJI_ICON.items():
                block = block.replace(f'>{emo} <span', f'>{mi(ic)}<span')
            block = block.replace('<aside class="side">\n    ', '<aside class="side">\n    ' + BRAND, 1)
            for sec, label in GROUPS[base]:
                if sec == 'profile':
                    pat = re.compile(r'(\n    )(<a data-sec="profile")')
                else:
                    pat = re.compile(r'(\n    )(<a[^>]*data-sec="%s")' % sec) if sec != 'overview' else re.compile(r'(\n    )(<a class="on" data-sec="overview")')
                block = pat.sub(r'\1<div class="side-label">%s</div>\1\2' % label, block, count=1)
            return block
        h = re.sub(r'<aside class="side">.*?</aside>', side, h, flags=re.S)
    # 7. hard-coded white strips on public pages
    h = h.replace('style="background:#fff;', 'style="background:var(--card);')
    if h != orig: open(path, 'w', encoding='utf8').write(h); print('updated', path)
