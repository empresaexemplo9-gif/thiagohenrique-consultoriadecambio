// GET /api/market — câmbio + indicadores + Focus, buscados no servidor (sem CORS) com cache de CDN de 60s.
import {fetchFx,fetchInd,fetchFocus} from '../lib/market.js';
import {db,dbOn} from '../lib/db.js';
export default async function handler(req,res){
  const [fx,ind,focus,inst]=await Promise.allSettled([fetchFx(),fetchInd(),fetchFocus(),db('institutions?select=*&order=name')]);
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');
  res.status(200).json({fx:fx.value||{},ind:ind.value||null,focus:focus.value||null,institutions:inst.value||null,db:dbOn,at:new Date().toISOString()});
}
