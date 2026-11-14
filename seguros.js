'use strict';
// Módulo Seguros — dados de referência de mercado brasileiro (faixas típicas de prêmio; confirme cotação com corretor habilitado na SUSEP).
const SEG=[
 {id:'vida',n:'Seguro de Vida',ic:'heart',reg:'SUSEP',dem:'Muito alta',cat:'Pessoas',
  cobre:'Morte natural/acidental, invalidez por acidente ou doença, doenças graves, diárias por incapacidade, assistência funeral.',
  custo:'R$ 30–150/mês para R$ 300 mil (30–45 anos, não fumante)',custoBase:{tipo:'capital',pct:0.0035,min:20},
  carencia:'Até 2 anos para suicídio; doenças: conforme apólice (geralmente sem carência para acidentes)',
  exclui:'Doenças preexistentes omitidas, atos ilícitos, guerra, esportes radicais não declarados',
  quem:'Quem tem dependentes, dívidas ou é autônomo/empresário',
  dica:'Capital ideal ≈ 5–10× a renda anual. Prefira apólice individual à de cartão/banco; inclua doenças graves. Indenização é isenta de IR e não entra em inventário.',
  segs:['MAG Seguros','Prudential','MetLife','Icatu','Porto Seguro','Bradesco Seguros','SulAmérica']},
 {id:'saude',n:'Plano/Seguro Saúde',ic:'pulse',reg:'ANS',dem:'Muito alta',cat:'Pessoas',
  cobre:'Consultas, exames, internações, cirurgias, partos (conforme segmentação), terapias do rol ANS.',
  custo:'R$ 300–900/mês (30–39 anos, enfermaria/apartamento); empresarial/MEI 20–40% mais barato',custoBase:{tipo:'idade'},
  carencia:'24h urgência; 30 dias consultas; 180 dias internações; 300 dias parto; 24 meses doenças preexistentes (CPT)',
  exclui:'Procedimentos estéticos, fora do rol ANS (exceto via justiça), fora da área geográfica',
  quem:'Todos — principal gasto de proteção das famílias',
  dica:'Compare rede credenciada, coparticipação e índice de reajuste. Plano via CNPJ/MEI costuma sair mais barato, mas reajuste não é limitado pela ANS. Portabilidade de carências é direito.',
  segs:['Bradesco Saúde','SulAmérica','Amil','Porto Saúde','Unimed','Hapvida NotreDame','Allianz Saúde']},
 {id:'auto',n:'Seguro Automóvel',ic:'car',reg:'SUSEP',dem:'Muito alta',cat:'Patrimônio',
  cobre:'Colisão, roubo/furto, incêndio, alagamento, danos a terceiros (RCF), APP, guincho, carro reserva, vidros.',
  custo:'3–8% do valor FIPE ao ano (varia com CEP, idade, perfil, garagem)',custoBase:{tipo:'valor',pct:0.05,min:1500},
  carencia:'Sem carência após vistoria/emissão',
  exclui:'Motorista embriagado, sem CNH, uso comercial não declarado, perfil falso',
  quem:'Todo proprietário de veículo, principalmente financiado',
  dica:'Franquia maior = prêmio menor. Declare o perfil corretamente (principal condutor, CEP) para não perder a indenização. RCF de R$ 100 mil+ é essencial. Compare também proteção veicular — mas ela NÃO é seguro regulado pela SUSEP.',
  segs:['Porto Seguro','Azul Seguros','Allianz','Tokio Marine','HDI','Yelum (ex-Liberty)','Mapfre','Bradesco Seguros','Youse']},
 {id:'residencial',n:'Seguro Residencial (imóvel)',ic:'home',reg:'SUSEP',dem:'Alta',cat:'Patrimônio',
  cobre:'Incêndio, raio, explosão, danos elétricos, vendaval, roubo de bens, RC familiar, pagamento de aluguel, assistências 24h (chaveiro, encanador).',
  custo:'0,05–0,3% do valor do imóvel ao ano — ex.: R$ 200–800/ano',custoBase:{tipo:'valor',pct:0.0015,min:180},
  carencia:'Sem carência',exclui:'Desgaste natural, falta de manutenção, enchente (se não contratada), bens sem comprovação',
  quem:'Proprietários e inquilinos (cobre bens e responsabilidade)',
  dica:'Um dos seguros com melhor custo-benefício. Só a assistência 24h costuma compensar. Guarde notas fiscais dos bens. Imóvel financiado já tem MIP/DFI obrigatório, que NÃO cobre os bens.',
  segs:['Porto Seguro','Tokio Marine','Allianz','Mapfre','Bradesco Seguros','Caixa Seguradora','HDI']},
 {id:'condominio',n:'Seguro Condomínio',ic:'towers',reg:'SUSEP',dem:'Alta',cat:'Patrimônio',
  cobre:'Incêndio/explosão (obrigatório por lei), RC do síndico, danos elétricos, vendaval, quebra de vidros, portões.',
  custo:'0,03–0,1% do valor de reconstrução ao ano',custoBase:{tipo:'valor',pct:0.0006,min:2000},
  carencia:'Sem carência',exclui:'Bens individuais dos condôminos',quem:'Condomínios (obrigatório — Código Civil art. 1.346)',
  dica:'Avalie o valor de reconstrução por laudo; subsegurar gera rateio na indenização.',segs:['Porto Seguro','Tokio Marine','Allianz','Mapfre','HDI']},
 {id:'viagem',n:'Seguro Viagem',ic:'plane',reg:'SUSEP',dem:'Alta',cat:'Pessoas',
  cobre:'Despesas médicas/hospitalares no exterior, odontológicas, repatriação, extravio de bagagem, cancelamento, atraso de voo.',
  custo:'R$ 8–40/dia (Europa ~R$ 15–25/dia para €30 mil); EUA mais caro',custoBase:{tipo:'dias'},
  carencia:'Vale a partir do embarque',exclui:'Doença preexistente não declarada, esportes radicais, gravidez avançada',
  quem:'Todo viajante — obrigatório no Espaço Schengen (mín. €30 mil)',
  dica:'EUA: contrate ≥ US$ 100 mil (internação custa US$ 5–10 mil/dia). Cartões premium incluem seguro — verifique coberturas e acione a emissão antes da viagem.',
  segs:['Assist Card','Affinity','GTA','Allianz Travel','Coris','Porto Seguro','Universal Assistance']},
 {id:'bens',n:'Bens e Valores (portáteis, celular, joias)',ic:'gem',reg:'SUSEP',dem:'Alta',cat:'Patrimônio',
  cobre:'Roubo, furto qualificado, quebra acidental de celulares, notebooks, câmeras, joias, relógios, equipamentos profissionais.',
  custo:'10–20% do valor do bem ao ano (celular); joias 1–3% ao ano',custoBase:{tipo:'valor',pct:0.12,min:120},
  carencia:'Alguns exigem 30 dias para quebra',exclui:'Furto simples (sem vestígios), perda, esquecimento, desgaste',
  quem:'Donos de eletrônicos caros, colecionadores, profissionais com equipamentos',
  dica:'Compare com a franquia (geralmente 15–25% do bem). Para joias/relógios de alto valor, apólice "riscos diversos" com avaliação certificada.',
  segs:['Porto Seguro','Allianz','Tokio Marine','Pitzi','Mapfre','Zurich']},
 {id:'empresarial',n:'Empresarial / Riscos Nomeados',ic:'factory',reg:'SUSEP',dem:'Alta',cat:'Empresas',
  cobre:'Incêndio, roubo de estoque/equipamentos, danos elétricos, lucros cessantes, RC operações, vendaval.',
  custo:'0,1–0,5% do valor em risco ao ano',custoBase:{tipo:'valor',pct:0.003,min:800},
  carencia:'Sem carência',exclui:'Falhas de manutenção, guerras, poluição gradual',quem:'Comércios, indústrias, escritórios, clínicas',
  dica:'Lucros cessantes é o que mantém a empresa viva após um sinistro — não deixe de contratar.',segs:['Porto Seguro','Tokio Marine','Allianz','HDI','Mapfre','Sompo','Zurich']},
 {id:'rc',n:'Responsabilidade Civil Profissional (E&O)',ic:'scale',reg:'SUSEP',dem:'Média',cat:'Empresas',
  cobre:'Indenizações e custos de defesa por erro ou omissão profissional (médicos, advogados, engenheiros, consultores, D&O para administradores).',
  custo:'R$ 600–6.000/ano conforme profissão e limite',custoBase:{tipo:'fixo',v:2000},
  carencia:'Retroatividade conforme apólice (claims made)',exclui:'Dolo, multas, atos fora da atividade declarada',quem:'Profissionais liberais e administradores',
  dica:'Médicos e dentistas: essencial. Empresas com conselho: D&O protege o patrimônio pessoal dos diretores.',segs:['AIG','Chubb','Tokio Marine','Allianz','Fairfax','Zurich']},
 {id:'fianca',n:'Seguro Fiança Locatícia',ic:'key',reg:'SUSEP',dem:'Média',cat:'Patrimônio',
  cobre:'Garante ao proprietário aluguel, condomínio, IPTU e danos em caso de inadimplência do inquilino.',
  custo:'1 a 1,5 aluguel por ano (pago pelo inquilino)',custoBase:{tipo:'aluguel'},
  carencia:'—',exclui:'Débitos anteriores à apólice',quem:'Inquilinos sem fiador; proprietários que querem garantia',
  dica:'Compare com título de capitalização e caução (3 aluguéis, que voltam corrigidos). Fiança não é devolvida.',segs:['Porto Seguro','Tokio Marine','Pottencial','Too Seguros','CredPago (garantia)']},
 {id:'prestamista',n:'Prestamista',ic:'bank',reg:'SUSEP',dem:'Média',cat:'Pessoas',
  cobre:'Quita a dívida (financiamento/empréstimo) em caso de morte, invalidez ou desemprego involuntário.',
  custo:'0,3–1% do saldo devedor ao ano',custoBase:{tipo:'valor',pct:0.006,min:60},
  carencia:'Desemprego: 30–90 dias',exclui:'Doença preexistente, demissão por justa causa',quem:'Quem tem financiamento longo e renda única',
  dica:'Venda casada é ilegal: você pode recusar ou contratar em outra seguradora. Verifique se já não está embutido no CET.',segs:['Caixa Seguradora','Bradesco Seguros','BB Seguros','Itaú Seguros','Cardif']},
 {id:'pet',n:'Plano/Seguro Pet',ic:'paw',reg:'—',dem:'Crescente',cat:'Pessoas',
  cobre:'Consultas, vacinas, exames, cirurgias, internação veterinária; alguns incluem RC por danos do animal.',
  custo:'R$ 40–300/mês',custoBase:{tipo:'fixo',v:1200},carencia:'30–180 dias',exclui:'Doenças preexistentes, raças com restrição',
  quem:'Tutores de cães e gatos',dica:'Muitos são planos de assistência (não regulados pela SUSEP). Leia limites anuais e rede credenciada.',segs:['Petlove Saúde','Porto Pet','Plano de Saúde Pet Bradesco','Health for Pet']},
 {id:'rural',n:'Rural / Agrícola',ic:'sprout',reg:'SUSEP + MAPA',dem:'Alta (agro)',cat:'Empresas',
  cobre:'Perdas de safra por seca, geada, granizo, chuva excessiva; máquinas, benfeitorias e rebanho.',
  custo:'2–8% do valor segurado; subvenção federal (PSR) de 20–40%',custoBase:{tipo:'valor',pct:0.05,min:500},
  carencia:'Conforme calendário de plantio (zoneamento agrícola)',exclui:'Plantio fora do ZARC, manejo inadequado',quem:'Produtores rurais',
  dica:'Use o Programa de Subvenção ao Prêmio (PSR) do MAPA. Exigido em muitos financiamentos de custeio.',segs:['Brasilseg (BB)','Mapfre','Tokio Marine','Sancor','Allianz','Swiss Re Corporate']},
 {id:'cyber',n:'Riscos Cibernéticos',ic:'lock',reg:'SUSEP',dem:'Crescente',cat:'Empresas',
  cobre:'Vazamento de dados (LGPD), ransomware, interrupção de sistemas, custos de notificação e defesa.',
  custo:'R$ 3–30 mil/ano para PMEs',custoBase:{tipo:'fixo',v:8000},carencia:'—',exclui:'Falta de controles mínimos declarados',
  quem:'Empresas que armazenam dados de clientes',dica:'Multas da ANPD chegam a 2% do faturamento (até R$ 50 mi). Seguradoras exigem MFA e backup.',segs:['AIG','Chubb','Allianz','Tokio Marine','Zurich','Beazley']},
];
const SEGURADORAS=[
 ['Porto Seguro','Multirramo — líder em auto e residencial','Grande','Ótima','https://www.portoseguro.com.br'],
 ['Bradesco Seguros','Multirramo — líder em vida/saúde/previdência','Grande','Boa','https://www.bradescoseguros.com.br'],
 ['SulAmérica (Rede D\'Or)','Saúde, vida, odonto','Grande','Boa','https://www.sulamerica.com.br'],
 ['Allianz','Multinacional alemã — auto, empresarial, viagem','Grande','Boa','https://www.allianz.com.br'],
 ['Tokio Marine','Japonesa — auto, residencial, empresarial','Grande','Ótima','https://www.tokiomarine.com.br'],
 ['Mapfre','Espanhola — auto, rural, residencial','Grande','Regular','https://www.mapfre.com.br'],
 ['HDI / Yelum','Grupo Talanx — auto, empresarial','Grande','Boa','https://www.hdiseguros.com.br'],
 ['Azul Seguros','Grupo Porto — auto econômico','Médio','Boa','https://www.azulseguros.com.br'],
 ['Caixa Seguradora','Habitacional, prestamista, vida','Grande','Regular','https://www.caixaseguradora.com.br'],
 ['Brasilseg (BB Seguros)','Rural, vida, prestamista','Grande','Regular','https://www.bbseguros.com.br'],
 ['MAG Seguros (Mongeral)','Especialista em vida — 190 anos','Médio','Ótima','https://www.magseguros.com.br'],
 ['Prudential do Brasil','Especialista em vida individual','Médio','Ótima','https://www.prudential.com.br'],
 ['Icatu','Vida e previdência independente','Médio','Boa','https://www.icatuseguros.com.br'],
 ['MetLife','Vida e odonto','Médio','Boa','https://www.metlife.com.br'],
 ['Assist Card','Assistência de viagem','Médio','Boa','https://www.assistcard.com.br'],
 ['Chubb / AIG','Grandes riscos, RC, cyber, D&O','Grande','Boa','https://www.chubb.com/br-pt'],
];
const segBy=id=>SEG.find(s=>s.id===id);
const CAMPO={vida:'valor',residencial:'imovel',condominio:'condo',auto:'veiculo',bens:'bens',empresarial:'empresa',rural:'empresa',prestamista:'divida'};
function estimaSeg(s,P){const {idade,dias,aluguel}=P;const valor=P[CAMPO[s.id]]??P.valor;const b=s.custoBase;
  if(b.tipo==='valor')return Math.max(b.min,valor*b.pct);
  if(b.tipo==='capital')return Math.max(b.min*12,valor*b.pct*(idade<30?0.6:idade<40?1:idade<50?1.8:idade<60?3.2:5.5));
  if(b.tipo==='idade'){const f=[[18,250],[24,290],[29,330],[34,380],[39,430],[44,520],[49,640],[54,800],[58,1050],[200,1700]].find(x=>idade<=x[0])[1];return f*12;}
  if(b.tipo==='dias')return dias*18;
  if(b.tipo==='aluguel')return aluguel*1.2;
  return b.v;}
