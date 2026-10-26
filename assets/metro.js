(() => {
  const $ = selector => document.querySelector(selector);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stations = [
    {id:'frontier',name:'先端',code:'01',x:760,y:160,tx:760,ty:100,anchor:'middle',transfer:true},
    {id:'japanese',name:'日本語',code:'02',x:520,y:160,tx:520,ty:106,anchor:'middle'},
    {id:'journal',name:'雑感',code:'03',x:330,y:250,tx:280,ty:258,anchor:'end'},
    {id:'society',name:'社会',code:'04',x:330,y:390,tx:280,ty:398,anchor:'end'},
    {id:'cst',name:'CST',code:'05',x:440,y:480,tx:440,ty:552,anchor:'middle',transfer:true},
    {id:'poem',name:'詩歌',code:'06',x:680,y:480,tx:680,ty:544,anchor:'middle'},
    {id:'philosophy',name:'哲学',code:'07',x:870,y:390,tx:918,ty:398,anchor:'start'},
    {id:'arts',name:'文藝',code:'08',x:870,y:250,tx:918,ty:258,anchor:'start'},
    {id:'highschool',name:'高校時代',code:'01',x:210,y:710,tx:260,ty:720,anchor:'start',g:true},
    {id:'travel',name:'旅',code:'04',x:1022,y:-102,tx:1072,ty:-93,anchor:'start',g:true,href:'/travel'}
  ];
  function badge(kind, number='', x=0, y=0) {
    const shape=kind==='g'?'<circle cx="0" cy="0" r="26" fill="white" stroke="var(--red)" stroke-width="8"/>':'<rect x="-26" y="-27" width="52" height="54" rx="1" fill="white" stroke="var(--green)" stroke-width="7"/>';
    return `<g class="rail-badge" transform="translate(${x} ${y})">${shape}<text class="rail-letter" text-anchor="middle" x="0" y="${number?'-1':'9'}" font-size="${number?'22':'27'}">${kind==='g'?'G':'AK'}</text>${number?`<text class="rail-number" text-anchor="middle" x="0" y="21">${number}</text>`:''}</g>`;
  }
  function lineIcon(kind){return `<svg viewBox="-33 -33 66 66" aria-hidden="true">${badge(kind)}</svg>`;}
  const station = s => `<a class="metro-station${s.transfer?' transfer':''}${s.g?' g-station':''}" href="${s.href || `/blog/${s.id}`}" data-station="${s.id}" data-x="${s.x}" data-y="${s.y}" aria-label="${s.name}${s.transfer?'、AK・G 乗り換え':''}"><rect class="station-hit" x="${s.x-65}" y="${s.y-40}" width="130" height="80" rx="8"/><circle class="station-halo" cx="${s.x}" cy="${s.y}" r="42"/>${s.transfer?`<rect class="transfer-link" x="${s.x-65}" y="${s.y-35}" width="130" height="70" rx="35"/>${badge('ak',s.code,s.x-31,s.y)}${badge('g',s.id==='cst'?'02':'03',s.x+32,s.y)}`:badge(s.g?'g':'ak',s.code,s.x,s.y)}<text class="station-name" x="${s.tx}" y="${s.ty}" text-anchor="${s.anchor}">${s.name}</text></a>`;
  $('#metro-map').innerHTML = `<svg viewBox="125 -190 1015 1010" role="group" aria-labelledby="map-name map-desc"><title id="map-name">Cyber Metro 路線図</title><desc id="map-desc">環状線は先端から反時計回りに日本語、雑感、社会、CST、詩歌、哲学、文藝。学園都市線は高校時代からCST、先端を通り、北東の旅へ。旅駅はTravelページにリンクします。</desc><g class="route-track" aria-hidden="true"><rect class="ak-route route-bed" x="330" y="160" width="540" height="320" rx="64"/><path class="g-route route-bed" d="M145 775 1087 -167"/><rect class="ak-route" x="330" y="160" width="540" height="320" rx="64"/><path class="g-route" d="M145 775 1087 -167"/></g>${stations.map(station).join('')}</svg>`;
  document.querySelectorAll('.line-symbol').forEach(el=>{el.innerHTML=lineIcon(el.classList.contains('g')?'g':'ak');});
  window.CyberMetro = {stations, lineIcon};
  const theme=$('#blog-theme');
  function updateTheme(){
    const dark=document.documentElement.dataset.blogTheme!=='light';
    theme.setAttribute('aria-label',dark?'切换浅色模式':'切换深色模式');
    theme.setAttribute('aria-pressed',String(!dark));
    theme.innerHTML=dark?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1m0-15.6-2.1 2.1M6.3 17.7l-2.1 2.1"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15A9 9 0 0 1 9 3.5 9 9 0 1 0 20.5 15Z"/></svg>';
  }
  theme.addEventListener('click',()=>{const value=document.documentElement.dataset.blogTheme==='light'?'dark':'light';document.documentElement.dataset.blogTheme=value;try{localStorage.setItem('aoraku-blog-theme',value);}catch{}updateTheme();});updateTheme();
  document.addEventListener('click',e=>{if(!$('#selected-menu').contains(e.target))$('#selected-menu').open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#selected-menu').open=false;});

  function skyline() {
    let seed=106;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};let out='';
    const colors=['#26333b','#343137','#343a32','#3b302c','#303344','#253837','#3d3542'];
    for(let layer=0;layer<2;layer++){
      let x=-20;
      while(x<1600){const w=32+rand()*50,h=65+rand()*(layer?120:230),y=470-h,kind=Math.floor(x/300)%5,fill=colors[Math.floor(rand()*colors.length)];
        out+=`<g fill="${fill}" opacity="${layer?1:.55}"><path d="M${x} 470V${y}h${w}v${h}Z"/>`;
        if(kind===0){out+=`<path d="M${x-5} ${y}h${w+10}l-8-9H${x+3}Z"/>`;for(let j=14;j<h-12;j+=20)out+=`<path d="M${x-3} ${y+j}h${w+6}" stroke="${fill}" stroke-width="7"/>`;}
        if(kind===1)out+=`<path d="M${x-8} ${y} ${x+w/2} ${y-27} ${x+w+8} ${y}Z"/><rect x="${x+w-12}" y="${y-25}" width="5" height="17"/>`;
        if(kind===2)out+=`<rect x="${x+8}" y="${y-13}" width="${w-16}" height="13"/><path d="M${x+w/2} ${y-13}v-20" stroke="${fill}" stroke-width="3"/>`;
        if(kind===3)out+=`<path d="M${x} ${y} ${x+w/2} ${y-38} ${x+w} ${y}Z"/><rect x="${x+5}" y="${y-31}" width="7" height="23"/>`;
        if(kind===4)out+=`<path d="M${x-10} ${y+4}Q${x+w/2} ${y-14} ${x+w/2} ${y-38}Q${x+w/2} ${y-14} ${x+w+10} ${y+4}Z"/>`;
        for(let wy=y+13;wy<459;wy+=22)for(let wx=x+8;wx<x+w-7;wx+=17)out+=`<rect x="${wx}" y="${wy}" width="6" height="9" fill="#080b0f"/>`;
        out+='</g>';x+=w+5+rand()*10;
      }
    }
    return `<svg viewBox="0 0 1600 500" preserveAspectRatio="xMidYMax slice">${out}</svg>`;
  }
  const intro=$('#metro-intro');
  if(/^\/blog\/?$/.test(location.pathname)&&!location.hash&&!reduced()){
    intro.hidden=false;$('#intro-skyline').innerHTML=skyline();document.body.classList.add('intro-playing');
    const surfaces=[$('.metro-toolbar'),$('#main-content'),$('.site-footer')];surfaces.forEach(e=>e.inert=true);
    let frame,finished=false;
    function finish(){if(finished)return;finished=true;cancelAnimationFrame(frame);intro.hidden=true;surfaces.forEach(e=>e.inert=false);document.body.classList.remove('intro-playing');document.removeEventListener('keydown',key);}
    function key(e){if(['Escape','Enter',' '].includes(e.key)){e.preventDefault();finish();}}
    intro.addEventListener('click',finish,{once:true});document.addEventListener('keydown',key);const start=performance.now(),words="Aoraku's Blog: Cyber Metro";
    // Slow almost to a stop at 30% of the journey, then accelerate.
    const movingMs=2700, holdMs=1000, fadeMs=200;
    function tick(now){
      const elapsed=now-start, t=Math.min(1,elapsed/movingMs);
      const p=t<=.3 ? .3*(1-Math.pow(1-t/.3,3)) : .3+.7*Math.pow((t-.3)/.7,2);
      $('#intro-type').textContent=words.slice(0,Math.ceil(p*words.length));
      $('#intro-subtitle').textContent='Da sein.'.slice(0,Math.ceil(p*8));
      $('#intro-train').style.transform=`translateX(${(-820+(innerWidth+1640)*p)}px)`;
      intro.classList.toggle('intro-complete',t===1);
      const fade=Math.max(0,elapsed-movingMs-holdMs)/fadeMs;
      intro.style.opacity=String(1-Math.min(1,fade));
      if(fade<1)frame=requestAnimationFrame(tick);else finish();
    }
    frame=requestAnimationFrame(tick);
  }
})();
