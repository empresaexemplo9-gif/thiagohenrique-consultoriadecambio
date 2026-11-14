// GET /api/fxvol — volatilidade anualizada e variação de 12 meses das principais moedas x BRL (BCE via Frankfurter).
const CUR=['USD','EUR','GBP','JPY','CHF','CAD','AUD','CNY','MXN'];
export default async function handler(req,res){
  const end=new Date(),ini=new Date(Date.now()-370*864e5),f=d=>d.toISOString().slice(0,10);
  try{const r=await fetch(`https://api.frankfurter.app/${f(ini)}..${f(end)}?from=BRL&to=${CUR.join(',')}`);const d=await r.json();
    const dates=Object.keys(d.rates).sort();const out={};
    for(const c of CUR){const s=dates.map(t=>d.rates[t][c]).filter(Boolean).map(v=>1/v);if(s.length<30)continue;
      const rets=s.slice(1).map((v,i)=>Math.log(v/s[i]));const m=rets.reduce((a,b)=>a+b,0)/rets.length;
      const vol=Math.sqrt(rets.reduce((a,b)=>a+(b-m)**2,0)/(rets.length-1))*Math.sqrt(252);
      out[c]={vol,chg1y:s.at(-1)/s[0]-1,min:Math.min(...s),max:Math.max(...s),last:s.at(-1)};}
    res.setHeader('Cache-Control','s-maxage=21600, stale-while-revalidate=86400');res.status(200).json(out);
  }catch(e){res.status(200).json({});}
}
