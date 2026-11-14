'use strict';
// Viagens & Eventos — preços de referência em moeda local (sites oficiais, 2025–2026), convertidos ao câmbio ao vivo.
const O=(n,u)=>({n,u});
const DEST=[
 {id:'orlando',n:'Orlando',pais:'EUA',cc:'USD',city:'Orlando',ctry:'US',voo:[3800,6500],hotel:{3:140,4:230,5:450},alim:60,transp:35,visto:'Visto americano obrigatório',epoca:'Mai, set–nov (menos filas)',
  atr:[{n:'Walt Disney World — ingresso 1 dia/1 parque',t:'parque',min:119,max:199,on:[O('Disney (oficial)','https://disneyworld.disney.go.com'),O('Orlando Ticket Connection','https://www.orlandoticketconnection.com')],obs:'Preço dinâmico por data; ingressos de 4+ dias reduzem custo diário.'},
   {n:'Universal Orlando — 1 dia/1 parque',t:'parque',min:119,max:189,on:[O('Universal (oficial)','https://www.universalorlando.com')],obs:'Epic Universe vendido à parte.'},
   {n:'Kennedy Space Center',t:'cultura',min:75,max:95,on:[O('KSC (oficial)','https://www.kennedyspacecenter.com')],obs:''},
   {n:'Orlando Magic (NBA)',t:'esporte',min:25,max:300,on:[O('Ticketmaster','https://www.ticketmaster.com'),O('NBA Tickets','https://www.nba.com/magic/tickets')],obs:'Temporada out–abr.'}]},
 {id:'ny',n:'Nova York',pais:'EUA',cc:'USD',city:'New York',ctry:'US',voo:[3500,6500],hotel:{3:220,4:350,5:700},alim:80,transp:15,visto:'Visto americano obrigatório',epoca:'Abr–jun, set–out; dez (Natal, mais caro)',
  atr:[{n:'Musical na Broadway',t:'cultura',min:79,max:350,on:[O('Broadway.com','https://www.broadway.com'),O('TKTS (desconto no dia)','https://www.tdf.org/tkts')],obs:'TKTS vende sobras do dia com 20–50% de desconto.'},
   {n:'Empire State Building (86º andar)',t:'turismo',min:44,max:79,on:[O('Oficial','https://www.esbnyc.com')],obs:''},
   {n:'MoMA',t:'cultura',min:30,max:30,on:[O('MoMA','https://www.moma.org')],obs:''},
   {n:'NY Knicks (NBA) no Madison Square Garden',t:'esporte',min:90,max:600,on:[O('Ticketmaster','https://www.ticketmaster.com'),O('SeatGeek (revenda)','https://seatgeek.com')],obs:'Revenda oficial tem garantia; evite cambistas.'},
   {n:'New York City Pass (5 atrações)',t:'turismo',min:146,max:146,on:[O('CityPASS','https://www.citypass.com/new-york')],obs:'Economia de ~40% se visitar todas.'}]},
 {id:'paris',n:'Paris',pais:'França',cc:'EUR',city:'Paris',ctry:'FR',voo:[4200,7500],hotel:{3:150,4:260,5:600},alim:55,transp:12,visto:'Isento (até 90 dias) — ETIAS previsto; seguro viagem €30 mil obrigatório',epoca:'Abr–jun, set–out',
  atr:[{n:'Museu do Louvre',t:'cultura',min:22,max:32,on:[O('Louvre (oficial)','https://www.louvre.fr')],obs:'Reserva de horário obrigatória.'},
   {n:'Torre Eiffel — topo',t:'turismo',min:36,max:36,on:[O('Oficial','https://www.toureiffel.paris')],obs:'Evite sites revendedores com taxa.'},
   {n:'Disneyland Paris — 1 dia',t:'parque',min:62,max:125,on:[O('Oficial','https://www.disneylandparis.com')],obs:''},
   {n:'PSG — jogo no Parc des Princes',t:'esporte',min:50,max:250,on:[O('PSG Billetterie (oficial)','https://billetterie.psg.fr')],obs:'Venda prioritária a sócios; revenda oficial no site do clube.'},
   {n:'Moulin Rouge — show',t:'cultura',min:95,max:230,on:[O('Oficial','https://www.moulinrouge.fr')],obs:''}]},
 {id:'lisboa',n:'Lisboa',pais:'Portugal',cc:'EUR',city:'Lisbon',ctry:'PT',voo:[3600,6000],hotel:{3:90,4:160,5:350},alim:35,transp:8,visto:'Isento (até 90 dias); seguro €30 mil obrigatório',epoca:'Abr–jun, set–out',
  atr:[{n:'Mosteiro dos Jerónimos',t:'cultura',min:18,max:18,on:[O('Oficial','https://www.museusemonumentos.pt')],obs:''},
   {n:'Oceanário de Lisboa',t:'turismo',min:25,max:25,on:[O('Oficial','https://www.oceanario.pt')],obs:''},
   {n:'Palácio da Pena (Sintra)',t:'turismo',min:20,max:20,on:[O('Parques de Sintra','https://www.parquesdesintra.pt')],obs:'Compre com horário marcado.'},
   {n:'Benfica ou Sporting — jogo',t:'esporte',min:25,max:120,on:[O('Benfica (oficial)','https://www.slbenfica.pt'),O('Sporting (oficial)','https://www.sporting.pt')],obs:''},
   {n:'Casa de Fado com jantar',t:'cultura',min:45,max:80,on:[O('GetYourGuide','https://www.getyourguide.com'),O('Civitatis','https://www.civitatis.com/br')],obs:''}]},
 {id:'londres',n:'Londres',pais:'Reino Unido',cc:'GBP',city:'London',ctry:'GB',voo:[4500,8000],hotel:{3:150,4:250,5:550},alim:50,transp:12,visto:'ETA eletrônico obrigatório (~£16)',epoca:'Mai–set',
  atr:[{n:'Musical no West End',t:'cultura',min:30,max:180,on:[O('Official London Theatre','https://officiallondontheatre.com'),O('TodayTix','https://www.todaytix.com')],obs:''},
   {n:'Torre de Londres',t:'turismo',min:35,max:35,on:[O('Historic Royal Palaces','https://www.hrp.org.uk')],obs:''},
   {n:'London Eye',t:'turismo',min:29,max:45,on:[O('Oficial','https://www.londoneye.com')],obs:''},
   {n:'Premier League (Arsenal, Chelsea, Tottenham…)',t:'esporte',min:60,max:250,on:[O('Sites oficiais dos clubes','https://www.premierleague.com/tickets')],obs:'Muitos jogos exigem associação ao clube; revenda só oficial.'},
   {n:'Museu Britânico / National Gallery',t:'cultura',min:0,max:0,on:[O('British Museum','https://www.britishmuseum.org')],obs:'Entrada gratuita.'}]},
 {id:'roma',n:'Roma',pais:'Itália',cc:'EUR',city:'Rome',ctry:'IT',voo:[4200,7200],hotel:{3:120,4:220,5:500},alim:45,transp:8,visto:'Isento (até 90 dias); seguro €30 mil obrigatório',epoca:'Abr–jun, set–out',
  atr:[{n:'Coliseu + Fórum Romano',t:'cultura',min:18,max:24,on:[O('Parco Colosseo (oficial)','https://ticketing.colosseo.it')],obs:'Esgota cedo — compre ao abrir as vendas.'},
   {n:'Museus Vaticanos + Capela Sistina',t:'cultura',min:25,max:35,on:[O('Oficial','https://www.museivaticani.va')],obs:''},
   {n:'Roma ou Lazio — Serie A',t:'esporte',min:30,max:150,on:[O('AS Roma (oficial)','https://www.asroma.com'),O('Lazio (oficial)','https://www.sslazio.it')],obs:'Exige documento e cadastro nominal.'}]},
 {id:'bsas',n:'Buenos Aires',pais:'Argentina',cc:'USD',city:'Buenos Aires',ctry:'AR',voo:[1500,3000],hotel:{3:60,4:110,5:250},alim:30,transp:8,visto:'Só RG ou passaporte',epoca:'Mar–mai, set–nov',
  atr:[{n:'Show de tango com jantar',t:'cultura',min:60,max:160,on:[O('Café de los Angelitos','https://www.cafedelosangelitos.com'),O('Civitatis','https://www.civitatis.com/br')],obs:'Preços em dólar; pague em cartão com dólar MEP quando possível.'},
   {n:'Boca Juniors ou River Plate — jogo',t:'esporte',min:90,max:300,on:[O('Agências credenciadas (ex.: LandingPadBA)','https://landingpadba.com')],obs:'Estrangeiros só compram via pacote credenciado — não há venda direta.'},
   {n:'Teatro Colón — visita guiada',t:'cultura',min:20,max:25,on:[O('Oficial','https://teatrocolon.org.ar')],obs:''}]},
 {id:'cancun',n:'Cancún',pais:'México',cc:'USD',city:'Cancun',ctry:'MX',voo:[3500,6000],hotel:{3:110,4:220,5:450},alim:45,transp:15,visto:'Visto mexicano ou eletrônico (SAE) — verifique regra vigente',epoca:'Dez–abr (seco)',
  atr:[{n:'Parque Xcaret',t:'parque',min:130,max:180,on:[O('Grupo Xcaret (oficial)','https://www.xcaret.com')],obs:''},
   {n:'Chichén Itzá — excursão',t:'turismo',min:70,max:140,on:[O('GetYourGuide','https://www.getyourguide.com'),O('Civitatis','https://www.civitatis.com/br')],obs:'Taxa de entrada local cobrada à parte em algumas excursões.'},
   {n:'Isla Mujeres — catamarã',t:'turismo',min:60,max:120,on:[O('Viator','https://www.viator.com')],obs:''}]},
 {id:'santiago',n:'Santiago',pais:'Chile',cc:'USD',city:'Santiago',ctry:'CL',voo:[2000,3800],hotel:{3:70,4:130,5:280},alim:35,transp:10,visto:'Só RG ou passaporte',epoca:'Jun–set (neve); out–mar (vinícolas)',
  atr:[{n:'Valle Nevado — ski pass 1 dia',t:'esporte',min:85,max:130,on:[O('Valle Nevado (oficial)','https://www.vallenevado.com')],obs:'Equipamento e transporte à parte.'},
   {n:'Vinícola Concha y Toro — tour',t:'turismo',min:30,max:90,on:[O('Oficial','https://conchaytoro.com')],obs:''},
   {n:'Colo-Colo — jogo',t:'esporte',min:20,max:80,on:[O('Puntoticket','https://www.puntoticket.com')],obs:''}]},
 {id:'toquio',n:'Tóquio',pais:'Japão',cc:'JPY',city:'Tokyo',ctry:'JP',voo:[7000,12000],hotel:{3:15000,4:28000,5:70000},alim:6000,transp:1500,visto:'Isento para brasileiros (até 90 dias)',epoca:'Mar–abr (sakura), out–nov',
  atr:[{n:'Tokyo Disneyland/DisneySea — 1 dia',t:'parque',min:7900,max:10900,on:[O('Oficial','https://www.tokyodisneyresort.jp')],obs:''},
   {n:'Tokyo Skytree',t:'turismo',min:2100,max:3500,on:[O('Oficial','https://www.tokyo-skytree.jp')],obs:''},
   {n:'Torneio de Sumô (jan, mai, set)',t:'esporte',min:3800,max:20000,on:[O('Sumo Ticket (oficial)','https://sumo.pia.jp')],obs:'Esgota em horas.'},
   {n:'teamLab Planets',t:'cultura',min:3600,max:4200,on:[O('Oficial','https://www.teamlab.art')],obs:''}]},
 {id:'rio',n:'Rio de Janeiro',pais:'Brasil',cc:'BRL',city:'Rio de Janeiro',ctry:'BR',voo:[500,1500],hotel:{3:350,4:650,5:1600},alim:150,transp:60,visto:'—',epoca:'Mar–jun; Réveillon e Carnaval com preços 2–4× maiores',
  atr:[{n:'Cristo Redentor (trem do Corcovado)',t:'turismo',min:90,max:120,on:[O('Trem do Corcovado (oficial)','https://www.tremdocorcovado.rio')],obs:''},
   {n:'Bondinho Pão de Açúcar',t:'turismo',min:195,max:195,on:[O('Oficial','https://www.bondinho.com.br')],obs:'Meia-entrada para estudantes e idosos.'},
   {n:'Jogo no Maracanã',t:'esporte',min:40,max:400,on:[O('Sites oficiais dos clubes / Futebol Card','https://www.maracana.com')],obs:''},
   {n:'Desfile das Escolas de Samba (Sambódromo)',t:'cultura',min:60,max:3000,on:[O('Liesa (oficial)','https://liesa.globo.com')],obs:'Arquibancada x frisa x camarote.'}]},
 {id:'gramado',n:'Gramado',pais:'Brasil',cc:'BRL',city:'Gramado',ctry:'BR',voo:[600,1600],hotel:{3:350,4:700,5:1500},alim:160,transp:70,visto:'—',epoca:'Jun–ago (inverno); nov–jan (Natal Luz)',
  atr:[{n:'Natal Luz — espetáculos',t:'cultura',min:90,max:600,on:[O('Natal Luz (oficial)','https://www.natalluzdegramado.com.br')],obs:'Novembro a janeiro.'},
   {n:'Snowland',t:'parque',min:190,max:290,on:[O('Oficial','https://www.snowland.com.br')],obs:''},
   {n:'Mini Mundo',t:'turismo',min:60,max:80,on:[O('Oficial','https://www.minimundo.com.br')],obs:''}]},
];
const FORN=[
 ['Hospedagem','Booking.com','OTA global','Sem taxa ao hóspede; muitas tarifas com cancelamento grátis','Ótima','https://www.booking.com'],
 ['Hospedagem','Expedia / Hotels.com','OTA global','Programa de pontos; pacotes voo+hotel','Boa','https://www.expedia.com.br'],
 ['Hospedagem','Airbnb','Aluguel por temporada','Taxa de serviço ~14–16% ao hóspede + limpeza','Boa','https://www.airbnb.com.br'],
 ['Hospedagem','Site direto do hotel','Direto','Frequentemente igual/menor preço + benefícios; melhor suporte','Ótima','#'],
 ['Pacotes','CVC','Operadora (agências físicas)','Parcelamento longo; preço maior que montar sozinho','Regular','https://www.cvc.com.br'],
 ['Pacotes','Decolar','OTA latino-americana','Pacotes voo+hotel com desconto; atendimento irregular','Regular','https://www.decolar.com'],
 ['Pacotes','Hurb','Pacotes flexíveis','Histórico de cancelamentos e processos — evitar datas flexíveis','Não recomendada','https://www.hurb.com'],
 ['Passagens','Google Flights','Comparador','Mostra o mais barato e histórico de preços — compra no site da cia.','Ótima','https://www.google.com/travel/flights'],
 ['Passagens','Companhias (LATAM, GOL, Azul, TAP…)','Direto','Melhor suporte em alterações; milhas','Boa','#'],
 ['Passagens','MaxMilhas / 123milhas','Venda de milhas','123milhas em recuperação judicial — risco alto','Não recomendada','https://www.maxmilhas.com.br'],
 ['Ingressos','Ticketmaster','Bilheteria oficial global','Taxa de serviço 10–25%; revenda oficial garantida','Boa','https://www.ticketmaster.com.br'],
 ['Ingressos','Eventim','Bilheteria oficial (Europa/BR)','Taxa 10–20%','Boa','https://www.eventim.com.br'],
 ['Ingressos','Sympla','Eventos no Brasil','Taxa ~10% ao comprador','Boa','https://www.sympla.com.br'],
 ['Ingressos','StubHub / Viagogo','Revenda entre pessoas','Preços acima do face value; risco de ingresso inválido; Viagogo com muitas reclamações','Arriscada','https://www.stubhub.com'],
 ['Passeios','GetYourGuide','Atrações e passeios','Cancelamento grátis até 24h na maioria','Ótima','https://www.getyourguide.com'],
 ['Passeios','Civitatis','Passeios em português','Muitos tours em espanhol/português','Ótima','https://www.civitatis.com/br'],
 ['Passeios','Viator (Tripadvisor)','Atrações e passeios','Grande oferta; compare com site oficial','Boa','https://www.viator.com'],
 ['Mobilidade','Rentcars','Comparador de aluguel de carros','Compara Hertz, Alamo, Localiza etc. em reais','Ótima','https://www.rentcars.com'],
 ['Mobilidade','Uber / Bolt','Transporte por app','Preço dinâmico; disponível na maioria dos destinos','Boa','https://www.uber.com'],
 ['Mobilidade','Omio / Trainline','Trens e ônibus na Europa','Compara Eurostar, Flixbus, Renfe etc.','Ótima','https://www.omio.com.br'],
];
const TIPO={parque:['Parque','sprout'],turismo:['Turismo','landmark'],cultura:['Cultura','music'],esporte:['Esporte','ball']};
const fxOf=cc=>cc==='BRL'?1:(S.fx[cc]?.ask||null);
const toBRL=(v,cc)=>{const f=fxOf(cc);return f?v*f:null;};
const PAG={cartao:['Cartão de crédito',5,3.5],conta:['Conta global',1.5,3.5],especie:['Papel-moeda',4,1.1]};
function destSel(){return DEST.find(d=>d.id===$('#vDest').value)||DEST[0];}
function renderViagens(){
  const sel=$('#vDest');if(!sel.options.length)sel.innerHTML=DEST.map(d=>`<option value="${d.id}">${d.n} — ${d.pais}</option>`).join('');
  const d=destSel(),f=fxOf(d.cc),nac=d.cc==='BRL';
  $('#vInfo').innerHTML=[['Moeda',d.cc+(nac?'':' · R$ '+(f?num(f):'—')),'câmbio comercial agora'],['Documentação',d.visto,''],['Melhor época',d.epoca,''],['Voo ida e volta (de SP)',brl(d.voo[0])+' – '+brl(d.voo[1]),'econômica, referência']]
    .map(x=>`<div class="kpi"><div class="l">${x[0]}</div><div class="v" style="font-size:15px">${x[1]}</div><div class="s">${x[2]}</div></div>`).join('');
  const p=PAG[$('#vPag').value],mult=nac?1:(1+p[1]/100),iof=nac?0:p[2];
  $('#vAtr').innerHTML=`<tr><th></th><th>Atração / evento</th><th>Tipo</th><th>Preço local</th><th>Em R$ sem IOF</th><th>Em R$ com IOF${nac?'':' ('+pct(iof,1)+')'}</th><th>Onde comprar (oficial primeiro)</th><th>Observação</th></tr>`+
    d.atr.map((a,i)=>{const lo=toBRL(a.min,d.cc),hi=toBRL(a.max,d.cc);const fm=(x)=>x==null?'—':brl(x*mult);const fi=x=>x==null?'—':brl(x*mult*(1+iof/100));
      const loc=a.max===0?'Gratuito':(nac?'':d.cc+' ')+(a.min===a.max?num(a.min,0):num(a.min,0)+' – '+num(a.max,0));
      return `<tr data-tip="atr:${i}"><td><input type="checkbox" class="vChk" data-i="${i}" checked></td><td><b>${a.n}</b></td><td>${ico(TIPO[a.t][1])} ${TIPO[a.t][0]}</td><td class="n">${loc}</td><td class="n">${a.max===0?'—':fm(lo)+(a.min!==a.max?' – '+fm(hi):'')}</td><td class="n"><b>${a.max===0?'—':fi(lo)+(a.min!==a.max?' – '+fi(hi):'')}</b></td><td>${a.on.map(o=>`<a href="${o.u}" target="_blank" rel="noopener">${o.n}</a>`).join('<br>')}</td><td class="note">${a.obs}</td></tr>`;}).join('');
  document.querySelectorAll('.vChk').forEach(c=>c.addEventListener('change',calcPacote));
  calcPacote();loadEventos(d);}
