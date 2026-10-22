import json, re, collections
raw=json.load(open('off_ru_raw.json',encoding='utf-8'))
def num(x):
    try:
        v=float(x); return v if v==v else None
    except: return None
stats=collections.Counter(); out={}
for r in raw:
    stats['all']+=1
    tag='en:russia' in r['countries_tags']; stats['tag_ru' if tag else 'code46_only']+=1
    name=re.sub(r'\s+',' ',r['product_name']).strip()
    if not name: stats['no_name']+=1; continue
    k=num(r['energy-kcal_100g'])
    if k is None:
        kj=num(r['energy_100g']); k=kj/4.184 if kj else None
    p,f,c=num(r['proteins_100g']),num(r['fat_100g']),num(r['carbohydrates_100g'])
    if k is None or p is None or f is None or c is None: stats['no_kbzhu']+=1; continue
    if not (0<=k<=900 and 0<=p<=100 and 0<=f<=100 and 0<=c<=100 and p+f+c<=105): stats['implausible_range']+=1; continue
    calc=4*p+4*c+9*f
    # проверка по коэффициентам ТР ТС 022/2011: расхождение больше 25 % и больше 30 ккал = брак
    if abs(calc-k)>max(30,0.25*max(k,calc)): stats['atwater_fail']+=1; continue
    code=r['code'].strip()
    if not re.fullmatch(r'\d{8,14}',code): stats['bad_code']+=1; continue
    brand=r['brands'].split(',')[0].strip()
    rec={'b':code,'n':name,'br':brand,'kcal':round(k),'p':round(p,1),'f':round(f,1),'c':round(c,1)}
    q=num(r['product_quantity'])
    if q and 0<q<=5000: rec['q']=round(q)
    if code in out: stats['dup']+=1
    out[code]=rec; stats['ok_tag' if tag else 'ok_46']+=1
res=list(out.values())
json.dump(res,open('off_ru.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(dict(stats)); print('итого',len(res))
import os; print('размер',os.path.getsize('off_ru.json')//1024,'КБ')
