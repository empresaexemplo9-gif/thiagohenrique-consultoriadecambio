// POST /api/simulations — salva uma simulação; GET lista as 20 últimas.
import {db,dbOn} from '../lib/db.js';
export default async function handler(req,res){
  if(!dbOn)return res.status(200).json({db:false,rows:[]});
  if(req.method==='POST'){const b=req.body||{};
    const row={amount:+b.amount||0,monthly:+b.monthly||0,months:Math.min(600,parseInt(b.months)||1),result:b.result&&typeof b.result==='object'?b.result:null};
    await db('simulations',{method:'POST',body:row,prefer:'return=minimal'});return res.status(201).json({ok:true});}
  res.status(200).json({db:true,rows:await db('simulations?select=*&order=created_at.desc&limit=20')});
}
