'use strict';
// Pacotes complementares de proteção + planejamento por perfil de cliente.
// Valores: faixas de seguros.js (base de preços jun/2025) corrigidas pelo IPCA 12m ao vivo (S.ind.ipca12, BCB)
// e premissas de planejamento usando Selic/CDI/IPCA do momento.
const PAC_BASE=new Date(2025,5,1); // data-base das faixas de prêmio
const pacFator=()=>{const m=Math.max(0,(Date.now()-PAC_BASE)/2.63e9);return Math.pow(1+(S.ind.ipca12||4.5)/100,m/12);};

// Perfis prontos (preenchem o questionário)
const PAC_PERFIS={
 jovem:{n:'Jovem solteiro(a) CLT',idade:26,civil:'solteiro',dep:0,renda:5500,gasto:4000,ocup:'clt',moradia:'aluga',aluguel:1800,imovel:0,veic:0,divida:0,reserva:4000,saude:'empresa',viagem:1,pet:0,bens:7000,empresa:0,dados:'nao',fumante:'nao',horiz:'longo',obj:['reserva','aposentadoria','imovel']},
 familia:{n:'Família com filhos',idade:38,civil:'casado',dep:2,renda:16000,gasto:12500,ocup:'clt',moradia:'financiada',aluguel:0,imovel:650000,veic:95000,divida:380000,reserva:30000,saude:'empresa',viagem:1,pet:1,bens:10000,empresa:0,dados:'nao',fumante:'nao',horiz:'longo',obj:['reserva','educacao','aposentadoria']},
 autonomo:{n:'Autônomo / profissional liberal',idade:42,civil:'casado',dep:1,renda:20000,gasto:13000,ocup:'liberal',moradia:'propria',aluguel:0,imovel:800000,veic:120000,divida:0,reserva:60000,saude:'nao',viagem:2,pet:0,bens:15000,empresa:0,dados:'sim',fumante:'nao',horiz:'longo',obj:['reserva','aposentadoria','sucessao']},
 empresario:{n:'Empresário(a) PME',idade:47,civil:'casado',dep:2,renda:35000,gasto:22000,ocup:'empresario',moradia:'propria',aluguel:0,imovel:1500000,veic:220000,divida:150000,reserva:120000,saude:'individual',viagem:3,pet:1,bens:30000,empresa:900000,dados:'sim',fumante:'nao',horiz:'longo',obj:['sucessao','aposentadoria','empresa']},
 aposentado:{n:'Aposentado(a)',idade:67,civil:'casado',dep:0,renda:9000,gasto:7500,ocup:'aposentado',moradia:'propria',aluguel:0,imovel:700000,veic:70000,divida:0,reserva:250000,saude:'individual',viagem:2,pet:1,bens:6000,empresa:0,dados:'nao',fumante:'nao',horiz:'curto',obj:['renda','sucessao','viagens']},
 rural:{n:'Produtor(a) rural',idade:50,civil:'casado',dep:2,renda:25000,gasto:15000,ocup:'rural',moradia:'propria',aluguel:0,imovel:500000,veic:180000,divida:400000,reserva:80000,saude:'nao',viagem:0,pet:2,bens:5000,empresa:2500000,dados:'nao',fumante:'nao',horiz:'medio',obj:['empresa','sucessao','reserva']},
 expat:{n:'Viajante frequente / renda em moeda forte',idade:34,civil:'solteiro',dep:0,renda:18000,gasto:11000,ocup:'liberal',moradia:'aluga',aluguel:4000,imovel:0,veic:0,divida:0,reserva:40000,saude:'individual',viagem:6,pet:0,bens:25000,empresa:0,dados:'sim',fumante:'nao',horiz:'medio',obj:['internacional','reserva','aposentadoria']},
};
const OBJ={reserva:'Reserva de emergência',aposentadoria:'Aposentadoria',imovel:'Comprar imóvel',educacao:'Educação dos filhos',sucessao:'Sucessão / herança',empresa:'Crescer a empresa',renda:'Viver de renda',viagens:'Viajar',internacional:'Patrimônio no exterior'};

