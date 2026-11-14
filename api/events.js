// GET /api/events?city=Paris&country=FR — próximos eventos reais (Ticketmaster Discovery API).
// Requer TICKETMASTER_KEY (gratuita em developer.ticketmaster.com). Sem chave, responde configured:false.
export default async function handler(req,res){
  const key=process.env.TICKETMASTER_KEY;
  if(!key)return res.status(200).json({configured:false,events:[]});
  const city=String(req.query.city||'').slice(0,60),cc=String(req.query.country||'').replace(/[^A-Z]/gi,'').slice(0,2);
  const u=`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${key}&city=${encodeURIComponent(city)}${cc?'&countryCode='+cc:''}&size=20&sort=date,asc&locale=*`;
  try{const r=await fetch(u);const d=await r.json();
    const events=(d._embedded?.events||[]).map(e=>({name:e.name,date:e.dates?.start?.localDate,time:e.dates?.start?.localTime,
      venue:e._embedded?.venues?.[0]?.name,seg:e.classifications?.[0]?.segment?.name,genre:e.classifications?.[0]?.genre?.name,
      min:e.priceRanges?.[0]?.min,max:e.priceRanges?.[0]?.max,cur:e.priceRanges?.[0]?.currency,url:e.url}));
    res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=7200');res.status(200).json({configured:true,events});
  }catch(e){res.status(200).json({configured:true,events:[],error:'falha na consulta'});}
}
