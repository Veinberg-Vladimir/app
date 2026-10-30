# Партия 2 (30.10): нежирные блюда из рецептов для похудения, 200 штук к первой сотне и 30 образцам.
# Блюда лежат в pp/*.py: в каждом файле список D, формат как в dishes_batch1.py плюс src (страница, откуда идея) и idea (что взято).
# Потолок жира на порцию (его «да» 30.10): завтрак 12 г, обед 15, ужин 15, перекус 7. Белок: основной приём от 25 г, перекус от 12 г.
# Проверка одного файла без записи: python3 dishes_batch2.py ../../data/food-core.json - pp/zavtraki.py
# Сборка всей партии:            python3 dishes_batch2.py ../../data/food-core.json ../../data/dishes-batch2.json pp/*.py
import json, sys, re, os, runpy
CORE = {x['n']: x for x in json.load(open(sys.argv[1], encoding='utf-8'))}
OUT = sys.argv[2]
W = 'Вода'
DOST = 'как из доставки'
CEIL = {'завтрак': 12, 'обед': 15, 'ужин': 15, 'перекус': 7}
FLOOR = {'завтрак': 25, 'обед': 25, 'ужин': 25, 'перекус': 12}
KCAL = {'завтрак': (300, 560), 'обед': (380, 650), 'ужин': (300, 600), 'перекус': (120, 330)}
# шесть правил облегчения: этих продуктов в новых блюдах нет совсем
BANNED = {'Творог 5 %', 'Творог 9 %', 'Сметана 15 %', 'Сметана 20 %', 'Сыр российский', 'Молоко 2,5 %', 'Молоко 3,2 %',
          'Масло сливочное 82,5 %', 'Масло сливочное 72,5 %', 'Масло сливочное 81 %', 'Масло топлёное', 'Майонез 67 %',
          'Сливки 20 %', 'Сливки 33 %', 'Фарш говяжий 10 % жира, сырой', 'Фарш говяжий 15 % жира, сырой', 'Фарш свиной, сырой'}
WHOLE_EGG = {'Яйцо куриное сырое', 'Яйцо куриное варёное', 'Яйцо пашот', 'Яйцо куриное жареное'}
OIL = re.compile(r'^Масло (подсолнечное|оливковое|рапсовое|кунжутное|кукурузное|льняное|сливочное облегчённое)')
MEAT = re.compile(r'(говядин|говяж|свин|баранин|бараний|телятин|теляч|кури|цыпл|индейк|утк|утин|фарш|бекон|ветчин|колбас|сосиск|сардельк|пельмен|ростбиф|пастром|пепперони|салями|печень\b|кролик|минтай|горбуш|тунец|рыб|сельд|креветк|треск|хек|сёмг|форел|скумбри|кальмар|краб|кет[аы]\b|пикш|тилапи|судак|шпрот|сардин|анчоус|икра|мидии)', re.I)
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', '..', 'data')
norm = lambda s: re.sub(r'[^а-яёa-z0-9]', '', s.lower())
taken = {}
for fn in ('dishes-sample.json', 'dishes-batch1.json'):
    p = os.path.join(DATA, fn)
    if os.path.exists(p):
        for x in json.load(open(p, encoding='utf-8')): taken[norm(x['n'])] = fn
out, errs, warns = [], [], []
for mod in sys.argv[3:]:
    D = runpy.run_path(mod, init_globals={'W': W, 'DOST': DOST})['D']
    for x in D:
        nm, m = x.get('n', '?'), x.get('m')
        bad = lambda s: errs.append(f'{os.path.basename(mod)} · {nm}: {s}')
        for k in ('n', 'm', 't', 'out', 'd', 'i', 's', 'tip', 'src', 'idea'):
            if k not in x: bad(f'нет поля {k}')
        if m not in CEIL: bad(f'приём «{m}»'); continue
        if not str(x.get('src', '')).startswith('http'): bad('src не ссылка')
        key = norm(nm)
        if key in taken: bad(f'название уже есть: {taken[key]}')
        taken[key] = os.path.basename(mod)
        tot = dict(kcal=0.0, p=0.0, f=0.0, c=0.0); ings = []; egg = oil = 0
        for name, g in x['i']:
            if name == W: ings.append({'n': 'Вода', 'g': g}); continue
            c = CORE.get(name)
            if not c: bad(f'нет в базе «{name}»'); continue
            if name in BANNED: bad(f'запрещён «{name}»')
            if name in WHOLE_EGG: egg += g
            if OIL.search(name): oil += g
            for k in tot: tot[k] += c[k] * g / 100
            ings.append({'n': name, 'g': g})
        if egg > 60: bad(f'целых яиц {egg} г, можно одно (до 60 г), остальное белками')
        if oil > 5: bad(f'масла {oil} г, можно до 5')
        k = round(tot['kcal']); P, F, C = round(tot['p'], 1), round(tot['f'], 1), round(tot['c'], 1)
        if F > CEIL[m]: bad(f'жир {F} г, потолок {CEIL[m]}')
        if P < FLOOR[m]: bad(f'белок {P} г, нужно от {FLOOR[m]}')
        lo, hi = KCAL[m]
        if not lo <= k <= hi: warns.append(f'{nm}: {k} ккал, обычно {lo}-{hi}')
        for s in [x.get('d', ''), x.get('tip', '')] + list(x.get('s', [])):
            if '—' in s or '–' in s: bad('длинное тире в тексте')
            if s.rstrip().endswith('.'): bad(f'точка в конце: «{s[-30:]}»')
        tags = list(x.get('tag', []))
        if P >= 25: tags.append('белковое')
        if x.get('t', 99) <= 15: tags.append('быстро')
        if len([1 for n, g in x['i'] if n != W]) <= 4: tags.append('мало ингредиентов')
        if not any(MEAT.search(n) and not n.startswith('Яйцо') for n, g in x['i']): tags.append('без мяса и рыбы')
        rec = dict(n=nm, meal=m, d=x['d'], time=x['t'], out=x['out'], kcal=k, p=P, f=F, c=C,
                   k100=round(k / x['out'] * 100), ing=ings, steps=x['s'], tip=x['tip'], tags=tags, src=x['src'], idea=x['idea'])
        if 'batch' in x: rec['batch'] = x['batch']
        if 'plus' in x:
            pn, pg = x['plus']; pc = CORE.get(pn)
            if not pc: bad('plus: нет в базе ' + pn)
            else: rec['plus'] = f"+{pg} г «{pn}»: +{round(pc['p']*pg/100)} г белка, +{round(pc['kcal']*pg/100)} ккал"
        out.append(rec)
for r in out:
    print(f"{r['meal']:8} {r['kcal']:4} ккал Б{r['p']:5} Ж{r['f']:5}/{CEIL[r['meal']]} У{r['c']:5} | {r['n']} | {', '.join(r['tags'])}")
cnt = {m: sum(r['meal'] == m for r in out) for m in CEIL}
print('блюд:', len(out), cnt)
for w in warns: print('ВНИМАНИЕ', w)
if errs:
    print(f'ОШИБОК {len(errs)}:'); [print('  ' + e) for e in errs]; sys.exit(1)
if OUT != '-':
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('записано', OUT)
