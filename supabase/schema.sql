-- Schema do Painel Financeiro (aplicar no projeto Supabase novo)
create table if not exists public.fx_snapshots (
  id bigserial primary key, captured_at timestamptz not null default now(),
  code text not null, bid numeric not null, ask numeric not null, pct_change numeric, source text);
create index if not exists fx_snapshots_code_time on public.fx_snapshots (code, captured_at desc);
create table if not exists public.indicator_snapshots (
  id bigserial primary key, captured_at timestamptz not null default now(),
  selic numeric, cdi numeric, ipca12 numeric, tr numeric, ref_date text);
create table if not exists public.institutions (
  id serial primary key, name text unique not null, kind text, spread_cash numeric, spread_card numeric,
  spread_account numeric, fee numeric default 0, safety text, reputation text, url text, updated_at timestamptz default now());
create table if not exists public.simulations (
  id bigserial primary key, created_at timestamptz default now(), amount numeric, monthly numeric, months int, result jsonb);
-- Acesso só pelo backend (service role); RLS ligado sem políticas públicas, exceto leitura
alter table public.fx_snapshots enable row level security;
alter table public.indicator_snapshots enable row level security;
alter table public.institutions enable row level security;
alter table public.simulations enable row level security;
create policy "leitura publica fx" on public.fx_snapshots for select using (true);
create policy "leitura publica ind" on public.indicator_snapshots for select using (true);
create policy "leitura publica inst" on public.institutions for select using (true);
insert into public.institutions (name,kind,spread_cash,spread_card,spread_account,safety,reputation,url) values
 ('Wise','Instituição de pagamento (autorizada BCB)',null,0.9,0.9,'Regulada BCB/FCA','Ótima','https://wise.com/br'),
 ('Nomad','Conta global (parceiro banco EUA, FDIC)',null,2.0,2.0,'FDIC até US$250 mil','Ótima','https://www.nomadglobal.com'),
 ('Inter Global Account','Banco (BCB)',null,1.5,1.5,'Banco listado Nasdaq','Boa','https://inter.co'),
 ('C6 Conta Global','Banco (BCB)',null,2.0,2.0,'Banco regulado BCB','Regular','https://www.c6bank.com.br'),
 ('Banco do Brasil','Banco público',6.5,4.0,3.5,'Muito alta','Regular','https://www.bb.com.br'),
 ('Itaú','Banco privado',7.0,4.0,4.0,'Muito alta','Regular','https://www.itau.com.br'),
 ('Bradesco','Banco privado',7.0,4.0,4.0,'Muito alta','Regular','https://banco.bradesco'),
 ('Daycoval Câmbio','Banco (BCB)',3.8,3.5,2.5,'Alta','Boa','https://www.daycoval.com.br'),
 ('Confidence Câmbio','Corretora de câmbio (BCB)',5.0,4.0,null,'Alta','Boa','https://www.confidencecambio.com.br'),
 ('Travelex','Banco de câmbio (BCB)',6.0,4.5,3.0,'Alta','Regular','https://www.travelexbank.com.br'),
 ('Cartão de crédito comum','Qualquer emissor',null,5.0,null,'Alta (contestação)','—','https://www.bcb.gov.br')
on conflict (name) do nothing;
