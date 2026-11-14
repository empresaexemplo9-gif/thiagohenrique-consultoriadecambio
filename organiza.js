'use strict';
// Índice de seções no topo de cada aba e subaba: mostra o que existe ali e leva direto ao quadro.
document.querySelectorAll('.view').forEach(view=>{
  const alvos=view.querySelector('.subview')?[...view.querySelectorAll('.subview')]:[view];
  alvos.forEach(box=>{if(box.querySelector(':scope > .subnav'))return;
    const cards=[...box.querySelectorAll('.card')].filter(c=>!c.closest('.cgrid')&&c.querySelector('h2'));if(cards.length<2)return;
    const nav=document.createElement('div');nav.className='toc';nav.innerHTML='<span>Nesta página</span>';
    cards.forEach(c=>{const b=document.createElement('button');b.type='button';b.textContent=c.querySelector('h2').textContent.split('—')[0].trim();b.addEventListener('click',()=>c.scrollIntoView({behavior:'smooth',block:'start'}));nav.appendChild(b);});
    const primeiro=box.querySelector(':scope > .card, :scope > .grid2, :scope > .kpis, :scope > #tools');if(primeiro)box.insertBefore(nav,primeiro);});});