function calcPacote(){const d=destSel(),nac=d.cc==='BRL';const dias=Math.max(1,+$('#vDias').value||1),pes=Math.max(1,+$('#vPes').value||1),cl=$('#vHotel').value;
  const p=PAG[$('#vPag').value],sp=nac?0:p[1],iof=nac?0:p[2],quartos=Math.ceil(pes/2),noites=Math.max(1,dias-1);
  const loc=v=>toBRL(v,d.cc)*(1+sp/100);
  const sel=[...document.querySelectorAll('.vChk:checked')].map(c=>d.atr[+c.dataset.i]);
  const L=[['Passagens aéreas (média)',(d.voo[0]+d.voo[1])/2*pes,false,'Comprar 60–90 dias antes; terça/quarta tendem a ser mais baratas'],
   [`Hospedagem ${cl}★ — ${noites} noites, ${quartos} quarto(s)`,loc(d.hotel[cl])*noites*quartos,true,'Booking/site direto; café incluso varia'],
   [`Alimentação — ${dias} dias × ${pes}`,loc(d.alim)*dias*pes,true,'Média por pessoa/dia'],
   [`Mobilidade local — ${dias} dias × ${pes}`,loc(d.transp)*dias*pes,true,'Metrô/app; carro alugado custa mais'],
   [`Atrações e eventos selecionados (${sel.length}) × ${pes}`,sel.reduce((a,x)=>a+loc((x.min+x.max)/2),0)*pes,true,'Média entre o menor e o maior preço'],
   [`Seguro viagem — ${dias} dias × ${pes}`,nac?0:(d.ctry==='US'?28:18)*dias*pes,false,'Obrigatório na Europa; EUA ≥ US$ 100 mil']];
  if(L.some(x=>isNaN(x[1]))){$('#vPacote').innerHTML='<tr><td>Câmbio indisponível no momento.</td></tr>';return;}
  const semIof=L.reduce((a,x)=>a+x[1],0),comIof=L.reduce((a,x)=>a+x[1]*(x[2]?1+iof/100:1),0);
  $('#vPacote').innerHTML='<tr><th>Item</th><th>Sem IOF</th><th>Com IOF</th><th>Dica</th></tr>'+L.map(([n,v,io,t])=>`<tr><td>${n}</td><td class="n">${brl(v)}</td><td class="n">${brl(v*(io?1+iof/100:1))}</td><td class="note">${t}</td></tr>`).join('')+
   `<tr class="best"><td><b>Total montando você mesmo</b></td><td class="n"><b>${brl(semIof)}</b></td><td class="n"><b>${brl(comIof)}</b></td><td class="note">${brl(comIof/pes)} por pessoa · ${brl(comIof/pes/dias)} por pessoa/dia</td></tr>`+
   `<tr><td>Pacote de agência equivalente (estimativa)</td><td class="n">${brl(semIof*1.15)} – ${brl(semIof*1.3)}</td><td class="n">—</td><td class="note">Agências cobram ~15–30% a mais pela conveniência e parcelamento; IOF já embutido no preço em reais.</td></tr>`;
  $('#vInclui').innerHTML=`<ul><li>${ico('plane')} <b>Aéreo:</b> ida e volta em classe econômica, bagagem de mão (despachada costuma ser extra).</li><li>${ico('bed')} <b>Hospedagem:</b> ${noites} noites em ${cl}★, geralmente com café da manhã.</li><li>${ico('bus')} <b>Traslados:</b> aeroporto–hotel–aeroporto (mobilidade diária normalmente NÃO inclusa).</li><li>${ico('ticket')} <b>Passeios/ingressos:</b> só os listados no pacote — eventos esportivos e shows quase sempre à parte.</li><li>${ico('shield')} <b>Seguro viagem:</b> verifique cobertura mínima; muitos pacotes trazem só o básico.</li><li>${ico('wallet')} <b>Taxas:</b> taxa de turismo/resort fee local costuma ser paga no hotel.</li></ul>`;}
