'use strict';
const $=s=>document.querySelector(s);
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const num=(v,d=4)=>v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=(v,d=2)=>num(v,d)+'%';

// 20 moedas de maior circulação/negociação global (BIS Triennial Survey), cotadas contra o Real
const MOEDAS=[['USD','Dólar americano','🇺🇸'],['EUR','Euro','🇪🇺'],['JPY','Iene japonês','🇯🇵'],['GBP','Libra esterlina','🇬🇧'],['CNY','Yuan chinês','🇨🇳'],['AUD','Dólar australiano','🇦🇺'],['CAD','Dólar canadense','🇨🇦'],['CHF','Franco suíço','🇨🇭'],['HKD','Dólar de Hong Kong','🇭🇰'],['SGD','Dólar de Singapura','🇸🇬'],['SEK','Coroa sueca','🇸🇪'],['KRW','Won sul-coreano','🇰🇷'],['NOK','Coroa norueguesa','🇳🇴'],['NZD','Dólar neozelandês','🇳🇿'],['INR','Rupia indiana','🇮🇳'],['MXN','Peso mexicano','🇲🇽'],['TWD','Dólar taiwanês','🇹🇼'],['ZAR','Rand sul-africano','🇿🇦'],['DKK','Coroa dinamarquesa','🇩🇰'],['ARS','Peso argentino','🇦🇷']];

// Estado: começa com valores de referência (exibidos como "referência" até a API responder)
const S={fx:{},live:{fx:false,ind:false},ind:{selic:14.25,cdi:14.15,ipca12:4.6,tr:0.17},focus:null,t:null};

