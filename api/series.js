// GET /api/series?c=4189,13522&n=24 — séries do BCB/SGS via servidor (o navegador é bloqueado por CORS).
const OK=new Set(['432','4189','4389','433','13522','189','190','226','1178','24369','4390','11','1','21619','21620']);
export default async function handler(req,res){
  const codes=String(req.query.c||'').split(',').filter(c=>OK.has(c)).slice(0,10);
  const n=Math.min(500,Math.max(1,parseInt(req.query.n)||24));
  const out={};
  await Promise.all(codes.map(async c=>{try{
    const r=await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${c}/dados/ultimos/${n}?formato=json`,{headers:{Accept:'application/json'}});
    if(r.ok)out[c]=(await r.json()).map(x=>({data:x.data,valor:+String(x.valor).replace(',','.')}));
  }catch(e){}}));
  res.setHeader('Cache-Control','s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json(out);
}