async function loadEventos(d){const box=$('#vEventos');
  const saz=`<p class="note">Agenda: consulte sites oficiais da cidade e das bilheterias listadas abaixo.</p>`;
  if(location.protocol==='file:'){box.innerHTML=saz;return;}
  try{const r=await getJSON(`/api/events?city=${encodeURIComponent(d.city)}&country=${d.ctry}`);
    if(!r.configured){box.innerHTML=`<p class="note">${ico('info')} Busca de eventos ao vivo pronta — falta configurar a chave gratuita da Ticketmaster (TICKETMASTER_KEY). Enquanto isso, use as bilheterias oficiais abaixo.</p>`;return;}
    if(!r.events.length){box.innerHTML='<p class="note">Nenhum evento encontrado na Ticketmaster para esta cidade nas próximas semanas.</p>';return;}
    box.innerHTML='<div class="tw"><table><tr><th>Data</th><th>Evento</th><th>Tipo</th><th>Local</th><th>Preço</th><th>Em R$ (com IOF 3,5%)</th><th>Comprar</th></tr>'+r.events.map(e=>{const br=e.min!=null&&e.cur?toBRL(e.min,e.cur):null;
      return `<tr><td>${e.date?new Date(e.date+'T12:00').toLocaleDateString('pt-BR'):''} ${e.time?e.time.slice(0,5):''}</td><td><b>${e.name}</b></td><td>${e.seg||''}${e.genre&&e.genre!=='Undefined'?' · '+e.genre:''}</td><td>${e.venue||''}</td><td class="n">${e.min!=null?e.cur+' '+num(e.min,0)+(e.max?' – '+num(e.max,0):''):'consultar'}</td><td class="n">${br?brl(br*1.035)+'+':'—'}</td><td><a href="${e.url}" target="_blank" rel="noopener">Ticketmaster</a></td></tr>`;}).join('')+'</table></div>';
  }catch(e){box.innerHTML=saz;}}