// Questionário: [id, pergunta, tipo, opções, por que perguntar]
const PAC_Q=[
 ['idade','Idade do titular','n',null,'Define prêmio de vida/saúde, horizonte e tolerância a risco.'],
 ['civil','Estado civil','s',[['solteiro','Solteiro(a)'],['casado','Casado(a) / união estável'],['divorciado','Divorciado(a)'],['viuvo','Viúvo(a)']],'Cônjuge depende da renda? Regime de bens muda a sucessão.'],
 ['dep','Dependentes financeiros (filhos, pais, cônjuge sem renda)','n',null,'Principal gatilho do seguro de vida: quem ficaria sem renda?'],
 ['renda','Renda mensal líquida da família (R$)','n',null,'Base do orçamento de proteção (5–10%) e do capital de vida.'],
 ['gasto','Gastos mensais (R$)','n',null,'Mede capacidade de poupança e o tamanho da reserva.'],
 ['ocup','Ocupação','s',[['clt','CLT'],['servidor','Servidor público'],['liberal','Autônomo / profissional liberal'],['empresario','Empresário(a)'],['rural','Produtor(a) rural'],['aposentado','Aposentado(a)'],['estudante','Estudante / sem renda fixa']],'Autônomo não tem FGTS/auxílio-doença robusto: precisa de DIT e reserva maior.'],
 ['moradia','Moradia','s',[['propria','Própria quitada'],['financiada','Própria financiada'],['aluga','Aluga'],['familia','Mora com a família']],'Define residencial, prestamista, fiança.'],
 ['imovel','Valor do imóvel próprio (R$)','n',null,'Base do residencial e do patrimônio sucessório.'],
 ['aluguel','Aluguel mensal (R$)','n',null,'Fiança locatícia vs. caução.'],
 ['veic','Valor FIPE dos veículos (R$)','n',null,'Base do seguro auto.'],
 ['divida','Saldo de dívidas/financiamentos (R$)','n',null,'Soma ao capital de vida; avalia prestamista.'],
 ['reserva','Reserva de emergência atual (R$)','n',null,'Sem reserva, franquias e carências viram problema: prioridade nº 1.'],
 ['saude','Plano de saúde atual','s',[['empresa','Pelo empregador'],['individual','Individual/adesão/MEI'],['nao','Não tem'],['sus','Usa só SUS']],'Plano pelo empregador termina na demissão/aposentadoria.'],
 ['viagem','Viagens internacionais por ano','n',null,'Seguro viagem pontual vs. anual multiviagem.'],
 ['pet','Pets (cães/gatos)','n',null,'Plano pet e RC por danos do animal.'],
 ['bens','Celular, notebook, joias, equipamentos (R$)','n',null,'Bens portáteis — compare prêmio com franquia.'],
 ['empresa','Patrimônio da empresa / safra (R$)','n',null,'Empresarial, rural, lucros cessantes.'],
 ['dados','Guarda dados de clientes ou presta serviço técnico?','s',[['nao','Não'],['sim','Sim']],'RC profissional e riscos cibernéticos (LGPD).'],
 ['fumante','Fumante?','s',[['nao','Não'],['sim','Sim']],'Fumante paga 40–100% a mais em vida — declarar é obrigatório.'],
 ['horiz','Horizonte principal','s',[['curto','Curto (até 2 anos)'],['medio','Médio (2–7 anos)'],['longo','Longo (7+ anos)']],'Define onde aplicar e quanto pode oscilar.'],
];

function pacLe(){const P={};PAC_Q.forEach(([id,,t])=>{const el=document.getElementById('pq_'+id);P[id]=t==='n'?(+el.value||0):el.value;});
  P.obj=[...document.querySelectorAll('#pqObj input:checked')].map(i=>i.value);return P;}