function renderSeguros(){
  const cat=$('#segCat').value;const L=SEG.filter(s=>cat==='todas'||s.cat===cat);
  $('#segTable').innerHTML='<tr><th style="width:15%">Seguro</th><th style="width:24%">O que cobre</th><th style="width:17%">Custo típico</th><th style="width:15%">Carência</th><th style="width:17%">Principais exclusões</th><th>Regulador</th><th>Demanda</th></tr>'+
    L.map(s=>`<tr data-tip="seg:${s.id}"><td><b>${ico(s.ic)}${s.n}</b><div class="note">${s.cat}</div></td><td>${s.cobre}</td><td>${s.custo}</td><td>${s.carencia}</td><td>${s.exclui}</td><td>${s.reg}</td><td><span class="tag ${s.dem.startsWith('Muito')?'t1':s.dem.startsWith('Alta')?'t1':'t2'}">${s.dem}</span></td></tr>`).join('');
  $('#segCards').innerHTML=L.map(s=>`<div class="card"><h2 class="hi">${ico(s.ic)}${s.n}</h2><p class="note">${s.cobre}</p><ul><li><b>Custo:</b> ${s.custo}</li><li><b>Carência:</b> ${s.carencia}</li><li><b>Atenção:</b> ${s.exclui}</li><li><b>Dica da consultoria:</b> ${s.dica}</li><li><b>Onde cotar:</b> ${s.segs.join(', ')}</li></ul></div>`).join('');
  $('#segIns').innerHTML='<tr><th>Seguradora</th><th>Foco / ramos fortes</th><th>Porte</th><th>Reputação*</th><th>Ramos em que aparece</th><th>Verificar</th></tr>'+
    SEGURADORAS.map(([n,f,p,r,u])=>{const base=n.split(/[ (/]/)[0];const ramos=SEG.filter(s=>s.segs.some(x=>x.startsWith(base))).map(s=>s.ic).join(' ');
      return `<tr data-tip="segins:${n}"><td><a href="${u}" target="_blank" rel="noopener"><b>${n}</b></a></td><td>${f}</td><td>${p}</td><td><span class="tag ${r==='Ótima'?'t1':r==='Boa'?'t1':'t2'}">${r}</span></td><td>${ramos}</td><td><a href="https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent(n)}" target="_blank" rel="noopener">Reclame Aqui</a> · <a href="https://www2.susep.gov.br/safe/menumercado/REGES/pesquisar.asp" target="_blank" rel="noopener">SUSEP</a></td></tr>`;}).join('');
  calcSeg();}
function calcSeg(){const imv=+$('#segImovel').value||0;const p={imovel:imv,condo:imv*40,veiculo:+$('#segVeiculo').value||0,bens:+$('#segBens').value||0,empresa:+$('#segEmpresa').value||0,divida:+$('#segDivida').value||0,valor:+$('#segValor').value||0,idade:+$('#segIdade').value||35,dias:+$('#segDias').value||10,aluguel:+$('#segAluguel').value||0};
  const renda=+$('#segRenda').value||0;
  const rows=SEG.map(s=>({s,a:estimaSeg(s,p)/(s.id==='condominio'?40:1)}));
  $('#segCalc').innerHTML='<tr><th>Seguro</th><th>Base de cálculo</th><th>Estimativa anual</th><th>Mensal</th><th>% da renda anual</th></tr>'+rows.map(({s,a})=>{
    const v=p[CAMPO[s.id]]??p.valor;const lab={imovel:'Imóvel',condo:'Sua cota (1/40) de um prédio de',veiculo:'Veículo FIPE',bens:'Bens portáteis',empresa:'Patrimônio empresarial/safra',divida:'Saldo devedor'}[CAMPO[s.id]]||'Valor';
    const base={valor:lab+': '+brl(v),capital:'Capital: '+brl(p.valor)+' · idade '+p.idade,idade:'Idade '+p.idade,dias:p.dias+' dias de viagem',aluguel:'Aluguel '+brl(p.aluguel),fixo:'Faixa média de mercado'}[s.custoBase.tipo];
    return `<tr data-tip="seg:${s.id}"><td>${ico(s.ic)}${s.n}</td><td class="note">${base}</td><td class="n"><b>${brl(a)}</b></td><td class="n">${brl(a/12)}</td><td class="n">${renda?pct(a/(renda*12)*100,1):'—'}</td></tr>`;}).join('');}
function tipSeg(id){const s=segBy(id);if(!s)return '';
  return sec(`${ico(s.ic)}${s.n}`,`<p>${s.cobre}</p>`)+sec('Comparativo rápido',`<table><tr><td>Custo típico</td><td>${s.custo}</td></tr><tr><td>Carência</td><td>${s.carencia}</td></tr><tr><td>Regulador</td><td>${s.reg}</td></tr><tr><td>Demanda</td><td>${s.dem}</td></tr></table>`)+
   sec('Para quem',`<p>${s.quem}</p>`)+sec('Não cobre',`<p>${s.exclui}</p>`)+sec('Recomendação da consultoria',`<p>${s.dica}</p>`)+sec('Seguradoras de referência',`<p>${s.segs.join(' · ')}</p>`)+
   `<p class="note">Faixas de mercado para orientação. Cotação real depende do perfil — sempre consulte 3+ seguradoras via corretor registrado na SUSEP.</p>`;}
function tipSegIns(n){const r=SEGURADORAS.find(x=>x[0]===n);if(!r)return '';const base=n.split(/[ (/]/)[0];const L=SEG.filter(s=>s.segs.some(x=>x.startsWith(base)));
  return sec(n,`<p>${r[1]}. Porte: <b>${r[2]}</b>. Reputação: <b>${r[3]}</b>.</p>`)+sec('Ramos em que é referência',L.length?'<ul>'+L.map(s=>`<li>${ico(s.ic)}${s.n} — ${s.custo}</li>`).join('')+'</ul>':'<p>Especialista em nicho.</p>')+
   sec('Como verificar',`<ul><li>Registro e situação na SUSEP (consulta pública de entidades).</li><li>Índice de reclamações da SUSEP e nota no Reclame Aqui.</li><li>Solvência: seguradoras grandes publicam balanço e rating (S&P, Moody's, AM Best).</li></ul>`);}
['#segCat'].forEach(s=>$(s).addEventListener('change',renderSeguros));
['#segValor','#segImovel','#segVeiculo','#segBens','#segEmpresa','#segDivida','#segIdade','#segDias','#segAluguel','#segRenda'].forEach(s=>$(s).addEventListener('input',calcSeg));
renderSeguros();

const REPK={'Ótima':3,'Boa':2,'Regular':1};const PORTEK={'Grande':2,'Médio':1};
function insOf(nome){const b=nome.split(/[ (/]/)[0];return SEGURADORAS.find(r=>r[0].startsWith(b));}
function cmpSeg(id){const s=segBy(id);if(!s)return '';const L=s.segs.map(n=>({n,r:insOf(n)}));const com=L.filter(x=>x.r);
  const melhor=com.slice().sort((a,b)=>(REPK[b.r[3]]||0)-(REPK[a.r[3]]||0)||(PORTEK[b.r[2]]||0)-(PORTEK[a.r[2]]||0));
  return sec('Seguradoras concorrentes neste ramo',`<table><tr><th>Seguradora</th><th>Porte</th><th>Reputação</th><th>Foco</th></tr>${L.map(x=>`<tr><td><b>${x.n}</b></td><td>${x.r?.[2]||'—'}</td><td>${x.r?`<span class="tag ${x.r[3]==='Regular'?'t2':'t1'}">${x.r[3]}</span>`:'—'}</td><td class="note">${x.r?.[1]||'Especialista no ramo'}</td></tr>`).join('')}</table>`)+
   (melhor.length?sec('Destaques',`<ul><li><b>Melhor reputação:</b> ${melhor.filter(x=>x.r[3]===melhor[0].r[3]).map(x=>x.n).join(', ')}</li><li><b>Maior solidez (porte):</b> ${com.filter(x=>x.r[2]==='Grande').map(x=>x.n).join(', ')||'—'}</li></ul><p class="note">Preço, cobertura e carência variam por perfil e apólice — compare as condições gerais de cada cotação.</p>`):'');}
function cmpSegIns(n){const r=SEGURADORAS.find(x=>x[0]===n);if(!r)return '';const melhores=SEGURADORAS.filter(x=>x[0]!==n&&REPK[x[3]]>=REPK[r[3]]&&x[2]==='Grande').slice(0,5);
  return sec('Comparação com concorrentes',`<p>Reputação: <b>${r[3]}</b> · Porte: <b>${r[2]}</b></p><p>${melhores.length?'Concorrentes de grande porte com reputação igual ou superior: '+melhores.map(x=>x[0]).join(', ')+'.':'É referência em reputação e porte entre as listadas.'}</p>`);}
