import gzip, json, time
t=time.time()
f=gzip.open('off.csv.gz','rt',encoding='utf-8',errors='replace',newline='')
h=f.readline().rstrip('\n').split('\t'); ix={k:i for i,k in enumerate(h)}
need=['code','product_name','brands','countries_tags','quantity','product_quantity','energy-kcal_100g','energy_100g','proteins_100g','fat_100g','carbohydrates_100g','last_modified_t','categories_tags']
out=[];n=0;ru=0;bad=0
for line in f:
    n+=1
    row=line.rstrip('\n').replace('\x00','').split('\t')
    if len(row)!=len(h): bad+=1; continue
    code=row[ix['code']]; ct=row[ix['countries_tags']]
    if 'en:russia' not in ct and not code.startswith('46'): continue
    ru+=1
    out.append({k:row[ix[k]] for k in need})
print('rows',n,'bad',bad,'ru-ish',ru,round(time.time()-t),'s')
json.dump(out,open('off_ru_raw.json','w',encoding='utf-8'),ensure_ascii=False)
