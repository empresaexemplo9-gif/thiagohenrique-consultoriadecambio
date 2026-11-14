// Cliente mínimo do Supabase via REST (PostgREST).
// Usa a service role se existir (recomendado para gravações); senão a chave publicável, limitada pelas políticas RLS.
const URL_=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const dbOn=!!(URL_&&KEY);
export async function db(path,{method='GET',body,prefer}={}){
  if(!dbOn) return null;
  const r=await fetch(`${URL_}/rest/v1/${path}`,{method,headers:{apikey:KEY,...(KEY.startsWith('sb_')?{}:{Authorization:`Bearer ${KEY}`}),'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body&&JSON.stringify(body)});
  if(!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return r.status===204||r.status===201?null:r.json();
}