// ---------- Busca de dados ----------
async function getJSON(u){const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error(r.status);return r.json();}
async function loadFx(){
  try{
    const pares=MOEDAS.map(m=>m[0]+'-BRL').join(',');
    const d=await getJSON('https://economia.awesomeapi.com.br/json/last/'+pares);
    for(const k in d){const q=d[k];S.fx[q.code]={bid:+q.bid,ask:+q.ask,pct:+q.pctChange,high:+q.high,low:+q.low,src:'AwesomeAPI',ts:q.create_date};}
    S.live.fx=true;
  }catch(e){console.warn('AwesomeAPI falhou',e);}
  const faltam=MOEDAS.map(m=>m[0]).filter(c=>!S.fx[c]);
  if(faltam.length){try{
    const d=await getJSON('https://api.frankfurter.app/latest?from=BRL');
    for(const c of faltam) if(d.rates[c]){const v=1/d.rates[c];S.fx[c]={bid:v,ask:v,pct:0,high:v,low:v,src:'BCE (Frankfurter)',ts:d.date};}
    S.live.fx=true;
  }catch(e){console.warn('Frankfurter falhou',e);}}
}
const sgs=(c,n=1)=>getJSON(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${c}/dados/ultimos/${n}?formato=json`);
async function loadInd(){
  try{
    const [selic,cdi,ipca,tr]=await Promise.all([sgs(432),sgs(4389),sgs(13522),sgs(226)]);
    S.ind={selic:+selic[0].valor.replace(',','.'),cdi:+cdi[0].valor.replace(',','.'),ipca12:+ipca[0].valor.replace(',','.'),tr:+tr[0].valor.replace(',','.')*12,data:selic[0].data};
    S.live.ind=true;
  }catch(e){console.warn('BCB SGS falhou',e);}
  try{
    const ano=new Date().getFullYear();
    const f=encodeURIComponent(`(Indicador eq 'IPCA' or Indicador eq 'Selic' or Indicador eq 'Câmbio' or Indicador eq 'PIB Total') and baseCalculo eq 0`);
    const d=await getJSON(`https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$top=60&$orderby=Data%20desc&$format=json&$filter=${f}`);
    const m={};for(const r of d.value){const k=r.Indicador+'|'+r.DataReferencia;if(!m[k]&&+r.DataReferencia>=ano&&+r.DataReferencia<=ano+2)m[k]=r;}
    S.focus=Object.values(m);
  }catch(e){console.warn('Focus falhou',e);}
}

// ---------- Cálculos de investimento ----------
const irAliq=d=>d<=180?22.5:d<=360?20:d<=720?17.5:15;
function produtos(){const {cdi,selic,ipca12,tr}=S.ind;
  const poup=selic>8.5?(Math.pow(1.005,12)-1)*100+tr:selic*0.7+tr;
  return [
    {n:'Poupança',taxa:poup,ir:false,liq:'Diária (rende no aniversário)',fgc:true,risco:1,obs:'Rende 0,5% a.m. + TR quando Selic > 8,5%. Perde para quase tudo hoje.'},
    {n:'Tesouro Selic',taxa:selic-0.2,ir:true,liq:'D+1 (vende ao Tesouro)',fgc:false,risco:1,obs:'Título público: menor risco do país. Ideal para reserva de emergência.'},
    {n:'CDB 100% CDI (liquidez diária)',taxa:cdi,ir:true,liq:'Diária',fgc:true,risco:1,obs:'Garantido pelo FGC até R$ 250 mil por CPF/instituição.'},
    {n:'CDB 110% CDI (2 anos)',taxa:cdi*1.10,ir:true,liq:'No vencimento',fgc:true,risco:2,obs:'Bancos médios pagam mais; dinheiro fica preso até o vencimento.'},
    {n:'LCI/LCA 92% CDI',taxa:cdi*0.92,ir:false,liq:'Carência mín. 9–12 meses',fgc:true,risco:2,obs:'Isenta de IR: compare com CDB ≈ 92/0,85 = 108% CDI.'},
    {n:'Tesouro IPCA+ (IPCA + 7%)',taxa:((1+ipca12/100)*1.07-1)*100,ir:true,liq:'D+1 (preço oscila — marcação a mercado)',fgc:false,risco:2,obs:'Protege da inflação. Venda antes do vencimento pode dar prejuízo.'},
    {n:'Tesouro Prefixado (~13,5% a.a.)',taxa:Math.max(selic-1,8),ir:true,liq:'D+1 (marcação a mercado)',fgc:false,risco:2,obs:'Ganha se os juros caírem; perde se subirem e você vender antes.'},
    {n:'Debênture incentivada (IPCA + 7,5%)',taxa:((1+ipca12/100)*1.075-1)*100,ir:false,liq:'Baixa (mercado secundário)',fgc:false,risco:3,obs:'Risco da empresa emissora. Sem FGC. Isenta de IR.'},
    {n:'Fundos Imobiliários (FIIs)',taxa:11.5,ir:false,liq:'D+2 (bolsa)',fgc:false,risco:3,obs:'Estimativa: dividendos ~0,9% a.m. isentos; cotas oscilam. Não garantido.'},
    {n:'Ações — Ibovespa (histórico)',taxa:12,ir:'acao',liq:'D+2 (bolsa)',fgc:false,risco:3,obs:'Média histórica de longo prazo; anos de -20% acontecem. Horizonte 5+ anos.'},
    {n:'Dólar (reserva cambial)',taxa:4,ir:'acao',liq:'D+0 a D+2',fgc:false,risco:3,obs:'Proteção, não rendimento. Variação anual pode ser ±20%.'},
  ];}
function simula(p,valor,mes,meses){
  const im=Math.pow(1+p.taxa/100,1/12)-1;let bruto=valor;for(let i=0;i<meses;i++)bruto=bruto*(1+im)+mes;
  const inv=valor+mes*meses,lucro=bruto-inv;const dias=Math.round(meses*30.44);
  const aliq=p.ir===true?irAliq(dias):p.ir==='acao'?15:0;const ir=Math.max(0,lucro)*aliq/100;
  const liq=bruto-ir;const inf=Math.pow(1+S.ind.ipca12/100,meses/12);
  return {inv,bruto,ir,aliq,liq,lucro:liq-inv,real:(liq/inv/inf-1)*100,anual:(Math.pow(liq/inv,12/meses)-1)*100};
}
const riscoTag=r=>`<span class="tag t${r}">${['','Baixo','Médio','Alto'][r]}</span>`;

// ---------- Renderização ----------
function renderKpis(){const i=S.ind,u=S.fx.USD,e=S.fx.EUR;const lv=S.live.ind?'BCB · '+(i.data||''):'referência (offline)';
  const k=[['Selic (meta)',pct(i.selic),lv],['CDI anual',pct(i.cdi),lv],['IPCA 12 meses',pct(i.ipca12),lv],['Juro real (Selic − IPCA)',pct(((1+i.selic/100)/(1+i.ipca12/100)-1)*100),'acima da inflação'],
    ['Dólar comercial',u?'R$ '+num(u.bid):'—',u?`<span class="${u.pct>=0?'up':'dn'}">${u.pct>=0?'▲':'▼'} ${pct(u.pct)}</span> hoje`:''],['Euro comercial',e?'R$ '+num(e.bid):'—',e?`<span class="${e.pct>=0?'up':'dn'}">${e.pct>=0?'▲':'▼'} ${pct(e.pct)}</span> hoje`:'']];
  $('#kpis').innerHTML=k.map(x=>`<div class="kpi"><div class="l">${x[0]}</div><div class="v">${x[1]}</div><div class="s">${x[2]}</div></div>`).join('');}
function fxRows(lim){return MOEDAS.slice(0,lim).map(([c,n,f])=>{const q=S.fx[c];if(!q)return `<tr><td>${f} ${c}</td><td>${n}</td><td colspan="3">indisponível</td></tr>`;
  const turismo=q.ask*1.04;return `<tr data-tip="fx:${c}"><td>${f} <b>${c}</b></td><td>${n}</td><td class="n">R$ ${num(q.bid)}</td><td class="n">R$ ${num(q.ask)}</td><td class="n ${q.pct>=0?'up':'dn'}">${q.pct>=0?'▲':'▼'} ${pct(Math.abs(q.pct))}</td>${lim>10?`<td class="n">R$ ${num(q.low)} – ${num(q.high)}</td><td class="n">R$ ${num(turismo)}</td><td class="n">${num(1/q.bid,4)}</td><td>${q.src}</td>`:''}</tr>`;}).join('');}
function renderFx(){
  $('#homeFx').innerHTML='<tr><th>Moeda</th><th>Nome</th><th>Compra</th><th>Venda</th><th>Dia</th></tr>'+fxRows(10);
  $('#fxTable').innerHTML='<tr><th>Moeda</th><th>Nome</th><th>Compra</th><th>Venda</th><th>Var. dia</th><th>Mín – Máx</th><th>Turismo est.*</th><th>1 R$ =</th><th>Fonte</th></tr>'+fxRows(20)+'<tr><td colspan="9" class="note">* Turismo estimado = comercial + ~4% (spread médio de casas de câmbio, sem IOF).</td></tr>';
}
function renderInv(){
  const v=+$('#sVal').value||0,m=+$('#sMes').value||0,p=Math.max(1,+$('#sPrazo').value||1);
  const rows=produtos().map(x=>({x,r:simula(x,v,m,p)})).sort((a,b)=>b.r.liq-a.r.liq);
  $('#invTable').innerHTML=`<tr><th>Produto</th><th>Taxa a.a.</th><th>Investido</th><th>Bruto</th><th>IR</th><th>Líquido no resgate</th><th>Lucro líquido</th><th>Ganho real (desc. inflação)</th><th>Liquidez</th><th>Risco</th><th>FGC</th></tr>`+
   rows.map(({x,r},i)=>`<tr data-tip="inv:${x.n}" class="${i===0?'best':''}"><td><b>${x.n}</b><div class="note">${x.obs}</div></td><td class="n">${pct(x.taxa)}</td><td class="n">${brl(r.inv)}</td><td class="n">${brl(r.bruto)}</td><td class="n">${r.aliq?brl(r.ir)+' ('+num(r.aliq,1)+'%)':'Isento'}</td><td class="n"><b>${brl(r.liq)}</b></td><td class="n ${r.lucro>=0?'up':'dn'}">${brl(r.lucro)}</td><td class="n ${r.real>=0?'up':'dn'}">${pct(r.real)}</td><td>${x.liq}</td><td>${riscoTag(x.risco)}</td><td>${x.fgc?'Sim':'Não'}</td></tr>`).join('');
  const h=produtos().slice(0,7).map(x=>({x,r:simula(x,10000,0,12)})).sort((a,b)=>b.r.liq-a.r.liq);
  $('#homeInv').innerHTML='<tr><th>Produto</th><th>Líquido</th><th>Ganho real</th><th>Risco</th></tr>'+h.map(({x,r})=>`<tr data-tip="inv12:${x.n}"><td>${x.n}</td><td class="n">${brl(r.liq)}</td><td class="n ${r.real>=0?'up':'dn'}">${pct(r.real)}</td><td>${riscoTag(x.risco)}</td></tr>`).join('');
  $('#invGuide').innerHTML='<tr><th>Produto</th><th>Para quem</th><th>Ganhos</th><th>Riscos</th><th>Liquidez</th></tr>'+produtos().map(x=>`<tr><td><b>${x.n}</b></td><td>${x.risco===1?'Reserva de emergência, iniciantes':x.risco===2?'Objetivos de 1–5 anos':'Longo prazo, perfil arrojado'}</td><td>${pct(x.taxa)} a.a. ${x.ir===false?'(isento)':'(bruto)'}</td><td>${x.obs}</td><td>${x.liq}</td></tr>`).join('');
}
// Instituições: spreads típicos sobre o comercial (faixas observadas em 2025–2026; verifique no ato)
const INST=[
 {n:'Wise',tipo:'Instituição de pagamento (autorizada BCB)',esp:null,car:0.9,con:0.9,tarifa:0,seg:'Regulada BCB/FCA',rep:'Ótima',url:'https://wise.com/br'},
 {n:'Nomad',tipo:'Conta global (parceiro banco EUA, FDIC)',esp:null,car:2.0,con:2.0,tarifa:0,seg:'FDIC até US$250 mil',rep:'Ótima',url:'https://www.nomadglobal.com'},
 {n:'Inter Global Account',tipo:'Banco (BCB)',esp:null,car:1.5,con:1.5,tarifa:0,seg:'Banco listado Nasdaq',rep:'Boa',url:'https://inter.co'},
 {n:'C6 Conta Global',tipo:'Banco (BCB)',esp:null,car:2.0,con:2.0,tarifa:0,seg:'Banco regulado BCB',rep:'Regular',url:'https://www.c6bank.com.br'},
 {n:'Banco do Brasil',tipo:'Banco público',esp:6.5,car:4.0,con:3.5,tarifa:0,seg:'Muito alta',rep:'Regular',url:'https://www.bb.com.br'},
 {n:'Itaú',tipo:'Banco privado',esp:7.0,car:4.0,con:4.0,tarifa:0,seg:'Muito alta',rep:'Regular',url:'https://www.itau.com.br'},
 {n:'Bradesco',tipo:'Banco privado',esp:7.0,car:4.0,con:4.0,tarifa:0,seg:'Muito alta',rep:'Regular',url:'https://banco.bradesco'},
 {n:'Daycoval Câmbio',tipo:'Banco (BCB)',esp:3.8,car:3.5,con:2.5,tarifa:0,seg:'Alta',rep:'Boa',url:'https://www.daycoval.com.br'},
 {n:'Confidence Câmbio',tipo:'Corretora de câmbio (BCB)',esp:5.0,car:4.0,con:null,tarifa:0,seg:'Alta',rep:'Boa',url:'https://www.confidencecambio.com.br'},
 {n:'Travelex',tipo:'Banco de câmbio (BCB)',esp:6.0,car:4.5,con:3.0,tarifa:0,seg:'Alta',rep:'Regular',url:'https://www.travelexbank.com.br'},
 {n:'Cartão de crédito comum',tipo:'Qualquer emissor',esp:null,car:5.0,con:null,tarifa:0,seg:'Alta (contestação)',rep:'—',url:'https://www.bcb.gov.br'},
];
const IOF={especie:1.1,cartao:3.5,conta:3.5};
function renderCambio(){
  const sel=$('#cMoeda');if(!sel.options.length)sel.innerHTML=MOEDAS.map(m=>`<option value="${m[0]}">${m[2]} ${m[0]} — ${m[1]}</option>`).join('');
  const c=sel.value,q=+$('#cQtd').value||0,op=$('#cOp').value,fx=S.fx[c];
  if(!fx){$('#instTable').innerHTML='<tr><td>Cotação indisponível no momento.</td></tr>';return;}
  const key={especie:'esp',cartao:'car',conta:'con'}[op];
  const lst=INST.filter(i=>i[key]!=null).map(i=>{const taxa=fx.ask*(1+i[key]/100);const sub=taxa*q;const iof=sub*IOF[op]/100;const tot=sub+iof+i.tarifa;return {i,sp:i[key],taxa,iof,tot,vet:tot/q};}).sort((a,b)=>a.tot-b.tot);
  const best=lst[0]?.tot||0;
  $('#instTable').innerHTML=`<tr><th>#</th><th>Instituição</th><th>Tipo</th><th>Spread</th><th>Cotação c/ spread</th><th>IOF (${pct(IOF[op],1)})</th><th>Total em R$</th><th>VET (R$/${c})</th><th>Diferença p/ melhor</th><th>Segurança</th><th>Reputação*</th></tr>`+
   lst.map((x,k)=>`<tr data-tip="inst:${x.i.n}" class="${k===0?'best':''}"><td>${k+1}</td><td><a href="${x.i.url}" target="_blank" rel="noopener"><b>${x.i.n}</b></a></td><td>${x.i.tipo}</td><td class="n">${pct(x.sp,1)}</td><td class="n">R$ ${num(x.taxa)}</td><td class="n">${brl(x.iof)}</td><td class="n"><b>${brl(x.tot)}</b></td><td class="n">R$ ${num(x.vet)}</td><td class="n ${k?'dn':'up'}">${k?'+'+brl(x.tot-best):'melhor'}</td><td>${x.i.seg}</td><td><a href="https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent(x.i.n)}" target="_blank" rel="noopener">${x.i.rep}</a></td></tr>`).join('')+
   `<tr><td colspan="11" class="note">Comercial agora: R$ ${num(fx.ask)} · Fonte ${fx.src}. *Reputação resumida de Reclame Aqui/ranking BCB — clique para ver a nota atual.</td></tr>`;
}
function renderFocus(){
  if(!S.focus||!S.focus.length){$('#focus').innerHTML='<tr><td>Não foi possível consultar o Focus agora. Veja em <a href="https://www.bcb.gov.br/publicacoes/focus" target="_blank">bcb.gov.br/publicacoes/focus</a>.</td></tr>';return;}
  const anos=[...new Set(S.focus.map(r=>r.DataReferencia))].sort();const ind=['IPCA','Selic','Câmbio','PIB Total'];
  const nome={IPCA:'IPCA (%)',Selic:'Selic fim de ano (%)','Câmbio':'Dólar fim de ano (R$)','PIB Total':'PIB (%)'};
  $('#focus').innerHTML='<tr><th>Indicador</th>'+anos.map(a=>`<th>${a} (mediana)</th><th>mín–máx</th>`).join('')+'</tr>'+ind.map(i=>'<tr data-tip="focus:'+i+'"><td><b>'+nome[i]+'</b></td>'+anos.map(a=>{const r=S.focus.find(x=>x.Indicador===i&&x.DataReferencia===a);return r?`<td class="n">${num(r.Mediana,2)}</td><td class="n">${num(r.Minimo,2)} – ${num(r.Maximo,2)}</td>`:'<td>—</td><td>—</td>';}).join('')+'</tr>').join('');
  $('#focusSrc').textContent='Fonte: Boletim Focus — BCB, divulgação de '+S.focus[0].Data+' (mediana de ~100 instituições).';
}
const CONS=[
 ['💰 Reserva e orçamento',['Reserva de emergência: 6 meses de gastos (12 se autônomo) em Tesouro Selic ou CDB liquidez diária.','Regra 50/30/20: necessidades / desejos / investimentos.','Quite dívidas com juros acima do CDI antes de investir (cartão rotativo passa de 400% a.a.).']],
 ['🏠 Compra e venda de bens (imóveis, veículos)',['Compare financiamento (CET) com o rendimento líquido do dinheiro: se o CET > rendimento, pagar à vista é melhor.','Imóvel: custos de 4–5% (ITBI + cartório) além do preço. Aluguel ideal ≈ 0,4–0,5% do valor/mês.','Venda de imóvel: ganho de capital tem IR de 15% a 22,5%, com isenções (único imóvel até R$ 440 mil; recompra em 180 dias).','Veículo perde ~15–20% no 1º ano; consórcio só vale sem pressa e sem lance alto.']],
 ['💱 Moedas e viagens',['Compre câmbio aos poucos (preço médio) em vez de tudo de uma vez.','Para viagem: conta global (IOF 3,5%, spread baixo) + pouco papel-moeda (IOF 1,1%) para emergências.','Evite trocar no aeroporto e cartão de crédito comum (spread ~5% + IOF).','Avise o banco, leve 2 cartões de bandeiras diferentes e contrate seguro-viagem (obrigatório na Europa — Schengen: cobertura mín. €30 mil).']],
 ['🛡️ Seguros',['Vida: cobertura ≈ 5–10× a renda anual se há dependentes.','Saúde: compare rede, coparticipação e reajuste (ANS regula individuais).','Auto/residencial: cote em 3+ seguradoras ou corretor; verifique registro na SUSEP (susep.gov.br).','Evite seguro "embutido" em empréstimo — é venda casada (proibida).']],
 ['📈 Ações e investimentos',['Defina perfil (conservador/moderado/arrojado) — suitability é obrigatório nas corretoras.','Diversifique: renda fixa + FIIs + ações + exterior (ETFs como IVVB11).','Venda de ações até R$ 20 mil/mês é isenta de IR (swing trade, exceto ETFs).','Use corretoras grandes, verifique registro na CVM e no FGC/B3.']],
 ['🏢 Empreendimentos',['Calcule payback e TIR; o projeto precisa render mais que o CDI líquido + prêmio de risco.','Separe PF e PJ desde o início; MEI até R$ 81 mil/ano, Simples Nacional até R$ 4,8 mi.','Capital de giro: 3–6 meses de custos fixos.','Linhas com juros subsidiados: Pronampe, BNDES, Desenvolve SP etc.']],
 ['📜 Patrimônio e sucessão',['Previdência privada (PGBL se declara completo, VGBL caso contrário) facilita sucessão sem inventário.','Holding familiar costuma compensar acima de patrimônio relevante; avalie com advogado e contador.','Testamento e seguro de vida reduzem custos de inventário (ITCMD 4–8%).']],
];
function renderCons(){$('#consult').innerHTML=CONS.map(([t,l])=>`<div class="card"><h2>${t}</h2><ul>${l.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('');}
function renderDiag(){const r=+$('#dRenda').value||0,g=+$('#dGasto').value||0,res=+$('#dRes').value||0,d=+$('#dDiv').value||0;
  const sobra=r-g,taxa=r?sobra/r*100:0,meses=g?res/g:0,alvo=g*6;
  const p=produtos().find(x=>x.n.startsWith('Tesouro Selic'));const fut=simula(p,res,Math.max(sobra,0),120);
  $('#diag').innerHTML=`<div><b>Taxa de poupança:</b> ${pct(taxa,1)} ${taxa>=20?'✅ ótima':taxa>=10?'⚠️ razoável':'❌ baixa — reveja gastos'}</div>
  <div><b>Reserva:</b> cobre ${num(meses,1)} meses ${meses>=6?'✅':'⚠️ meta '+brl(alvo)}</div>
  <div><b>Dívidas:</b> ${d>0?'priorize quitar ('+brl(d)+') — juros de dívida superam investimentos':'✅ sem dívidas'}</div>
  <div><b>Em 10 anos</b> (sobra mensal no Tesouro Selic): ${brl(fut.liq)} líquidos</div>`;}

function renderAll(){renderKpis();renderFx();renderInv();renderCambio();renderFocus();renderDiag();
  const ok=S.live.fx&&S.live.ind;$('#dot').className='dot'+(ok?' ok':'');
  $('#upd').textContent=(ok?'Ao vivo · ':'Parcial/offline · ')+(S.db?'banco conectado · ':'')+'atualizado '+new Date().toLocaleTimeString('pt-BR');}
// Backend próprio (/api/market): servidor busca as fontes e entrega tudo de uma vez; se falhar, o navegador busca direto.
async function loadServer(){
  if(location.protocol==='file:')return false;
  try{const d=await getJSON('/api/market');
    if(d.fx&&Object.keys(d.fx).length){S.fx=d.fx;S.live.fx=true;}
    if(d.ind){S.ind=d.ind;S.live.ind=true;}
    if(d.focus)S.focus=d.focus;
    if(d.institutions&&d.institutions.length){INST.length=0;d.institutions.forEach(r=>INST.push({n:r.name,tipo:r.kind,esp:r.spread_cash,car:r.spread_card,con:r.spread_account,tarifa:+r.fee||0,seg:r.safety,rep:r.reputation,url:r.url}));}
    S.db=d.db;return S.live.fx&&S.live.ind;
  }catch(e){return false;}}
async function refreshFx(){if(!(await loadServer()))await loadFx();renderAll();}
async function refreshAll(){if(!(await loadServer()))await Promise.all([loadFx(),loadInd()]);renderAll();}

// Navegação por hash
function route(){const h=(location.hash||'#home').slice(1);document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id===h));document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+h));window.scrollTo(0,0);}
addEventListener('hashchange',route);
['#sVal','#sMes','#sPrazo'].forEach(s=>$(s).addEventListener('input',renderInv));
['#cMoeda','#cQtd','#cOp'].forEach(s=>$(s).addEventListener('input',renderCambio));
['#dRenda','#dGasto','#dRes','#dDiv'].forEach(s=>$(s).addEventListener('input',renderDiag));
$('#refresh').addEventListener('click',refreshAll);
route();renderCons();renderAll();refreshAll();
setInterval(refreshFx,60*1000);setInterval(refreshAll,30*60*1000);
$('#salvarSim').addEventListener('click',async()=>{const b={amount:+$('#sVal').value,monthly:+$('#sMes').value,months:+$('#sPrazo').value,result:Object.fromEntries(produtos().map(p=>[p.n,Math.round(simula(p,+$('#sVal').value,+$('#sMes').value,+$('#sPrazo').value).liq)]))};
  try{const r=await fetch('/api/simulations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const d=await r.json();$('#simMsg').textContent=d.ok?'Simulação salva no banco.':'Banco ainda não conectado.';}catch(e){$('#simMsg').textContent='Não foi possível salvar agora.';}});

// ---------- Módulo 2: histórico, PTAX, cripto ----------
function svgChart(series,{fmt=v=>num(v,2)}={}){ // series: [{nome,cor,pts:[[t,v]]}]
  const all=series.flatMap(s=>s.pts);if(!all.length)return '<p class="note">Sem dados no momento.</p>';
  const W=600,H=220,L=48,R=10,T=10,B=24;const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs);let y0=Math.min(...ys),y1=Math.max(...ys);const pad=(y1-y0)*0.1||1;y0-=pad;y1+=pad;
  const X=t=>L+(t-x0)/(x1-x0||1)*(W-L-R),Y=v=>T+(1-(v-y0)/(y1-y0))*(H-T-B);
  let g='';for(let i=0;i<=4;i++){const v=y0+(y1-y0)*i/4;g+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" opacity=".12"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${fmt(v)}</text>`;}
  const d=t=>new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'});
  g+=`<text x="${L}" y="${H-6}">${d(x0)}</text><text x="${W-R}" y="${H-6}" text-anchor="end">${d(x1)}</text>`;
  const lines=series.map(s=>`<polyline fill="none" stroke="${s.cor}" stroke-width="2" points="${s.pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')}"/>`).join('');
  const leg=series.length>1?'<div class="note">'+series.map(s=>`<span style="color:${s.cor}">━</span> ${s.nome}`).join(' &nbsp; ')+'</div>':'';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" style="color:var(--ink)">${g}${lines}</svg>${leg}`;
}
const br2t=s=>{const [d,m,a]=s.split('/');return +new Date(a,m-1,d);};
async function loadJuros(){try{
  const [sel,ipc]=await Promise.all([sgs(4189,24),sgs(13522,24)]);const f=a=>a.map(r=>[br2t(r.data),+r.valor.replace(',','.')]);
  $('#chJuros').innerHTML=svgChart([{nome:'Selic',cor:'#0b6bcb',pts:f(sel)},{nome:'IPCA 12m',cor:'#d9480f',pts:f(ipc)}]);
}catch(e){$('#chJuros').innerHTML='<p class="note">BCB indisponível no momento.</p>';}}
async function loadHist(){const c=$('#cMoeda').value||'USD',n=$('#hDias').value;$('#hNome').textContent=c;
  try{const d=await getJSON(`https://economia.awesomeapi.com.br/json/daily/${c}-BRL/${n}`);
    const pts=d.map(r=>[r.timestamp*1000,+r.bid]).reverse();const v=pts.map(p=>p[1]);
    const ini=v[0],fim=v[v.length-1],var_=(fim/ini-1)*100;
    const rets=v.slice(1).map((x,i)=>Math.log(x/v[i]));const m=rets.reduce((a,b)=>a+b,0)/rets.length;
    const vol=Math.sqrt(rets.reduce((a,b)=>a+(b-m)**2,0)/rets.length)*Math.sqrt(252)*100;
    $('#chFx').innerHTML=svgChart([{nome:c,cor:'#0b6bcb',pts}],{fmt:x=>num(x,x<1?4:2)});
    $('#hStats').innerHTML=`Variação no período: <b class="${var_>=0?'up':'dn'}">${pct(var_)}</b> · Mínima R$ ${num(Math.min(...v))} · Máxima R$ ${num(Math.max(...v))} · Média R$ ${num(v.reduce((a,b)=>a+b,0)/v.length)} · Volatilidade anualizada ${pct(vol,1)} <span title="Quanto maior, mais arriscado comprar tudo de uma vez">(ⓘ)</span>`;
  }catch(e){$('#chFx').innerHTML='<p class="note">Histórico indisponível no momento.</p>';$('#hStats').textContent='';}}