function renderForn(){const cat=$('#vFornCat').value;
  $('#vForn').innerHTML='<tr><th>Categoria</th><th>Fornecedor</th><th>Tipo</th><th>Custos e condições</th><th>Avaliação da consultoria</th><th>Reputação</th></tr>'+FORN.filter(f=>cat==='todas'||f[0]===cat).map(([c,n,t,cu,r,u])=>
   `<tr data-tip="forn:${n}"><td>${c}</td><td>${u!=='#'?`<a href="${u}" target="_blank" rel="noopener"><b>${n}</b></a>`:`<b>${n}</b>`}</td><td>${t}</td><td>${cu}</td><td><span class="tag ${r==='Ótima'||r==='Boa'?'t1':r==='Regular'?'t2':'t3'}">${r}</span></td><td><a href="https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent(n.split(' ')[0])}" target="_blank" rel="noopener">Reclame Aqui</a></td></tr>`).join('');}
function tipAtr(i){const d=destSel(),a=d.atr[+i];if(!a)return '';const nac=d.cc==='BRL';
  const rows=Object.entries(PAG).map(([k,[n,sp,io]])=>{const v=toBRL((a.min+a.max)/2,d.cc);if(v==null)return '';const s=nac?v:v*(1+sp/100);return `<tr><td>${n}</td><td class="n">${brl(s)}</td><td class="n">${brl(nac?s:s*(1+io/100))}</td></tr>`;}).join('');
  return sec(`${a.n}`,`<p>${d.n}, ${d.pais} · ${TIPO[a.t][0]}</p>`)+sec('Preço médio por forma de pagamento',`<table><tr><th>Pagamento</th><th>Sem IOF</th><th>Com IOF</th></tr>${rows}</table>`)+
   sec('Onde comprar',`<ul>${a.on.map(o=>`<li>${o.n}</li>`).join('')}</ul><p class="note">Prefira sempre o site oficial: revendedores somam 10–30% de taxa, e revenda não oficial pode ter ingresso inválido.</p>`)+(a.obs?sec('Atenção',`<p>${a.obs}</p>`):'');}
