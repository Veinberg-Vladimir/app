import csv, json, collections
d='sr/FoodData_Central_sr_legacy_food_csv_2018-04/'
cats={r['id']:r['description'] for r in csv.DictReader(open(d+'food_category.csv',encoding='utf-8'))}
foods={}
for r in csv.DictReader(open(d+'food.csv',encoding='utf-8')):
    foods[r['fdc_id']]={'id':r['fdc_id'],'en':r['description'],'cat':cats.get(r['food_category_id'],'?')}
want={'1008':'kcal','1003':'p','1004':'f','1005':'c','1079':'fib'}
for r in csv.DictReader(open(d+'food_nutrient.csv',encoding='utf-8')):
    k=want.get(r['nutrient_id'])
    if k and r['fdc_id'] in foods:
        try: foods[r['fdc_id']][k]=float(r['amount'])
        except: pass
out=[f for f in foods.values() if 'kcal' in f]
json.dump(out,open('sr_all.json','w',encoding='utf-8'),ensure_ascii=False)
c=collections.Counter(f['cat'] for f in out)
print(len(foods),'foods,',len(out),'with kcal')
for k,v in c.most_common(): print(v,k)
