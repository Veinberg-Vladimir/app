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
function navyFat(waist,neck,height){return 495/(1.0324-0.19077*Math.log10(waist-neck)+0.15456*Math.log10(height))-450}

const C={name:'Андрей',initial:'А',height:182,age:34,start:'2026-08-17',today:TODAY,goal:'минус 10 кг к Новому году',startWeight:96.4,stepsGoal:10000,sleepGoal:7.5,vip:true,tariff:'с тренером'};
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
  DAYS.push({date:s,weight,sleep:+rnd(6.1,8.3).toFixed(1),steps:Math.round(rnd(5200,12800)/100)*100,supps:SUPPS.map(()=>R()<0.86),food:today?{kcal:1420,p:112,f:48,c:130,meals:[{name:'Завтрак',kcal:520,items:'Овсянка 80 г, 3 яйца, банан'},{name:'Обед',kcal:640,items:'Гречка 100 г, куриная грудка 200 г, салат'},{name:'Перекус',kcal:260,items:'Творог 5% 200 г'}]}:{kcal,p,f,c},training:tr?tr.date:null});
  dt=addDays(dt,1);i++}
if(DAYS.length){const t=DAYS[DAYS.length-1];t.sleep=7.5;t.steps=6240;t.supps=[true,true,false]}

/* отчёты по воскресеньям */
const REPORTS=[];
const sundays=['2026-08-23','2026-08-30','2026-09-06','2026-09-13','2026-09-20','2026-09-27'];
const measAt=(k)=>({waist:+(102-6*k).toFixed(1),neck:+(41-0.5*k).toFixed(1),chest:+(108-2*k).toFixed(1),thighR:+(62-2*k).toFixed(1),thighL:+(61.5-2*k).toFixed(1),bicepsR:+(37+0.5*k).toFixed(1),bicepsL:+(36.5+0.5*k).toFixed(1)});
const START_MEAS=Object.assign({date:C.start},measAt(0));
const COMMENTS=['Старт хороший, вес пошёл. Норму не трогаем, шаги держи от 8 000','Темп в норме. На тренировках добавляй по плану, не торопись','Вес встал первую неделю, это вода и соль, ждём ещё неделю','Две недели без сдвига: режу калории на 200, углеводы вечером убираем','Пошло. Сон коротковат, 6 с половиной мало для восстановления','Отличная неделя. Фаза 12 тяжёлая, следи за техникой в тягах'];
sundays.forEach((s,k)=>{const idx=DAYS.findIndex(x=>x.date===s);const wk=DAYS.slice(Math.max(0,idx-6),idx+1);const prev=DAYS.slice(Math.max(0,idx-13),Math.max(0,idx-6));
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const trs=WORKOUTS.filter(w=>w.done&&w.date>=wk[0].date&&w.date<=s);
  REPORTS.push({date:s,n:k+1,weightWas:+avg(prev.length?prev.map(x=>x.weight):[C.startWeight]).toFixed(1),weightNow:+avg(wk.map(x=>x.weight)).toFixed(1),sleep:+avg(wk.map(x=>x.sleep)).toFixed(1),energy:Math.round(rnd(6,9)),stress:Math.round(rnd(2,6)),training:trs.length?Math.round(avg(trs.map(t=>t.rating))):0,trainings:trs.length,appetite:['обычное','обычное','повышенное','обычное','повышенное','слабое'][k],adherence:[92,88,85,78,90,95][k],steps:Math.round(avg(wk.map(x=>x.steps))),food:{kcal:Math.round(avg(wk.map(x=>x.food.kcal))),p:Math.round(avg(wk.map(x=>x.food.p))),f:Math.round(avg(wk.map(x=>x.food.f))),c:Math.round(avg(wk.map(x=>x.food.c)))},meas:Object.assign({date:s},measAt((k+1)/6)),videos:trs.length*2,comment:COMMENTS[k],hard:['Тянет на сладкое после ужина','Мало сплю из-за работы','Пропустил одну тренировку, командировка','Срыв в субботу на дне рождения','Всё по плану','Устаю к концу недели'][k]})});
const MEASURES=[START_MEAS].concat(REPORTS.map(r=>r.meas));
/* разбор недели по пунктам (демо-тексты) */
REPORTS.forEach((r,k)=>{const d=+(r.weightNow-r.weightWas).toFixed(1);const n=normAt(r.date);const trs=WORKOUTS.filter(w=>w.done&&w.date>r.date.slice(0,8)+'00'&&w.date<=r.date).slice(-3);
  r.review=[['Вес и замеры',`${r.weightWas} → ${r.weightNow} кг, ${d>0?'+':''}${d} за неделю. Талия ${r.meas.waist} см. ${d<=-0.5?'Темп по плану':d<=-0.2?'Темп медленнее плана, смотрим питание':'Вес стоит, смотрим соблюдение и соль'}`],
  ['Питание и голод',`Среднее ${r.food.kcal.toLocaleString('ru')} ккал при норме ${n.kcal.toLocaleString('ru')}, белок ${r.food.p} г. Соблюдение ${r.adherence} %. Голод ${r.appetite}`],
  ['Сон и стресс',`Сон ${r.sleep} ч, стресс ${r.stress}/10, энергия ${r.energy}/10${r.sleep<7?'. Сна мало, это тормозит и вес, и силу':''}`],
  ['Тренировки',`${r.trainings} из 3, силовые ${r.training}/10, шаги ${r.steps.toLocaleString('ru')} в день`],
  ['Решение на неделю',COMMENTS[k]]]});

/* библиотека знаний */
const LESSONS=[
 {cat:'Как вести приложение',items:[{t:'Как читать программу: подходы, повторения, темп, RIR',min:6,new:true},{t:'Как записывать подходы и что такое «прошлый раз»',min:4},{t:'Отчёт недели: что и когда заполнять',min:5},{t:'Фото прогресса: свет, ракурс, время',min:3}]},
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
function strength(){return EX_ALL.map(x=>{const h=exHistory(x.name);if(h.length<3)return null;const first=Math.max(...h.slice(0,2).map(y=>y.e1)),last=Math.max(...h.slice(-2).map(y=>y.e1));return {name:x.name,muscle:x.muscle,code:x.code,first:Math.round(first),last:Math.round(last),pct:+((last/first-1)*100).toFixed(1),hist:h}}).filter(Boolean)}

const store={get(k,f){try{const v=localStorage.getItem('app:'+k);return v==null?f:JSON.parse(v)}catch(e){return f}},set(k,v){try{localStorage.setItem('app:'+k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem('app:'+k)}catch(e){}}};

window.DATA={MEAS_FIELDS:[['Талия','waist'],['Грудь','chest'],['Бедро П','thighR'],['Бедро Л','thighL'],['Бицепс П','bicepsR'],['Бицепс Л','bicepsL']],normKey,C,TODAY,PH,PHASE_LIST,SCHED,WORKOUTS,DAYS,NORMS,normAt,SUPPS,REPORTS,MEASURES,LESSONS,EX_ALL,ALTS,strength,exHistory,tonnage,weekOf,sum,e1rm,navyFat,fmtD,fmtDD,iso,d,addDays,round,store,RU_D};
})();
