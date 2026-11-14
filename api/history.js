// GET /api/history?code=USD&days=90 — histórico gravado no banco próprio.
import {db,dbOn} from '../lib/db.js';
export default async function handler(req,res){
  if(!dbOn)return res.status(200).json({db:false,rows:[]});
  const code=String(req.query.code||'USD').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);
  const days=Math.min(3650,Math.max(1,parseInt(req.query.days)||90));
  const since=new Date(Date.now()-days*864e5).toISOString();
  const rows=await db(`fx_snapshots?select=captured_at,bid,ask&code=eq.${code}&captured_at=gte.${since}&order=captured_at.asc`);
  res.setHeader('Cache-Control','s-maxage=300');res.status(200).json({db:true,code,rows});
}
