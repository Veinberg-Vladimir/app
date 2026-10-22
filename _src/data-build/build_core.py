import json, glob, re, os, sys
sr={f['id']:f for f in json.load(open('sr_all.json',encoding='utf-8'))}
core=[];seen=set();probs=[]
for x in json.load(open('ru_generics.json',encoding='utf-8')):
    key=x['ru'].lower().replace('ё','е')
    if key in seen: probs.append(('дубль ru',x['ru'])); continue
    seen.add(key)
    core.append({'n':x['ru'],'al':x['al'],'kcal':x['kcal'],'p':x['p'],'f':x['f'],'c':x['c'],'s':x['src']})
for fn in sorted(glob.glob('out_G*.json')):
    for x in json.load(open(fn,encoding='utf-8')):
        f=sr.get(str(x['id']))
        if not f: probs.append(('нет id',fn,x)); continue
        n=re.sub(r'\s+',' ',x['ru']).strip().rstrip('.')
        key=n.lower().replace('ё','е')
        if key in seen: probs.append(('совпало с российским, взят российский',n)); continue
        seen.add(key)
        if any(f.get(k) is None for k in ('kcal','p','f','c')): probs.append(('нет цифр',fn,n)); continue
        core.append({'n':n,'al':[a for a in x.get('al',[]) if a][:4],'kcal':round(f['kcal']),'p':round(f['p'],1),'f':round(f['f'],1),'c':round(f['c'],1),'s':'usda:'+f['id']})
json.dump(core,open('food-core.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('ядро',len(core),'проблем',len(probs)); [print(' ',p) for p in probs[:20]]
print('размер',os.path.getsize('food-core.json')//1024,'КБ')