function pacPreenche(k){const p=PAC_PERFIS[k];if(!p)return;PAC_Q.forEach(([id])=>{const el=document.getElementById('pq_'+id);if(el&&p[id]!=null)el.value=p[id];});
  document.querySelectorAll('#pqObj input').forEach(i=>i.checked=p.obj.includes(i.value));
  document.querySelectorAll('#pacPerfis button').forEach(b=>b.classList.toggle('on',b.dataset.p===k));renderPac();}

// Motor de recomendação: cada item tem prioridade (1 essencial, 2 recomendado, 3 complementar) e motivo.
function pacItens(P){const anual=P.renda*12,I=[];const f=pacFator();
  const capital=Math.round((P.dep?Math.max(5,Math.min(10,3+P.dep*2)):2)*anual+P.divida);
  const add=(id,prio,motivo,base)=>{const s=segBy(id);if(!s)return;const est=estimaSeg(s,{idade:P.idade,dias:Math.max(P.viagem,0)*10,aluguel:P.aluguel,valor:base??capital,imovel:base??P.imovel,veiculo:base??P.veic,bens:base??P.bens,empresa:base??P.empresa,divida:base??P.divida})*f*(id==='vida'&&P.fumante==='sim'?1.6:1);
    I.push({s,prio,motivo,anual:est,base});};
  const semRenda=['estudante'].includes(P.ocup);
  // Saúde
  if(P.saude==='nao'||P.saude==='sus')add('saude',1,'Sem plano: uma internação privada custa R$ 5–30 mil/dia. É o maior risco financeiro de curto prazo.');
  else if(P.saude==='empresa')add('saude',P.ocup==='clt'&&P.idade>=50?1:3,'Plano do empregador acaba na demissão/aposentadoria. Planeje a transição (art. 30/31 da Lei 9.656) e guarde reserva para isso.');
  // Vida
  if(P.dep>0||P.divida>0)add('vida',1,`${P.dep?P.dep+' dependente(s)':'Dívidas em aberto'}: capital sugerido ${brl(capital)} (${P.dep?'3–10× renda anual':'quitar dívidas'} + saldo devedor). Indenização sem IR e fora do inventário.`);
  else if(!semRenda&&P.renda>0)add('vida',3,'Sem dependentes: vida com foco em invalidez e doenças graves protege a sua própria renda.',Math.round(anual*2));
  // Renda (autônomos)
  if(['liberal','empresario'].includes(P.ocup))I.push({s:{id:'dit',n:'Diária por Incapacidade (DIT)',ic:'pulse'},prio:1,motivo:'Autônomo sem afastamento remunerado: DIT paga diárias se você não puder trabalhar.',anual:Math.max(600,P.renda*0.025*12*0.25)*f});
  // Moradia
  if(P.moradia==='propria'||P.moradia==='financiada')add('residencial',P.moradia==='financiada'?1:2,P.moradia==='financiada'?'Financiado: MIP/DFI do banco não cobre bens, danos elétricos nem RC. Residencial é barato e traz assistência 24h.':'Imóvel é o maior patrimônio da família; custo de 0,05–0,3% ao ano.',P.imovel);
  if(P.moradia==='aluga'){add('residencial',2,'Inquilino: cobre seus bens, RC perante o proprietário e assistência 24h por poucos reais/mês.',Math.max(P.aluguel*100,150000));
    if(P.aluguel>0)add('fianca',3,'Só se não tiver fiador: compare com caução (devolvida corrigida) — fiança não volta.');}
  if(P.moradia==='financiada'&&P.divida>0)add('prestamista',P.dep>0&&!I.find(x=>x.s.id==='vida')?1:3,'Já existe MIP no financiamento; prestamista extra só se a renda for única. Recusar venda casada é seu direito.');
  // Auto
  if(P.veic>0)add('auto',P.veic>=40000?1:2,P.veic>=40000?'Veículo de valor relevante: perda total sem seguro destrói a reserva. RCF ≥ R$ 100 mil é indispensável.':'Veículo de menor valor: avalie só RCF (terceiros) + roubo — casco pode não compensar.',P.veic);
  // Viagem
  if(P.viagem>0)add('viagem',P.viagem>=1?2:3,P.viagem>=3?'Viaja muito: apólice anual multiviagem costuma sair mais barata que avulsas.':'Obrigatório no Schengen (€ 30 mil); EUA pedem ≥ US$ 100 mil.');
  if(P.bens>=5000)add('bens',3,'Compare prêmio anual com a franquia (15–25%). Faz sentido para itens caros e uso intenso fora de casa.',P.bens);
  if(P.pet>0)add('pet',3,`${P.pet} pet(s): cirurgia veterinária custa R$ 3–15 mil. Alternativa: reserva específica.`);
  if(P.ocup==='empresario'&&P.empresa>0)add('empresarial',1,'Lucros cessantes mantém a empresa pagando salários e fornecedores após um sinistro.',P.empresa);
  if(P.ocup==='rural'&&P.empresa>0)add('rural',1,'Safra é a renda do ano; use a subvenção federal (PSR) de 20–40% do prêmio. Exigido em custeio.',P.empresa);
  if(P.dados==='sim'||P.ocup==='liberal')add('rc',P.ocup==='liberal'?1:2,'Erro profissional gera processos que alcançam o patrimônio pessoal; o seguro paga defesa e indenização.');
  if(P.dados==='sim'&&P.ocup==='empresario')add('cyber',2,'Dados de clientes: multas LGPD e ransomware. Seguradoras exigem MFA e backup.');
  return {itens:I.sort((a,b)=>a.prio-b.prio||b.anual-a.anual),capital};}

