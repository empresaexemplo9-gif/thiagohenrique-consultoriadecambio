// GET /api/crypto — top criptoativos em BRL (CoinGecko), com variação 1h/24h/7d/30d/1a, capitalização, volume e sparkline 7d.
export default async function handler(req,res){
  let data=null,src='CoinGecko';
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=12&page=1&sparkline=true&price_change_percentage=1h,24h,7d,30d,1y',{headers:{Accept:'application/json'}});
    if(r.ok)data=(await r.json()).map(c=>({id:c.id,sym:c.symbol.toUpperCase(),name:c.name,rank:c.market_cap_rank,price:c.current_price,mcap:c.market_cap,vol:c.total_volume,high:c.high_24h,low:c.low_24h,
      ch1h:c.price_change_percentage_1h_in_currency,ch24:c.price_change_percentage_24h_in_currency,ch7:c.price_change_percentage_7d_in_currency,ch30:c.price_change_percentage_30d_in_currency,ch1y:c.price_change_percentage_1y_in_currency,
      ath:c.ath,athPct:c.ath_change_percentage,athDate:c.ath_date,spark:(c.sparkline_in_7d?.price||[]).filter((_,i)=>i%4===0)}));
  }catch(e){}
  if(!data){src='AwesomeAPI';try{
    const r=await fetch('https://economia.awesomeapi.com.br/json/last/BTC-BRL,ETH-BRL,SOL-BRL,XRP-BRL,LTC-BRL,DOGE-BRL');
    if(r.ok)data=Object.values(await r.json()).map((q,i)=>({sym:q.code,name:q.name.split('/')[0],rank:i+1,price:+q.bid,high:+q.high,low:+q.low,ch24:+q.pctChange,spark:[]}));
  }catch(e){}}
  res.setHeader('Cache-Control','s-maxage=120, stale-while-revalidate=600');
  res.status(200).json({src,data:data||[],at:new Date().toISOString()});
}
