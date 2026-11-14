'use strict';
// Ferramentas de análise da consultoria — usam Selic/CDI/IPCA e câmbio ao vivo como premissas.
const fN=id=>+document.getElementById(id).value||0;
const cdiLiq=()=>S.ind.cdi*0.85;                       // CDI líquido de IR (15%, prazo > 2 anos)
const am=a=>Math.pow(1+a/100,1/12)-1;                  // taxa anual % -> mensal
const fvSerie=(pv,pmt,i,n)=>i?pv*Math.pow(1+i,n)+pmt*(Math.pow(1+i,n)-1)/i:pv+pmt*n;
const tbl=(h,rows)=>`<div class="tw"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr${r.best?' class="best"':''}>${r.map((c,k)=>`<td${k?' class="n"':''}>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
const verd=(ok,t)=>`<p class="verd">${ico(ok?'ok':'warn',ok?'ok':'wa')} ${t}</p>`;
const TOOLS=[
{id:'fin',ic:'bank',t:'Financiamento: SAC x Price',d:'Compara os dois sistemas de amortização e o custo total dos juros.',
 f:[['Valor financiado (R$)','finV',400000,10000],['Juros (% a.a.)','finJ',()=>Math.max(S.ind.selic-2,8).toFixed(1),0.1],['Prazo (meses)','finN',360,12]],
 run(){const V=fN('finV'),i=am(fN('finJ')),n=Math.max(1,fN('finN'));const pm=i?V*i/(1-Math.pow(1+i,-n)):V/n;const a=V/n;
  const sacJ=i*V*(n+1)/2,priJ=pm*n-V;const r1=['SAC (parcela decrescente)',brl(a+V*i),brl(a+a*i),brl(sacJ),brl(V+sacJ)],r2=['Price (parcela fixa)',brl(pm),brl(pm),brl(priJ),brl(V+priJ)];r1.best=true;
  return tbl(['Sistema','1ª parcela','Última parcela','Total de juros','Total pago'],[r1,r2])+verd(true,`SAC economiza <b>${brl(priJ-sacJ)}</b> em juros, mas a 1ª parcela é ${brl(a+V*i-pm)} maior. Renda mínima usual (parcela ≤ 30% da renda): ${brl((a+V*i)/0.3)} no SAC e ${brl(pm/0.3)} na Price.`);}},
{id:'alug',ic:'home',t:'Comprar x alugar imóvel',d:'Compara o patrimônio final de quem compra com o de quem aluga e investe a diferença.',
 f:[['Valor do imóvel (R$)','alV',600000,10000],['Entrada (R$)','alE',150000,5000],['Juros do financiamento (% a.a.)','alJ',()=>Math.max(S.ind.selic-2,8).toFixed(1),0.1],['Prazo (anos)','alN',30,1],['Aluguel mensal (R$)','alA',2800,100],['Valorização do imóvel (% a.a.)','alVal',()=>S.ind.ipca12.toFixed(1),0.1]],
 run(){const V=fN('alV'),E=fN('alE'),i=am(fN('alJ')),n=Math.max(1,fN('alN'))*12,A=fN('alA'),val=fN('alVal'),longo=((1+S.ind.ipca12/100)*1.04-1)*100,inv=am(longo),reaj=am(S.ind.ipca12);
  const fin=V-E,pm=i?fin*i/(1-Math.pow(1+i,-n)):fin/n,custos=V*0.05;let car=E+custos,al=A,pago=0,alTot=0;
  for(let m=0;m<n;m++){car=car*(1+inv)+(pm-al);al*=1+reaj;pago+=pm;alTot+=al;}
  const imovel=V*Math.pow(1+val/100,n/12);const comprar=imovel>car;
  const r1=['Comprar financiado',brl(pm),brl(pago+E+custos),brl(imovel)],r2=['Alugar e investir a diferença',brl(A)+' (reajuste IPCA)',brl(alTot),brl(car)];(comprar?r1:r2).best=true;
  return tbl(['Opção','Desembolso mensal inicial','Total desembolsado','Patrimônio ao final'],[r1,r2])+verd(comprar,`Com estas premissas, <b>${comprar?'comprar':'alugar e investir'}</b> termina com ${brl(Math.abs(imovel-car))} a mais. Aluguel equivale a ${pct(A/V*100,2)} do imóvel por mês (abaixo de ~0,45% costuma favorecer alugar). Investimentos a ${pct(longo)} a.a. líquidos (inflação + 4% de juro real, premissa de longo prazo — os juros de hoje não duram 30 anos); custos de compra de 5%.`);}},
{id:'meta',ic:'trend',t:'Independência financeira e metas',d:'Quanto acumular e quanto poupar por mês para viver de renda.',
 f:[['Renda mensal desejada (R$, valores de hoje)','meR',10000,500],['Patrimônio atual (R$)','meP',50000,5000],['Anos até a meta','meN',20,1],['Juro real esperado (% a.a.)','meJ',4,0.5]],
 run(){const R=fN('meR'),P=fN('meP'),n=Math.max(1,fN('meN'))*12,j=fN('meJ'),i=am(j);const alvo=R*12/(Math.max(j,0.5)/100);
  const pmt=Math.max(0,(alvo-P*Math.pow(1+i,n))*i/(Math.pow(1+i,n)-1));const real=((1+S.ind.selic/100)/(1+S.ind.ipca12/100)-1)*100;
  const cen=[2,4,6].map(x=>{const k=am(x),a=R*12/(x/100);const p=Math.max(0,(a-P*Math.pow(1+k,n))*k/(Math.pow(1+k,n)-1));const r=[`Juro real ${x}% a.a.`,brl(a),brl(p)];if(x===j)r.best=true;return r;});
  return tbl(['Cenário','Patrimônio necessário','Aporte mensal necessário'],cen)+verd(true,`Para ${brl(R)}/mês em valores de hoje você precisa de <b>${brl(alvo)}</b>, poupando <b>${brl(pmt)}</b>/mês (corrigidos pela inflação). Juro real atual no Brasil: ${pct(real)} — acima da média histórica; use 4% para planejar com margem.`);}},
{id:'div',ic:'scale',t:'Quitar dívida x investir',d:'Mostra o que rende mais: antecipar a dívida ou aplicar o dinheiro.',
 f:[['Dinheiro disponível (R$)','dvV',20000,1000],['Juros da dívida (% a.m.)','dvJ',1.8,0.1],['Prazo de comparação (meses)','dvN',24,1]],
 run(){const V=fN('dvV'),jd=fN('dvJ')/100,n=Math.max(1,fN('dvN'));const ir=n<=6?22.5:n<=12?20:n<=24?17.5:15;const ji=am(S.ind.cdi)*(1-ir/100);
  const ecoD=V*(Math.pow(1+jd,n)-1),ganI=V*(Math.pow(1+ji,n)-1);const quitar=ecoD>ganI;
  const r1=['Quitar/antecipar a dívida',pct(jd*100,2)+' a.m.',brl(ecoD)],r2=['Investir em 100% CDI (líquido de IR)',pct(ji*100,2)+' a.m.',brl(ganI)];(quitar?r1:r2).best=true;
  return tbl(['Opção','Taxa efetiva','Ganho em '+n+' meses'],[r1,r2])+verd(quitar,`<b>${quitar?'Quite a dívida':'Invista'}</b>: diferença de ${brl(Math.abs(ecoD-ganI))}. Ponto de equilíbrio: dívidas acima de <b>${pct(ji*100,2)} a.m.</b> (${pct((Math.pow(1+ji,12)-1)*100,1)} a.a.) devem ser quitadas antes de investir. Mantenha a reserva de emergência mesmo assim.`);}},
{id:'perfil',ic:'shield',t:'Perfil de investidor e carteira sugerida',d:'Define o perfil e distribui o patrimônio entre as classes de ativos.',
 f:[['Patrimônio a investir (R$)','pfV',100000,5000],['Idade','pfI',40,1],['Horizonte (anos)','pfH',10,1],['Tolerância a perdas (1 = nenhuma, 5 = alta)','pfT',3,1]],
 run(){const V=fN('pfV'),id=fN('pfI'),h=fN('pfH'),t=Math.min(5,Math.max(1,fN('pfT')));const sc=t*2+(h>=10?3:h>=5?2:h>=2?1:0)+(id<35?2:id<55?1:0);
  const p=sc<=5?['Conservador',[70,20,5,0,5]]:sc<=9?['Moderado',[40,25,15,10,10]]:['Arrojado',[20,20,25,15,20]];
  const C=[['Pós-fixados (Tesouro Selic, CDB liquidez diária)',S.ind.cdi*0.85],['Inflação (Tesouro IPCA+, debêntures incentivadas)',((1+S.ind.ipca12/100)*1.07-1)*100*0.85],['Ações Brasil',12],['Fundos imobiliários',11.5],['Exterior / dólar (ETFs globais)',9]];
  const ret=C.reduce((a,c,k)=>a+c[1]*p[1][k]/100,0);
  return tbl(['Classe de ativo','Participação','Valor','Retorno esperado a.a.'],C.map((c,k)=>[c[0],pct(p[1][k],0),brl(V*p[1][k]/100),pct(c[1],1)]))+verd(true,`Perfil <b>${p[0]}</b> (pontuação ${sc}/15). Retorno esperado da carteira: <b>${pct(ret,1)} a.a.</b> (${pct(((1+ret/100)/(1+S.ind.ipca12/100)-1)*100,1)} acima da inflação). Renda variável e exterior usam médias históricas, não garantidas. Rebalanceie uma vez por ano.`);}},
{id:'vida',ic:'heart',t:'Capital ideal do seguro de vida',d:'Calcula a cobertura que mantém o padrão da família.',
 f:[['Renda mensal da pessoa segurada (R$)','svR',12000,500],['Anos de sustento a garantir','svN',10,1],['Dívidas e financiamentos (R$)','svD',200000,5000],['Reservas e investimentos atuais (R$)','svP',80000,5000],['Idade','svI',38,1]],
 run(){const R=fN('svR'),n=fN('svN'),D=fN('svD'),P=fN('svP'),id=fN('svI');const i=am(4);const vp=i?R*0.7*(1-Math.pow(1+i,-n*12))/i:R*0.7*n*12;
  const inv=R*12*0.15,cap=Math.max(0,vp+D+inv-P);const fat=id<30?0.6:id<40?1:id<50?1.8:id<60?3.2:5.5,pre=cap*0.0035*fat;
  return tbl(['Componente','Valor'],[['Reposição de 70% da renda por '+n+' anos (valor presente, juro real 4%)',brl(vp)],['Quitação de dívidas',brl(D)],['Inventário e custos imediatos (~15% da renda anual)',brl(inv)],['(−) Reservas existentes','− '+brl(P)],Object.assign(['Capital segurado recomendado','<b>'+brl(cap)+'</b>'],{best:true})])+verd(true,`Prêmio estimado: <b>${brl(pre/12)}/mês</b> (${pct(pre/(R*12)*100,1)} da renda). Equivale a ${num(cap/(R*12),1)}× a renda anual; a regra prática é 5–10×. Estimativa — cote em 3 seguradoras.`);}},
{id:'fviag',ic:'plane',t:'Fundo para viagem ou compra no exterior',d:'Quanto guardar por mês e como dividir a compra da moeda até a data.',
 f:[['Orçamento na moeda estrangeira','fvV',5000,100],['Moeda (USD, EUR, GBP…)','fvM','USD',null],['Meses até a data','fvN',10,1]],
 run(){const V=fN('fvV'),m=(document.getElementById('fvM').value||'USD').toUpperCase(),n=Math.max(1,fN('fvN')),q=S.fx[m];if(!q)return '<p class="note">Moeda sem cotação no momento. Use um dos códigos da aba Câmbio.</p>';
  const p=(S.prevFx||[]).find(x=>x.c===m),proj=p?.p1||q.ask,custo=x=>V*x*1.015*1.035;const i=am(S.ind.cdi)*0.8,medio=(q.ask+proj)/2;
  const pmt=i?custo(medio)*i/(Math.pow(1+i,n)-1):custo(medio)/n;
  const rows=[['Comprar tudo hoje',brl(custo(q.ask))],['Comprar tudo na data (câmbio projetado)',brl(custo(proj))],Object.assign(['Comprar em '+n+' parcelas mensais (preço médio)','<b>'+brl(custo(medio))+'</b>'],{best:true})];
  if(p?.hi)rows.push(['Cenário pessimista na data (topo da faixa provável)',brl(custo(p.hi))]);
  return tbl(['Estratégia','Custo total em R$ (conta global, com IOF)'],rows)+verd(true,`Guarde <b>${brl(pmt)}/mês</b> em CDB de liquidez diária e compre ${num(V/n,0)} ${m} por mês. Cotação hoje R$ ${num(q.ask)}; projeção R$ ${num(proj)}. A compra parcelada reduz o risco de pegar o pico do câmbio.`);}},
];
function buildTools(){const box=document.getElementById('tools');
  box.innerHTML=TOOLS.map(t=>`<div class="card tool" id="tool-${t.id}"><h2 class="hi">${ico(t.ic)}${t.t}</h2><p class="note">${t.d}</p><div class="form">${t.f.map(([l,id,v,st])=>`<label>${l}<input id="${id}" ${st===null?'type="text" maxlength="3"':`type="number" step="${st}"`} value="${typeof v==='function'?v():v}"></label>`).join('')}</div><div class="out" id="out-${t.id}"></div></div>`).join('');
  TOOLS.forEach(t=>t.f.forEach(([,id])=>document.getElementById(id).addEventListener('input',()=>runTool(t))));runTools();}
function runTool(t){try{document.getElementById('out-'+t.id).innerHTML=t.run();}catch(e){document.getElementById('out-'+t.id).innerHTML='<p class="note">Revise os valores informados.</p>';}}
function runTools(){TOOLS.forEach(runTool);}
buildTools();