const PRIO=['','Essencial','Recomendado','Complementar'],PRIOTAG=['','t3','t2','t1'];
function renderPac(){if(!$('#pacOut'))return;const P=pacLe();const {itens,capital}=pacItens(P);const f=pacFator();
  const anual=P.renda*12||1,sobra=P.renda-P.gasto,resIdeal=P.gasto*(['liberal','empresario','rural'].includes(P.ocup)?12:6);
  const pacotes=[['Essencial','Só o que é indispensável: riscos que quebrariam a família.',1],['Recomendado','Essencial + o que tem melhor custo-benefício para o perfil.',2],['Completo','Todos os seguros aplicáveis ao perfil.',3]]
    .map(([n,d,lim])=>{const L=itens.filter(x=>x.prio<=lim);const t=L.reduce((a,x)=>a+x.anual,0);return {n,d,L,t};});
  const i=S.ind,real=((1+i.selic/100)/(1+i.ipca12/100)-1)*100;
  $('#pacPrem').innerHTML=[['IPCA 12m (correção de prêmios)',pct(i.ipca12),S.live.ind?'BCB · '+(i.data||'ao vivo'):'referência (offline)'],['Fator sobre preços de jun/2025','×'+num(f,3),'atualizado automaticamente'],['Selic / CDI',pct(i.selic)+' / '+pct(i.cdi),'premissa do planejamento'],['Juro real',pct(real),real>5?'favorece renda fixa':'avaliar diversificação']]
    .map(x=>`<div class="kpi"><div class="l">${x[0]}</div><div class="v">${x[1]}</div><div class="s">${x[2]}</div></div>`).join('');
  $('#pacOut').innerHTML=pacotes.map((p,k)=>`<div class="card"><h2>${['🛡️','⭐','🏆'][k]} Pacote ${p.n}</h2><p class="note">${p.d}</p>
    <div class="tw"><table><tr><th>Seguro</th><th>Prioridade</th><th>Anual</th><th>Mensal</th></tr>${p.L.map(x=>`<tr${x.s.cobre?` data-tip="seg:${x.s.id}"`:''}><td>${ico(x.s.ic)}${x.s.n}</td><td><span class="tag ${PRIOTAG[x.prio]}">${PRIO[x.prio]}</span></td><td class="n">${brl(x.anual)}</td><td class="n">${brl(x.anual/12)}</td></tr>`).join('')||'<tr><td colspan="4" class="note">Nenhum item nesta faixa.</td></tr>'}
    <tr class="best"><td><b>Total</b></td><td></td><td class="n"><b>${brl(p.t)}</b></td><td class="n"><b>${brl(p.t/12)}</b></td></tr></table></div>
    <p class="note">${pct(p.t/anual*100,1)} da renda anual — ${p.t/anual>0.10?'<span class="dn">acima da faixa de 5–10%: priorize o Essencial e revise franquias.</span>':p.t/anual>=0.05?'dentro da faixa saudável (5–10%).':'abaixo de 5%: cabe no orçamento.'}</p></div>`).join('');
  $('#pacPrio').innerHTML='<tr><th>#</th><th>Seguro</th><th>Nível</th><th>Por que (motivo para o cliente)</th><th>Estimativa anual</th></tr>'+
    [{s:{n:'Reserva de emergência',ic:'wallet'},prio:P.reserva<resIdeal?1:3,motivo:P.reserva<resIdeal?`Tem ${brl(P.reserva)} de ${brl(resIdeal)} ideais. Vem antes de qualquer seguro: paga franquias, carências e imprevistos pequenos.`:'Reserva completa — mantenha em Tesouro Selic/CDB liquidez diária.',anual:null},...itens]
     .sort((a,b)=>a.prio-b.prio).map((x,k)=>`<tr${x.s.cobre?` data-tip="seg:${x.s.id}"`:''}><td>${k+1}</td><td><b>${ico(x.s.ic||'')}${x.s.n}</b></td><td><span class="tag ${PRIOTAG[x.prio]}">${PRIO[x.prio]}</span></td><td>${x.motivo}</td><td class="n">${x.anual!=null?brl(x.anual):'—'}</td></tr>`).join('');
  // Planejamento
  const aporte=Math.max(sobra,0),meses=Math.max(0,Math.ceil((resIdeal-P.reserva)/Math.max(aporte*0.7,1)));
  const essencialM=pacotes[0].t/12,livre=Math.max(aporte-essencialM,0);
  const fv=(pm,a,anos)=>{const r=Math.pow(1+(i.selic-0.2)/100*(1-0.15),1/12)-1,n=anos*12;return a*Math.pow(1+r,n)+pm*(Math.pow(1+r,n)-1)/r;};
  const realFv=(v,anos)=>v/Math.pow(1+i.ipca12/100,anos);
  const objTxt=P.obj.map(o=>OBJ[o]).join(', ')||'não informados';
  const fases=[
   ['Curto prazo — 0 a 12 meses',[
     sobra<=0?`<b>Urgente:</b> gastos (${brl(P.gasto)}) ≥ renda (${brl(P.renda)}). Corte 10–15% dos gastos antes de contratar qualquer coisa além do Essencial.`:`Sobra mensal de ${brl(sobra)}: destine ~70% à reserva até completá-la${meses?` (≈ ${meses} meses)`:' (já completa)'}.`,
     `Contratar o Pacote Essencial (${brl(essencialM)}/mês) — itens com selo vermelho, em ordem.`,
     P.divida>0?'Quitar/renegociar dívidas com juros acima do CDI ('+pct(i.cdi)+'); manter só financiamento imobiliário.':'Sem dívidas: manter assim — use o cartão só à vista.',
     'Reunir apólices existentes (cartão, banco, empregador) para não pagar coberturas em duplicidade.']],
   ['Médio prazo — 1 a 5 anos',[
     'Migrar para o Pacote Recomendado conforme a reserva se completar.',
     `Aportar ${brl(livre)}/mês após seguros: em 5 anos ≈ ${brl(fv(livre,P.reserva,5))} (Tesouro Selic líquido) — ${brl(realFv(fv(livre,P.reserva,5),5))} em poder de compra de hoje.`,
     P.obj.includes('imovel')?'Imóvel: compare financiar agora vs. juntar entrada de 30%+ — juros acompanham a Selic.':P.obj.includes('educacao')?'Educação: Tesouro Educa+ ou IPCA+ com vencimento na idade universitária.':'Diversificar: IPCA+ para metas de longo prazo, pós-fixado para liquidez.',
     'Revisar capital de vida e limites a cada evento: casamento, filho, imóvel, promoção.']],
   ['Longo prazo — 5+ anos',[
     P.idade<55?`Aposentadoria: ${P.ocup==='clt'||P.ocup==='servidor'?'PGBL até 12% da renda tributável (dedução de IR) se declara no completo':'VGBL/IPCA+ — autônomo não tem FGTS, precisa de disciplina própria'}.`:'Aposentadoria próxima: montar carteira de renda (IPCA+, LCI/LCA, dividendos) e rever plano de saúde (reajuste por idade).',
     `Em 20 anos, mantendo o aporte: ≈ ${brl(realFv(fv(livre,P.reserva,20),20))} em valores de hoje.`,
     P.dep>0||P.obj.includes('sucessao')?'Sucessão: seguro de vida e previdência VGBL ficam fora do inventário (custa 10–20% do patrimônio). Avaliar testamento/holding acima de R$ 2 mi.':'Sem dependentes: priorize invalidez e longevidade sobre morte.',
     P.obj.includes('internacional')?'Patrimônio no exterior: conta global/ETFs dolarizados — atenção à Lei 14.754 (IR 15% anual sobre aplicações no exterior).':'Rever o pacote completo a cada 3 anos e a cada renovação (reajuste ≈ IPCA).']]];
  $('#pacPlano').innerHTML=fases.map(([t,L])=>`<div class="card"><h2>${t}</h2><ul>${L.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('');
  $('#pacResumo').innerHTML=`<div><b>Perfil:</b> ${PAC_Q[5][3].find(o=>o[0]===P.ocup)[1]}, ${P.idade} anos, ${P.dep} dependente(s)</div><div><b>Objetivos:</b> ${objTxt}</div><div><b>Capacidade de poupança:</b> ${pct(Math.max(sobra,0)/(P.renda||1)*100,0)} da renda</div><div><b>Reserva:</b> ${brl(P.reserva)} / ${brl(resIdeal)} ideal</div><div><b>Capital de vida sugerido:</b> ${brl(capital)}</div><div><b>Orçamento de proteção (5–10%):</b> ${brl(anual*0.05/12)} – ${brl(anual*0.10/12)}/mês</div>`;}

function initPac(){const box=$('#pacQ');if(!box)return;
  $('#pacPerfis').innerHTML=Object.entries(PAC_PERFIS).map(([k,p])=>`<button type="button" data-p="${k}">${p.n}</button>`).join('');
  box.innerHTML=PAC_Q.map(([id,q,t,o,why])=>`<label title="${why}">${q}${t==='n'?`<input id="pq_${id}" type="number" min="0">`:`<select id="pq_${id}">${o.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>`}<span class="note">${why}</span></label>`).join('');
  $('#pqObj').innerHTML='<span class="note">Objetivos (marque todos):</span> '+Object.entries(OBJ).map(([v,l])=>`<label style="display:inline-flex;gap:4px;margin-right:12px"><input type="checkbox" value="${v}">${l}</label>`).join('');
  $('#pacPerfis').addEventListener('click',e=>{const b=e.target.closest('button');if(b)pacPreenche(b.dataset.p);});
  box.addEventListener('input',renderPac);$('#pqObj').addEventListener('change',renderPac);
  pacPreenche('familia');
  const prev=window.onMarket;window.onMarket=()=>{prev?.();renderPac();};}
initPac();
