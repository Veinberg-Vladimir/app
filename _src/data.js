/* Демо-данные тестового клиента: 7 недель ведения (Фаза 11 целиком + Фаза 12 до сегодня). Всё считается детерминированно. */
(function(){
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=mulberry32(20261003);
const rnd=(a,b)=>a+(b-a)*R();
const TODAY='2026-10-03';
const d=s=>new Date(s+'T12:00:00');
const iso=dt=>{const x=new Date(dt.getTime()-dt.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)};
const addDays=(dt,n)=>{const x=new Date(dt);x.setDate(x.getDate()+n);return x};
const RU_M=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const RU_MF=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const RU_D=['вс','пн','вт','ср','чт','пт','сб'];
const RU_DF=['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
const fmtD=(s,full)=>{const x=typeof s==='string'?d(s):s;return full?`${RU_DF[x.getDay()]}, ${x.getDate()} ${RU_MF[x.getMonth()]}`:`${x.getDate()} ${RU_M[x.getMonth()]}`};
const fmtDD=s=>{const x=d(s);return `${RU_D[x.getDay()]} ${x.getDate()} ${RU_M[x.getMonth()]}`};
const round=(v,step)=>Math.round(v/step)*step;
const e1rm=(kg,reps)=>kg*(1+reps/30);
const pl=(n,one,few,many)=>{const a=Math.abs(n)%100,b=a%10;const w=(a>10&&a<20)?many:(b>1&&b<5)?few:(b===1)?one:many;return n+' '+w};
const R2=mulberry32(7);const rnd2=(a,b)=>a+(b-a)*R2();
function navyFat(waist,neck,height){return 495/(1.0324-0.19077*Math.log10(waist-neck)+0.15456*Math.log10(height))-450}

const C={name:'Андрей',initial:'А',height:182,age:34,start:'2026-08-17',today:TODAY,goal:'минус 10 кг к Новому году',startWeight:96.4,stepsGoal:10000,sleepGoal:7.5,vip:false,tariff:'ведение'};
/* ритм отчёта: ведение раз в две недели (решение 28.10), VIP каждую неделю; в демо тариф переключается в Отчёте */
try{const v=localStorage.getItem('app:demo:vip');if(v!=null)C.vip=JSON.parse(v)}catch(e){}
C.tariff=C.vip?'VIP':'ведение';const EVERY=C.vip?7:14,PLAN_TR=3*EVERY/7;
const PH=window.PHASES;
const PHASE_LIST=['Пост-утомление','Интенсификация 4 + 1','Фаза 3','ЕВП','Пирамида 12-10-8-8','Интенсивность 6-8','Ноги + спина, аккомодация 8-10','3 раза в неделю','Аккомодация, повторы с паузой','Интенсивность 4 × 6, темп 5010','Аккумуляция 12-10-8-8','Интенсификация, контроль эксцентрика'];

/* расписание тренировок */
const SCHED=[];
const p11start=d('2026-08-17');
for(let w=1;w<=4;w++)[0,2,4].forEach((off,i)=>SCHED.push({date:iso(addDays(p11start,(w-1)*7+off)),phase:'11',week:w,day:i+1}));
const p12start=d('2026-09-14');
for(let w=1;w<=2;w++)[0,2,4].forEach((off,i)=>SCHED.push({date:iso(addDays(p12start,(w-1)*7+off)),phase:'12',week:w,day:i+1}));
SCHED.push({date:'2026-10-01',phase:'12',week:3,day:1});
SCHED.push({date:'2026-10-03',phase:'12',week:3,day:2,today:true});
SCHED.push({date:'2026-10-05',phase:'12',week:3,day:3,plan:true});
[['2026-10-07',1],['2026-10-09',2],['2026-10-11',3]].forEach(([dt,dy])=>SCHED.push({date:dt,phase:'12',week:4,day:dy,plan:true}));

/* базовые веса, если в таблице пусто */
function baseFor(e){if(e.base)return e.base;const n=e.name.toLowerCase();
  if(/пресс/.test(n))return 25;if(/трицепс|французск/.test(n))return 30;if(/бицепс/.test(n))return 40;if(/махи|пек дек|обратные|разведения/.test(n))return 12;if(/пулловер/.test(n))return 35;if(/жим штанги|армейск/.test(n))return 60;return 40}
function stepFor(kg){return kg>=20?2.5:1}
function parseReps(r,w){r=String(r);if(r.includes(','))return r.split(',').map(Number);
  if(r.includes('-')){const [a,b]=r.split('-').map(Number);return {lo:a,hi:b}}
  if(/макс/.test(r))return 10;const n=parseInt(r);return isNaN(n)?10:n}
/* генерация подходов: у каждого упражнения своя кривая силы (расчётный максимум растёт на 6-14 % за 7 недель),
   веса подходов выводятся из неё по правилам Владимира: лесенка для фиксированных повторений, постоянный вес для диапазона */
const CURVE={};
const normKey=n=>n.toLowerCase().replace(/\s*\(.*?\)\s*/g,' ').replace(/[*,]/g,' ').replace(/\s+/g,' ').trim();
function curve(e){const k=normKey(e.name);if(!CURVE[k]){let B=0;Object.values(PH).forEach(p=>p.days.forEach(dd=>dd.ex.forEach(x=>{if(normKey(x.name)===k)B=Math.max(B,baseFor(x))})));const g=rnd(0.06,0.14);CURVE[k]={E0:B*1.02/(1+g),g}}return CURVE[k]}
const T0=d('2026-08-17').getTime(),T1=d('2026-10-03').getTime();
function genSets(phaseKey,week,e,dateStr){
  const wk=e.weeks[week-1];const n=wk.sets;const rp=parseReps(wk.reps,week);const cv=curve(e);const t=(d(dateStr).getTime()-T0)/(T1-T0);const E=cv.E0*(1+cv.g*t);const out=[];
  const kgFor=(reps,k)=>round(E/(1+reps/30)*0.88*k,stepFor(E));
  if(Array.isArray(rp)){for(let i=0;i<n;i++)out.push({kg:kgFor(rp[i]||8,1),reps:rp[i]||8})}
  else if(typeof rp==='number'){const M=kgFor(rp,1.08);for(let i=0;i<n;i++){let kg=M+0.05*M*((i+1-n)+(week-3));kg=round(Math.max(0.8*M,kg),stepFor(M));let reps=rp;if(week===4&&i===n-1&&R()<0.35)reps=rp-1;out.push({kg,reps})}}
  else{const Ew=cv.E0*(1+cv.g*((d(dateStr).getTime()-7*86400000*(week-1)-T0)/(T1-T0)));const kg=round(Ew/(1+rp.lo/30)*0.88,stepFor(Ew));for(let i=0;i<n;i++){let reps=Math.round(rp.lo+(rp.hi-rp.lo)*(week-1)/3);if(i===n-1&&R()<0.3)reps=Math.max(rp.lo,reps-1);out.push({kg,reps})}}
  return out;
}
const WORKOUTS=SCHED.map(s=>{const ph=PH[s.phase];const day=ph.days[s.day-1];
  const ex=day.ex.map((e,idx)=>{const wk=e.weeks[s.week-1];const sets=(s.plan||s.today)?[]:genSets(s.phase,s.week,e,s.date);const sup=/^[A-Z]\d$/.test(e.code)?e.code[0]:null;const first=sup&&e.code.endsWith('1');
    const rest=sup?(first?60:150):idx<2?150:idx<4?90:75;
    return {code:e.code,name:e.name,sets,target:{sets:wk.sets,reps:wk.reps,tempo:wk.tempo,rir:wk.rir,rest},sup}});
  const ton=ex.reduce((a,e)=>a+e.sets.reduce((b,x)=>b+x.kg*x.reps,0),0);
  const mins=(s.plan||s.today)?0:Math.round(rnd(52,71));
  return Object.assign({},s,{title:day.title.replace(/\//g,' / ').replace(/Ср дельта/,'Средняя дельта').replace(/Задн дельта/,'Задняя дельта'),phaseName:ph.name,ex,ton,mins,done:!(s.plan||s.today),rating:(s.plan||s.today)?null:Math.round(rnd(6,9.4))})});

/* дни: вес, сон, шаги, БАДы, еда */
const NORMS=[{from:'2026-08-17',kcal:2550,p:185,f:75,c:280,why:'стартовая норма по анкете'},{from:'2026-09-14',kcal:2350,p:180,f:70,c:250,why:'корректировка после отчёта 13.09: вес стоял две недели'}];
const normAt=s=>{let n=NORMS[0];NORMS.forEach(x=>{if(x.from<=s)n=x});return n};
const SUPPS=[{id:'creatine',name:'Креатин',dose:'5 г',when:'после тренировки или с едой'},{id:'protein',name:'Протеин',dose:'30 г',when:'когда не добираешь белок'},{id:'omega',name:'Омега-3',dose:'2 капсулы',when:'с едой'}];
const DAYS=[];
let dt=d(C.start);const end=d(TODAY);let i=0;
while(dt<=end){const s=iso(dt);const t=i/47;
  let trend=96.4-4.6*t;if(i>=21&&i<35)trend+=0.35*Math.sin((i-21)/14*Math.PI);/* плато на 4-5 неделе */
  const weight=+(trend+rnd(-0.35,0.35)).toFixed(1);
  const tr=WORKOUTS.find(w=>w.date===s&&w.done);
  const norm=normAt(s);
  const over=R()<0.12;const kcal=Math.round(norm.kcal+(over?rnd(300,650):rnd(-220,120)));
  const p=Math.round(norm.p+rnd(-30,10));const f=Math.round(norm.f+rnd(-10,18));const c=Math.max(120,Math.round((kcal-p*4-f*9)/4));
  const today=s===TODAY;
  DAYS.push({date:s,weight,sleep:+rnd(6.1,8.3).toFixed(1),steps:Math.round(rnd(5200,12800)/100)*100,energy:Math.round(rnd2(3,5.49)),stress:Math.round(rnd2(1,4.49)),supps:SUPPS.map(()=>R()<0.86),food:today?{kcal:1420,p:112,f:48,c:130,meals:[{name:'Завтрак',kcal:520,items:'Овсянка 80 г, 3 яйца, банан'},{name:'Обед',kcal:640,items:'Гречка 100 г, куриная грудка 200 г, салат'},{name:'Перекус',kcal:260,items:'Творог 5% 200 г'}]}:{kcal,p,f,c},training:tr?tr.date:null});
  dt=addDays(dt,1);i++}
if(DAYS.length){const t=DAYS[DAYS.length-1];t.sleep=7.5;t.steps=6240;t.supps=[true,true,false];t.energy=null;t.stress=null}

/* отчёты по воскресеньям */
const REPORTS=[];
const sundays=['2026-08-23','2026-08-30','2026-09-06','2026-09-13','2026-09-20','2026-09-27'];
const measAt=(k)=>({waist:+(102-6*k).toFixed(1),hips:+(106-4*k).toFixed(1),neck:+(41-0.5*k).toFixed(1),chest:+(108-2*k).toFixed(1),thighR:+(62-2*k).toFixed(1),thighL:+(61.5-2*k).toFixed(1),bicepsR:+(37+0.5*k).toFixed(1),bicepsL:+(36.5+0.5*k).toFixed(1)});
const START_MEAS=Object.assign({date:C.start},measAt(0));
const COMMENTS=['Старт хороший, вес пошёл. Норму не трогаем, шаги держи от 8 000','Темп в норме. На тренировках добавляй по плану, не торопись','Вес встал первую неделю, это вода и соль, ждём ещё неделю','Две недели без сдвига: режу калории на 200, углеводы вечером убираем','Пошло. Сон коротковат, 6 с половиной мало для восстановления','Отличная неделя. Фаза 12 тяжёлая, следи за техникой в тягах'];
const COMMENTS2={1:'Старт хороший, вес пошёл. На тренировках добавляй по плану, не торопись',3:'Вторая неделя почти без сдвига: режу калории на 200, углеводы вечером убираем',5:'После правки нормы пошло. Фаза 12 тяжёлая, следи за техникой в тягах'};
/* ведение: отчёт через воскресенье (30 авг, 13 сен, 27 сен), VIP каждое. Вес сравнивается средним за 7 дней с прошлым отчётом */
sundays.forEach((s,k)=>{if(EVERY===14&&k%2===0)return;const idx=DAYS.findIndex(x=>x.date===s);const per=DAYS.slice(Math.max(0,idx-EVERY+1),idx+1);const wk=DAYS.slice(Math.max(0,idx-6),idx+1);const prev=idx-EVERY>=0?DAYS.slice(Math.max(0,idx-EVERY-6),idx-EVERY+1):[];
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const trs=WORKOUTS.filter(w=>w.done&&w.date>=per[0].date&&w.date<=s);
  REPORTS.push({date:s,n:REPORTS.length+1,days:EVERY,plan:PLAN_TR,weightWas:+avg(prev.length?prev.map(x=>x.weight):[C.startWeight]).toFixed(1),weightNow:+avg(wk.map(x=>x.weight)).toFixed(1),sleep:+avg(per.map(x=>x.sleep)).toFixed(1),energy:+avg(per.filter(x=>x.energy).map(x=>x.energy)).toFixed(1),stress:+avg(per.filter(x=>x.stress).map(x=>x.stress)).toFixed(1),training:trs.length?Math.round(avg(trs.map(t=>t.rating))):0,trainings:trs.length,appetite:['обычное','обычное','повышенное','обычное','повышенное','слабое'][k],adherence:[92,88,85,78,90,95][k],steps:Math.round(avg(per.map(x=>x.steps))),food:{kcal:Math.round(avg(per.map(x=>x.food.kcal))),p:Math.round(avg(per.map(x=>x.food.p))),f:Math.round(avg(per.map(x=>x.food.f))),c:Math.round(avg(per.map(x=>x.food.c)))},meas:Object.assign({date:s},measAt((k+1)/6)),videos:trs.length*2,comment:EVERY===14?COMMENTS2[k]:COMMENTS[k],hard:['Тянет на сладкое после ужина','Мало сплю из-за работы','Пропустил одну тренировку, командировка','Срыв в субботу на дне рождения','Всё по плану','Устаю к концу недели'][k]})});
const MEASURES=[START_MEAS].concat(REPORTS.map(r=>r.meas));
const LAST_REP=REPORTS[REPORTS.length-1];const NEXT_REPORT=iso(addDays(d(LAST_REP.date),EVERY));const PERIOD_WORD=EVERY===14?'2 недели':'неделю';
/* разбор по пунктам (демо-тексты) */
REPORTS.forEach((r,k)=>{const d=+(r.weightNow-r.weightWas).toFixed(1);const n=normAt(r.date);const k2=EVERY/7;
  r.review=[['Вес и замеры',`${r.weightWas} → ${r.weightNow} кг, ${d>0?'+':''}${d} за ${PERIOD_WORD}. Талия ${r.meas.waist} см. ${d<=-0.5*k2?'Темп по плану':d<=-0.2*k2?'Темп медленнее плана, смотрим питание':'Вес стоит, смотрим соблюдение и соль'}`],
  ['Питание и голод',`Среднее ${r.food.kcal.toLocaleString('ru')} ккал при норме ${n.kcal.toLocaleString('ru')}, белок ${r.food.p} г. Соблюдение ${r.adherence} %. Голод ${r.appetite}`],
  ['Сон и стресс',`Сон ${r.sleep} ч, стресс ${r.stress} из 5, энергия ${r.energy} из 5${r.sleep<7?'. Сна мало, это тормозит и вес, и силу':''}`],
  ['Тренировки',`${r.trainings} из ${r.plan}, силовые ${r.training}/10, шаги ${r.steps.toLocaleString('ru')} в день`],
  ['Решение на '+PERIOD_WORD,r.comment]]});

/* библиотека знаний */
const LESSONS=[
 {cat:'Как вести приложение',items:[{t:'Как читать программу: подходы, повторения, темп, RIR',min:6,new:true},{t:'Как записывать подходы и что такое «прошлый раз»',min:4},{t:'Отчёт: что и когда заполнять',min:5},{t:'Фото прогресса: свет, ракурс, время',min:3}]},
 {cat:'Питание',items:[{t:'Твоя норма КБЖУ: откуда цифры',min:8},{t:'Как считать еду без весов и срывов',min:9},{t:'Что на что менять: замены продуктов',min:7},{t:'Почему вес встал и что делать',min:10,new:true}]},
 {cat:'Тренировки',items:[{t:'Темп 3010 и контроль эксцентрика',min:5},{t:'Запас повторений: как чувствовать RIR 2',min:6},{t:'Разминка перед рабочими подходами',min:4},{t:'Замена упражнения: когда можно',min:3}]},
 {cat:'Режим и восстановление',items:[{t:'Сон и похудение: 7 часов минимум',min:6},{t:'Шаги: зачем 10 000 и как добирать',min:4}]},
 {cat:'БАДы',items:[{t:'Креатин, протеин, омега-3: что и когда',min:7}]}];

/* сводки */
const sum=a=>a.reduce((x,y)=>x+y,0);
const doneW=WORKOUTS.filter(w=>w.done);
function weekOf(s){const x=d(s);const day=(x.getDay()+6)%7;return iso(addDays(x,-day))}
function tonnage(from,to){return sum(doneW.filter(w=>w.date>=from&&w.date<=to).map(w=>w.ton))}
function exHistory(name){const key=normKey(name);
  return doneW.map(w=>{const e=w.ex.find(x=>normKey(x.name)===key);return e?{date:w.date,phase:w.phase,week:w.week,sets:e.sets,best:Math.max(...e.sets.map(s=>s.kg)),vol:sum(e.sets.map(s=>s.kg*s.reps)),e1:Math.max(...e.sets.map(s=>e1rm(s.kg,s.reps)))}:null}).filter(Boolean)}
const EX_ALL=(()=>{const m=new Map();doneW.forEach(w=>w.ex.forEach(e=>{const k=normKey(e.name);if(!m.has(k))m.set(k,{name:e.name,code:e.code,muscle:muscleOf(e.name)})}));WORKOUTS.filter(w=>!w.done).forEach(w=>w.ex.forEach(e=>{if(!m.has(normKey(e.name)))m.set(normKey(e.name),{name:e.name,code:e.code,muscle:muscleOf(e.name)})}));return [...m.values()]})();
function muscleOf(n){n=n.toLowerCase();if(/жим лежа|наклонн|сведения|грудн|пулловер/.test(n))return 'Грудь';if(/жим штанги|армейск|жим гантелей сидя/.test(n))return 'Дельты';if(/тяга|подтяг/.test(n))return 'Спина';if(/махи|армейск|пек дек|обратные|дельт/.test(n))return 'Дельты';if(/бицепс/.test(n))return 'Бицепс';if(/трицепс|французск/.test(n))return 'Трицепс';if(/присед|румынск|маятник|ног|выпад/.test(n))return 'Ноги';if(/пресс/.test(n))return 'Пресс';return 'Другое'}
const ALTS={'Спина':['Подтягивания, прямым широким хватом','Тяга в вертикальном хаммере','Тяга Т-грифа','Тяга гантели в наклоне'],'Грудь':['Жим в хаммере на середину грудных','Жим гантелей лежа на скамье 30°','Сведения в тренажере'],'Дельты':['Махи в стороны в тренажере','Жим гантелей сидя','Тяга каната к лицу'],'Бицепс':['Сгибания со штангой','Молотки с гантелями','Сгибания в кроссовере'],'Трицепс':['Разгибания с канатом','Французский жим с EZ-грифом','Отжимания на брусьях'],'Ноги':['Гакк-присед','Жим платформы','Болгарские сплит-приседания','Сгибания ног лёжа'],'Пресс':['Подъёмы ног в висе','Скручивания на блоке'],'Другое':['Похожее упражнение']};

/* сила: расчётный максимум сейчас против первой недели */
function strength(){return EX_ALL.map(x=>{const h=exHistory(x.name);if(h.length<3)return null;const w0=weekOf(h[0].date);const first=Math.max(...h.filter(y=>weekOf(y.date)===w0).map(y=>y.e1)),last=Math.max(...h.slice(-2).map(y=>y.e1));return {name:x.name,muscle:x.muscle,code:x.code,first:Math.round(first),last:Math.round(last),pct:+((last/first-1)*100).toFixed(1),hist:h}}).filter(Boolean)}

const store={get(k,f){try{const v=localStorage.getItem('app:'+k);return v==null?f:JSON.parse(v)}catch(e){return f}},set(k,v){try{localStorage.setItem('app:'+k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem('app:'+k)}catch(e){}}};

function strengthWeeks(){const S=strength();const out=[];let m=d(C.start);while(iso(m)<=TODAY){const a=iso(m),b=iso(addDays(m,6));const vals=S.map(s=>{if(weekOf(s.hist[0].date)>=a)return null;const h=s.hist.filter(x=>x.date>=a&&x.date<=b);return h.length?Math.max(...h.map(x=>x.e1))/s.first:null}).filter(Boolean);out.push(vals.length?(sum(vals)/vals.length-1)*100:null);m=addDays(m,7)}let last=0;return out.map(v=>{if(v==null)return last;last=v;return v})}
/* лесенка Владимира (правило 1 спеки): вес(неделя w, подход s из n) = M + 0,05·M·((s − n) + (w − 3)), не ниже 0,8·M; одна формула для клиента и для панели тренера */
function ladderKg(M,n,w){const st=M>=20?2.5:1,floor=Math.ceil(0.8*M/st)*st;return Array.from({length:n},(_,i)=>Math.max(floor,round(M+0.05*M*((i+1-n)+(w-3)),st)))}
/* подсказка веса после сданного отчёта (его слово 29.10): веса на период до следующего отчёта считаются из той же тренировки,
   сделанной до последнего отчёта. Все повторы сделаны: лесенка; нет: веса те же, а тренер видит недобор в отчёте */
const repT=r=>{r=String(r);if(r.includes(','))return r.split(',').map(Number);if(r.includes('-')){const [a,b]=r.split('-').map(Number);return {lo:a,hi:b}}const n=parseInt(r);return isNaN(n)?null:n};
const needOf=(rp,i)=>Array.isArray(rp)?(rp[i]!=null?rp[i]:rp[rp.length-1]):typeof rp==='number'?rp:rp.lo;
function missesOf(w){const out=[];w.ex.forEach(e=>{const rp=repT(e.target.reps);if(rp==null||!e.sets.length)return;e.sets.forEach((s,i)=>{const need=needOf(rp,i);if(s.reps<need)out.push({date:w.date,name:e.name,set:i+1,got:s.reps,need})})});return out}
function suggest(phase,day,week,name,n,reps){const key=normKey(name);const base=WORKOUTS.filter(w=>w.done&&w.phase===phase&&w.day===day&&w.week<week&&w.date<=LAST_REP.date).pop();const be=base&&base.ex.find(x=>normKey(x.name)===key&&x.sets.length);if(!be)return null;
  const rp=repT(reps);if(rp==null)return null;const rpb=repT(be.target.reps)||rp,range=!Array.isArray(rp)&&typeof rp==='object';const ps=be.sets,top=ps[ps.length-1].kg,st=top>=20?2.5:1,at=i=>ps[Math.min(i,ps.length-1)].kg;const done=ps.every((s,i)=>s.reps>=needOf(rpb,i));const same=Array.from({length:n},(_,i)=>at(i));
  if(range)return {kg:same,done,base,why:done?`вес тот же, цель ${rp.hi} повторений`:'не все повторы: веса те же'};
  const M=top/(1+0.05*(base.week-3));return done?{kg:ladderKg(M,n,week),done,base,why:`лесенка недели ${week}, шаг 5 %`}:{kg:same,done,base,why:'не все повторы: веса те же'}}
/* темп по правилу Владимира 28.10: минус 0,5-1,5 % веса тела в неделю, среднее за 7 дней против среднего неделей раньше. Без даты и срока */
const PACE={lo:0.5,hi:1.5};
function avg7At(i){const s=DAYS.slice(Math.max(0,i-6),i+1);return sum(s.map(x=>x.weight))/s.length}
function pace(){const i=DAYS.length-1;const now=avg7At(i),was=avg7At(i-7);const pct=Math.round((was-now)/was*1000)/10;return {now,was,kg:+(now-was).toFixed(1),pct,ok:pct>=PACE.lo&&pct<=PACE.hi,slow:pct<PACE.lo,fast:pct>PACE.hi}}
function paceBand(a0,n){return {hi:Array.from({length:n},(_,i)=>a0*Math.pow(1-PACE.lo/100,i/7)),lo:Array.from({length:n},(_,i)=>a0*Math.pow(1-PACE.hi/100,i/7))}}
/* сколько дней до отчёта; в демо можно показать сам день отчёта */
function reportState(){const demo=store.get('demo:repday',false);const left=demo?0:Math.round((d(NEXT_REPORT)-d(TODAY))/86400000);return {next:demo?TODAY:NEXT_REPORT,left,demo,passed:EVERY-left,every:EVERY,when:left===0?'сегодня':left===1?'завтра':'через '+pl(left,'день','дня','дней')}}
window.DATA={ladderKg,suggest,missesOf,EVERY,PLAN_TR,NEXT_REPORT,LAST_REP,PERIOD_WORD,reportState,PACE,pace,paceBand,MEAS_FIELDS:[['Талия','waist'],['Ягодицы','hips'],['Бедро П','thighR'],['Бедро Л','thighL']],normKey,C,TODAY,PH,PHASE_LIST,SCHED,WORKOUTS,DAYS,NORMS,normAt,SUPPS,REPORTS,MEASURES,LESSONS,EX_ALL,ALTS,strength,strengthWeeks,exHistory,tonnage,weekOf,sum,e1rm,pl,navyFat,fmtD,fmtDD,iso,d,addDays,round,store,RU_D};
})();
