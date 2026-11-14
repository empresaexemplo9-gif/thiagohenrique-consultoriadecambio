export const CODES=['USD','EUR','JPY','GBP','CNY','AUD','CAD','CHF','HKD','SGD','SEK','KRW','NOK','NZD','INR','MXN','TWD','ZAR','DKK','ARS'];
const j=async u=>{const r=await fetch(u);if(!r.ok)throw new Error(u+' '+r.status);return r.json();};
const n=v=>+String(v).replace(',','.');
export async function fetchFx(){
  const fx={};
  try{const d=await j('https://economia.awesomeapi.com.br/json/last/'+CODES.map(c=>c+'-BRL').join(','));
    for(const k in d){const q=d[k];fx[q.code]={bid:+q.bid,ask:+q.ask,pct:+q.pctChange,high:+q.high,low:+q.low,src:'AwesomeAPI',ts:q.create_date};}}catch(e){}
  const miss=CODES.filter(c=>!fx[c]);
  if(miss.length){try{const d=await j('https://api.frankfurter.app/latest?from=BRL');
    for(const c of miss)if(d.rates[c]){const v=1/d.rates[c];fx[c]={bid:v,ask:v,pct:0,high:v,low:v,src:'BCE (Frankfurter)',ts:d.date};}}catch(e){}}
  return fx;
}
const sgs=(c,k=1)=>j(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${c}/dados/ultimos/${k}?formato=json`);
export async function fetchInd(){
  const [s,c,i,t]=await Promise.all([sgs(432),sgs(4389),sgs(13522),sgs(226)]);
  return {selic:n(s[0].valor),cdi:n(c[0].valor),ipca12:n(i[0].valor),tr:n(t[0].valor)*12,data:s[0].data};
}
export async function fetchFocus(){
  const ano=new Date().getFullYear();
  const f=encodeURIComponent(`(Indicador eq 'IPCA' or Indicador eq 'Selic' or Indicador eq 'Câmbio' or Indicador eq 'PIB Total') and baseCalculo eq 0`);
  const d=await j(`https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$top=60&$orderby=Data%20desc&$format=json&$filter=${f}`);
  const m={};for(const r of d.value){const k=r.Indicador+'|'+r.DataReferencia;if(!m[k]&&+r.DataReferencia>=ano&&+r.DataReferencia<=ano+2)m[k]=r;}
  return Object.values(m);
}
