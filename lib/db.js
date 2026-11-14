// Cliente mínimo do Supabase via REST (PostgREST). Sem env vars, o backend funciona sem gravar.
const URL_=process.env.SUPABASE_URL, KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
export const dbOn=!!(URL_&&KEY);
export async function db(path,{method='GET',body,prefer}={}){
  if(!dbOn) return null;
  const r=await fetch(`${URL_}/rest/v1/${path}`,{method,headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body&&JSON.stringify(body)});
  if(!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return r.status===204?null:r.json();
}