['#vDest','#vPag'].forEach(s=>$(s).addEventListener('change',renderViagens));
['#vDias','#vPes','#vHotel'].forEach(s=>$(s).addEventListener('input',calcPacote));
$('#vFornCat').addEventListener('change',renderForn);
renderViagens();renderForn();

const FRK={'Ótima':4,'Boa':3,'Regular':2,'Arriscada':1,'Não recomendada':0};
function tipForn(n){const f=FORN.find(x=>x[1]===n);if(!f)return '';return sec(f[1],`<p>${f[2]} · ${f[0]}</p><p>${f[3]}</p><p>Avaliação: <b>${f[4]}</b></p>`);}
function cmpForn(n){const f=FORN.find(x=>x[1]===n);if(!f)return '';const L=FORN.filter(x=>x[0]===f[0]).sort((a,b)=>FRK[b[4]]-FRK[a[4]]);
  return sec(`Concorrentes em ${f[0]}`,`<table><tr><th>Fornecedor</th><th>Condições</th><th>Avaliação</th></tr>${L.map(x=>`<tr class="${x[1]===n?'best':''}"><td><b>${x[1]}</b></td><td class="note">${x[3]}</td><td><span class="tag ${FRK[x[4]]>=3?'t1':FRK[x[4]]===2?'t2':'t3'}">${x[4]}</span></td></tr>`).join('')}</table><p class="note">Recomendação: ${L[0][1]} é a opção mais bem avaliada nesta categoria.</p>`);}
function cmpAtr(i){const d=destSel(),a=d.atr[+i];if(!a)return '';const pago=d.atr.filter(x=>x.max>0);const mid=x=>(x.min+x.max)/2;
  const mesmo=d.atr.filter(x=>x.t===a.t);const bar=pago.slice().sort((x,y)=>mid(x)-mid(y))[0];
  return sec('Comparação no destino',`<ul><li><b>Mais barata em ${d.n}:</b> ${bar.n} (${d.cc} ${num(mid(bar),0)})</li>${mesmo.length>1?`<li><b>Outras de ${TIPO[a.t][0].toLowerCase()}:</b> ${mesmo.filter(x=>x!==a).map(x=>x.n+' ('+d.cc+' '+num(mid(x),0)+')').join('; ')}</li>`:''}<li><b>Canais de compra:</b> ${a.on.map(o=>o.n).join(' · ')} — o primeiro é o oficial/mais seguro.</li></ul>`);}
