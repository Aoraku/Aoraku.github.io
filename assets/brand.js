(() => {
  const variants = [
    {id:'seal', name:'Seal'},
    {id:'music', name:'Music'},
    {id:'code', name:'Code'},
    {id:'phantom', name:'Phantom'},
    {id:'story', name:'Monogatari'},
    {id:'shinobi', name:'Shinobi'}
  ];
  const key = 'aoraku-brand-style';
  let index = 0;
  try { const saved=variants.findIndex(v=>v.id===localStorage.getItem(key)); if(saved>=0)index=saved; } catch {}
  function render(announce=false) {
    const current=variants[index], next=variants[(index+1)%variants.length];
    document.querySelectorAll('.brand-switch').forEach(button=>{
      button.dataset.style=current.id;
      button.querySelector('img').src=`/assets/brand/${current.id}.svg`;
      button.setAttribute('aria-label',`${current.name} logo. Switch to ${next.name} style`);
      button.title=`${current.name} · Click for ${next.name}`;
      if(announce)button.parentElement.querySelector('.brand-status').textContent=`${current.name} logo`;
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{
    variants.forEach(v=>{const image=new Image();image.src=`/assets/brand/${v.id}.svg`;});
    render();
    document.querySelectorAll('.brand-switch').forEach(button=>button.addEventListener('click',()=>{
      index=(index+1)%variants.length;
      try{localStorage.setItem(key,variants[index].id);}catch{}
      render(true);
    }));
  });
  window.addEventListener('storage',event=>{
    if(event.key!==key)return;
    index=Math.max(0,variants.findIndex(v=>v.id===event.newValue));render();
  });
})();
