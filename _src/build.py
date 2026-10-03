import re,glob,os,shutil
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
def icon(name):
    s=open(f'{HERE}/icons/{name}.svg',encoding='utf-8').read()
    s=re.sub(r'\s+',' ',s).replace('> <','><').strip()
    s=re.sub(r' class="[^"]*"','',s); s=re.sub(r' width="24" height="24"','',s)
    return s
NAV=[('dom','home','Дом','dom.html'),('tren','barbell','Тренировки','tren.html'),('pit','tools-kitchen-2','Питание','pit.html'),('prog','chart-line','Прогресс','prog.html'),('otchet','clipboard-check','Отчёт','otchet.html')]
def nav(active):
    out=['<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#F2652A"/><stop offset="1" stop-color="#F6B343"/></linearGradient></defs></svg>','<nav class="nav">']
    for key,ic,label,href in NAV:
        cls=' class="on"' if key==active else ''
        out.append(f'<a{cls} href="{href}">{icon(ic)}{label}</a>')
    out.append('</nav>'); return ''.join(out)
HEAD='<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0E0F1A"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"><link rel="stylesheet" href="app.css"><script src="phases.js"></script><script src="data.js"></script><script src="ui.js"></script>'
for f in ['data.js','ui.js','phases.js']: shutil.copy(f'{HERE}/{f}',f'{ROOT}/{f}')
for tpl in sorted(glob.glob(f'{HERE}/*.tpl.html')):
    name=os.path.basename(tpl).replace('.tpl.html','')
    html=open(tpl,encoding='utf-8').read()
    html=re.sub(r'\{\{nav:([a-z]+)\}\}',lambda m:nav(m.group(1)),html)
    html=re.sub(r'\{\{([a-z0-9-]+)\}\}',lambda m:icon(m.group(1)),html)
    assert '{{' not in html, name
    m=re.search(r'<title>.*?</title>',html); title=m.group(0); html=html.replace(title,'',1)
    open(f'{ROOT}/{name}.html','w',encoding='utf-8').write(HEAD+title+'</head><body>'+html+'</body></html>')
    print('built',name)