async function loadPtax(){const f=d=>`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}-${d.getFullYear()}`;
  const hoje=new Date(),ini=new Date(Date.now()-12*864e5);
  try{const d=await getJSON(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@i,dataFinalCotacao=@f)?@i='${f(ini)}'&@f='${f(hoje)}'&$format=json&$orderby=dataHoraCotacao%20desc`);
    $('#ptax').innerHTML='<tr><th>Data</th><th>Compra</th><th>Venda</th><th>Spread oficial</th></tr>'+d.value.slice(0,7).map(r=>`<tr><td>${new Date(r.dataHoraCotacao.replace(' ','T')).toLocaleDateString('pt-BR')}</td><td class="n">R$ ${num(r.cotacaoCompra)}</td><td class="n">R$ ${num(r.cotacaoVenda)}</td><td class="n">${pct((r.cotacaoVenda/r.cotacaoCompra-1)*100,3)}</td></tr>`).join('');
  }catch(e){$('#ptax').innerHTML='<tr><td>PTAX indisponível. Consulte <a href="https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes" target="_blank">bcb.gov.br</a>.</td></tr>';}}
async function loadCripto(){try{const d=await getJSON('https://economia.awesomeapi.com.br/json/last/BTC-BRL,ETH-BRL,BTC-USD,ETH-USD');
  $('#cripto').innerHTML='<tr><th>Ativo</th><th>Preço</th><th>Var. 24h</th><th>Mín – Máx</th></tr>'+Object.values(d).map(q=>`<tr><td><b>${q.code}/${q.codein}</b></td><td class="n">${q.codein==='BRL'?brl(+q.bid):'US$ '+num(+q.bid,2)}</td><td class="n ${+q.pctChange>=0?'up':'dn'}">${pct(+q.pctChange)}</td><td class="n">${num(+q.low,0)} – ${num(+q.high,0)}</td></tr>`).join('');
}catch(e){$('#cripto').innerHTML='<tr><td>Cotações cripto indisponíveis.</td></tr>';}}
$('#cMoeda').addEventListener('change',loadHist);$('#hDias').addEventListener('change',loadHist);
loadJuros();loadHist();loadPtax();loadCripto();
setInterval(()=>{loadCripto();loadPtax();},5*60*1000);setInterval(loadHist,30*60*1000);


// ---------- Explicação ao parar o cursor 4 s sobre uma linha ----------
const TIP_MS=4000;
const tipBox=document.createElement('div');tipBox.id='tip';tipBox.setAttribute('role','tooltip');document.body.appendChild(tipBox);
const sec=(t,b)=>`<h4>${t}</h4>${b}`;
const cmp=(a,b)=>`<span class="${a>=b?'up':'dn'}">${a>=b?'+':''}${brl(a-b)}</span>`;
function tipFx(c){const q=S.fx[c];const m=MOEDAS.find(x=>x[0]===c);if(!q)return '';
  const spread=(q.ask/q.bid-1)*100,amp=(q.high/q.low-1)*100,mil=q.ask*1000;
  const usd=S.fx.USD;const vsUsd=usd?usd.bid/q.bid:null;
  const melhor=Math.min(...INST.filter(i=>i.con!=null).map(i=>i.con)),pior=Math.max(...INST.filter(i=>i.esp!=null).map(i=>i.esp));
  return sec(`${m[2]} ${m[1]} (${c})`,`<p>1 ${c} custa <b>R$ ${num(q.ask)}</b> no mercado comercial (venda). Quem vende ${c} recebe R$ ${num(q.bid)} (compra).</p>`)+
   sec('Como ler',`<ul><li><b>Compra x venda:</b> diferença de ${pct(spread,3)} — é o spread do atacado; no varejo ele é bem maior.</li><li><b>Variação do dia:</b> ${q.pct>=0?'subiu':'caiu'} ${pct(Math.abs(q.pct))}; ${q.pct>=0?'o Real perdeu valor frente a ela hoje':'o Real ganhou valor frente a ela hoje'}.</li><li><b>Amplitude do dia:</b> ${pct(amp)} entre mínima e máxima — ${amp>1.5?'dia volátil, cuidado ao comprar tudo de uma vez':'oscilação normal'}.</li></ul>`)+
   sec('Comparativo prático — comprar 1.000 '+c,`<table><tr><td>Comercial (referência)</td><td class="n">${brl(mil)}</td></tr><tr><td>Conta global (melhor spread ${pct(melhor,1)} + IOF 3,5%)</td><td class="n">${brl(mil*(1+melhor/100)*1.035)}</td></tr><tr><td>Papel-moeda em casa de câmbio (~4% + IOF 1,1%)</td><td class="n">${brl(mil*1.04*1.011)}</td></tr><tr><td>Papel-moeda em banco grande (${pct(pior,1)} + IOF 1,1%)</td><td class="n">${brl(mil*(1+pior/100)*1.011)}</td></tr><tr><td>Cartão de crédito comum (5% + IOF 3,5%)</td><td class="n">${brl(mil*1.05*1.035)}</td></tr></table>`)+
   (vsUsd&&c!=='USD'?`<p class="note">Em dólar: 1 ${c} = US$ ${num(1/vsUsd,4)} · 1 US$ = ${num(vsUsd,4)} ${c}.</p>`:'')+`<p class="note">Fonte: ${q.src} · ${q.ts||''}</p>`;}
function tipInv(nome,meses,valor,mes){const ps=produtos();const p=ps.find(x=>x.n===nome);if(!p)return '';
  const r=simula(p,valor,mes,meses);const all=ps.map(x=>({x,r:simula(x,valor,mes,meses)})).sort((a,b)=>b.r.liq-a.r.liq);
  const poup=all.find(o=>o.x.n==='Poupança').r,best=all[0],pos=all.findIndex(o=>o.x.n===nome)+1;
  const aliq=p.ir===true?irAliq(Math.round(meses*30.44)):p.ir==='acao'?15:0;
  const prox=p.ir===true&&Math.round(meses*30.44)<=720?[180,360,720].find(d=>d>=Math.round(meses*30.44)):null;
  return sec(p.n,`<p>${p.obs}</p>`)+
   sec(`Resultado em ${meses} meses (${brl(valor)}${mes?` + ${brl(mes)}/mês`:''})`,`<table><tr><td>Taxa usada</td><td class="n">${pct(p.taxa)} a.a.</td></tr><tr><td>Investido</td><td class="n">${brl(r.inv)}</td></tr><tr><td>Bruto</td><td class="n">${brl(r.bruto)}</td></tr><tr><td>Imposto de renda</td><td class="n">${aliq?brl(r.ir)+' ('+num(aliq,1)+'%)':'isento'}</td></tr><tr><td><b>Líquido no resgate</b></td><td class="n"><b>${brl(r.liq)}</b></td></tr><tr><td>Rentabilidade líquida anualizada</td><td class="n">${pct(r.anual)}</td></tr><tr><td>Ganho acima da inflação</td><td class="n ${r.real>=0?'up':'dn'}">${pct(r.real)}</td></tr></table>`)+
   sec('Comparativo',`<ul><li>Posição: <b>${pos}º de ${all.length}</b> no prazo escolhido.</li><li>Contra a poupança: ${cmp(r.liq,poup.liq)}.</li><li>Contra o melhor (${best.x.n}): ${cmp(r.liq,best.r.liq)}${best.x.risco>p.risco?' — mas com risco maior':''}.</li>${prox?`<li>Esperando até ${prox+1} dias o IR cai para ${irAliq(prox+1)}%.</li>`:''}</ul>`)+
   sec('Riscos e liquidez',`<ul><li><b>Risco:</b> ${['','baixo','médio','alto'][p.risco]}${p.fgc?' — coberto pelo FGC até R$ 250 mil':' — sem FGC'}.</li><li><b>Liquidez:</b> ${p.liq}.</li>${p.n.includes('IPCA')||p.n.includes('Prefixado')?'<li>Resgate antes do vencimento usa o preço de mercado do dia: pode ganhar ou perder.</li>':''}${p.risco===3?'<li>Rentabilidade estimada por média histórica, <b>não garantida</b>.</li>':''}</ul>`);}
function tipInst(nome){const i=INST.find(x=>x.n===nome);if(!i)return '';
  const c=$('#cMoeda').value,q=+$('#cQtd').value||0,op=$('#cOp').value,fx=S.fx[c];if(!fx)return '';
  const key={especie:'esp',cartao:'car',conta:'con'}[op],sp=i[key];const base=fx.ask*q,sprd=base*sp/100,iof=(base+sprd)*IOF[op]/100,tot=base+sprd+iof+i.tarifa;
  const outros=INST.filter(x=>x[key]!=null).map(x=>({n:x.n,t:fx.ask*q*(1+x[key]/100)*(1+IOF[op]/100)})).sort((a,b)=>a.t-b.t);
  return sec(i.n,`<p>${i.tipo}. Segurança: <b>${i.seg}</b>. Reputação: <b>${i.rep}</b>.</p>`)+
   sec(`Decomposição do custo de ${num(q,0)} ${c}`,`<table><tr><td>Valor no câmbio comercial</td><td class="n">${brl(base)}</td></tr><tr><td>Spread da instituição (${pct(sp,1)})</td><td class="n">${brl(sprd)}</td></tr><tr><td>IOF (${pct(IOF[op],1)})</td><td class="n">${brl(iof)}</td></tr><tr><td>Tarifas</td><td class="n">${brl(i.tarifa)}</td></tr><tr><td><b>Total</b></td><td class="n"><b>${brl(tot)}</b></td></tr></table><p>Você paga ${pct((tot/base-1)*100)} acima do comercial.</p>`)+
   sec('Comparativo',`<ul><li>Mais barata: ${outros[0].n} (${brl(outros[0].t)}) — ${outros[0].n===i.n?'<b>é esta</b>':'diferença '+cmp(outros[0].t,tot).replace('+','')+' a mais aqui'}.</li><li>Mais cara: ${outros.at(-1).n} (${brl(outros.at(-1).t)}).</li><li>Economia potencial entre a pior e a melhor: ${brl(outros.at(-1).t-outros[0].t)}.</li></ul><p class="note">Spreads são referências típicas; confirme no app/loja antes de fechar.</p>`);}
const FOCUS_TXT={IPCA:['Inflação oficial esperada para o ano.','ipca12','Acima de 4,5% (teto da meta) o BC tende a manter juros altos.'],Selic:['Taxa básica esperada no fim do ano.','selic','Selic caindo = renda fixa pós-fixada rende menos; prefixados e ações tendem a se valorizar.'],'Câmbio':['Dólar esperado no fim do ano.',null,'Se a mediana está acima da cotação atual, o mercado espera Real mais fraco.'],'PIB Total':['Crescimento da economia esperado.',null,'PIB forte favorece lucros das empresas e a bolsa.']};
function tipFocus(i){const t=FOCUS_TXT[i];if(!t)return '';const rs=(S.focus||[]).filter(r=>r.Indicador===i).sort((a,b)=>a.DataReferencia-b.DataReferencia);
  const atual=i==='Câmbio'?S.fx.USD?.bid:t[1]?S.ind[t[1]]:null;
  return sec(i,`<p>${t[0]}</p>`)+(rs.length?sec('Projeções x hoje',`<table><tr><th>Ano</th><th>Mediana</th><th>Faixa (mín–máx)</th>${atual!=null?'<th>vs. hoje</th>':''}</tr>${rs.map(r=>`<tr><td>${r.DataReferencia}</td><td class="n">${num(r.Mediana,2)}</td><td class="n">${num(r.Minimo,2)}–${num(r.Maximo,2)}</td>${atual!=null?`<td class="n">${r.Mediana>=atual?'▲':'▼'} ${num(r.Mediana-atual,2)}</td>`:''}</tr>`).join('')}</table>${atual!=null?`<p>Valor atual: <b>${num(atual,2)}</b>.</p>`:''}`):'')+sec('O que significa',`<p>${t[2]}</p><p class="note">Faixa larga entre mínimo e máximo = mais incerteza entre os analistas.</p>`);}
function tipGeneric(tr){const tb=tr.closest('table');const hs=[...tb.querySelectorAll('tr:first-child th')].map(t=>t.textContent);
  const cs=[...tr.children];if(!hs.length||!cs.length)return '';
  const card=tr.closest('.card');const tit=card?.querySelector('h2')?.textContent||'';const src=card?.querySelector('.src')?.innerHTML||'';
  return sec(cs[0].textContent,`<p class="note">${tit}</p><table>${cs.map((c,k)=>hs[k]&&k?`<tr><td>${hs[k]}</td><td>${c.innerHTML}</td></tr>`:'').join('')}</table>`)+(src?`<p class="note">${src}</p>`:'');}
function tipFor(tr){const k=tr.dataset.tip||'';const [t,...r]=k.split(':');const v=r.join(':');
  const val=+$('#sVal').value||0,mes=+$('#sMes').value||0,pr=Math.max(1,+$('#sPrazo').value||1);
  return (t==='fx'&&tipFx(v))||(t==='inv'&&tipInv(v,pr,val,mes))||(t==='inv12'&&tipInv(v,12,10000,0))||(t==='inst'&&tipInst(v))||(t==='focus'&&tipFocus(v))||tipGeneric(tr);}
let tipTimer=null,tipRow=null,mx=0,my=0;
function hideTip(){clearTimeout(tipTimer);tipBox.classList.remove('on');tipRow?.classList.remove('tipping');tipRow=null;}
function placeTip(){const w=tipBox.offsetWidth,h=tipBox.offsetHeight,W=innerWidth,H=innerHeight;
  let x=mx+16,y=my+16;if(x+w>W-8)x=Math.max(8,mx-w-16);if(y+h>H-8)y=Math.max(8,H-h-8);tipBox.style.left=x+'px';tipBox.style.top=y+'px';}
function arm(tr){clearTimeout(tipTimer);tipRow?.classList.remove('tipping');tipRow=tr;tr.classList.add('tipping');
  tipTimer=setTimeout(()=>{const h=tipFor(tr);if(!h)return;tipBox.innerHTML=h+'<p class="note tipclose">Mova o cursor para fechar.</p>';tipBox.classList.add('on');placeTip();},TIP_MS);}
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(tipBox.contains(e.target))return;
  const tr=e.target.closest('main table tr');const valid=tr&&tr.querySelector('td')&&!tr.closest('#tip');
  if(tipBox.classList.contains('on')){if(Math.hypot(e.movementX,e.movementY)>2)hideTip();else return;}
  if(!valid){if(tipRow)hideTip();return;}
  arm(tr);}); // qualquer movimento reinicia a contagem: só abre com o cursor parado 4 s
document.addEventListener('scroll',hideTip,true);
// Toque: pressionar e segurar 1 s abre a explicação
let lp;document.addEventListener('touchstart',e=>{const tr=e.target.closest('main table tr');if(!tr||!tr.querySelector('td'))return;const t=e.touches[0];mx=t.clientX;my=t.clientY;lp=setTimeout(()=>{tipBox.innerHTML=tipFor(tr)+'<p class="note tipclose">Toque fora para fechar.</p>';tipBox.classList.add('on');placeTip();},1000);},{passive:true});
document.addEventListener('touchend',()=>clearTimeout(lp));document.addEventListener('touchstart',e=>{if(!tipBox.contains(e.target)&&!e.target.closest('main table tr'))hideTip();},{passive:true});
