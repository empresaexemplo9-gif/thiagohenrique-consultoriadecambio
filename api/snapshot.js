// Chamado pelo Vercel Cron: grava cotações e indicadores no Supabase (histórico próprio).
import {fetchFx,fetchInd} from '../lib/market.js';
import {db,dbOn} from '../lib/db.js';
export default async function handler(req,res){
  if(process.env.CRON_SECRET&&req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).end();
  if(!dbOn)return res.status(200).json({ok:false,msg:'Banco não configurado'});
  const [fx,ind]=await Promise.all([fetchFx(),fetchInd().catch(()=>null)]);
  const rows=Object.entries(fx).map(([code,q])=>({code,bid:q.bid,ask:q.ask,pct_change:q.pct,source:q.src}));
  if(rows.length)await db('fx_snapshots',{method:'POST',body:rows,prefer:'return=minimal'});
  if(ind)await db('indicator_snapshots',{method:'POST',body:{selic:ind.selic,cdi:ind.cdi,ipca12:ind.ipca12,tr:ind.tr,ref_date:ind.data},prefer:'return=minimal'});
  res.status(200).json({ok:true,fx:rows.length,ind:!!ind});
}
