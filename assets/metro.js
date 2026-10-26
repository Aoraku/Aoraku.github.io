(() => {
  const $ = selector => document.querySelector(selector);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stations = [
    {id:'frontier',name:'先端',code:'01',x:760,y:160,tx:826,ty:120,anchor:'start',transfer:true},
    {id:'japanese',name:'日本語',code:'02',x:565,y:160,tx:565,ty:106,anchor:'middle'},
    {id:'journal',name:'雑感',code:'03',x:330,y:250,tx:280,ty:258,anchor:'end'},
    {id:'society',name:'社会',code:'04',x:330,y:390,tx:280,ty:398,anchor:'end'},
    {id:'cst',name:'CST',code:'05',x:440,y:480,tx:360,ty:475,anchor:'end',transfer:true},
    {id:'poem',name:'詩歌',code:'06',x:640,y:480,tx:640,ty:544,anchor:'middle'},
    {id:'philosophy',name:'哲学',code:'07',x:870,y:390,tx:918,ty:398,anchor:'start'},
    {id:'arts',name:'文藝',code:'08',x:870,y:250,tx:918,ty:258,anchor:'start'},
    {id:'highschool',name:'高校時代',code:'01',x:330,y:590,tx:380,ty:600,anchor:'start',g:true}
  ];
  function badge(kind, number='', x=0, y=0) {
    const shape=kind==='g'?'<circle cx="0" cy="0" r="26" fill="white" stroke="var(--red)" stroke-width="8"/>':'<rect x="-26" y="-27" width="52" height="54" rx="1" fill="white" stroke="var(--green)" stroke-width="7"/>';
    return `<g class="rail-badge" transform="translate(${x} ${y})">${shape}<text class="rail-letter" text-anchor="middle" x="0" y="${number?'-1':'9'}" font-size="${number?'22':'27'}">${kind==='g'?'G':'AK'}</text>${number?`<text class="rail-number" text-anchor="middle" x="0" y="21">${number}</text>`:''}</g>`;
  }
  function lineIcon(kind){return `<svg viewBox="-33 -33 66 66" aria-hidden="true">${badge(kind)}</svg>`;}
  const station = s => `<a class="metro-station${s.transfer?' transfer':''}${s.g?' g-station':''}" href="/blog/${s.id}" data-station="${s.id}" data-x="${s.x}" data-y="${s.y}" aria-label="${s.name}${s.transfer?'、AK・G 乗り換え':''}"><rect class="station-hit" x="${s.x-65}" y="${s.y-40}" width="130" height="80" rx="8"/><circle class="station-halo" cx="${s.x}" cy="${s.y}" r="42"/>${s.transfer?`<rect class="transfer-link" x="${s.x-65}" y="${s.y-35}" width="130" height="70" rx="35"/>${badge('ak',s.code,s.x-31,s.y)}${badge('g',s.id==='cst'?'02':'03',s.x+32,s.y)}`:badge(s.g?'g':'ak',s.code,s.x,s.y)}<text class="station-name" x="${s.tx}" y="${s.ty}" text-anchor="${s.anchor}">${s.name}</text></a>`;
  $('#metro-map').innerHTML = `<svg viewBox="170 5 870 670" role="group" aria-labelledby="map-name map-desc"><title id="map-name">Cyber Metro 路線図</title><desc id="map-desc">環状線は先端から反時計回りに日本語、雑感、社会、CST、詩歌、哲学、文藝。学園都市線は高校時代からCSTと先端を通り北東へ。</desc><g class="route-track" aria-hidden="true"><rect class="ak-route route-bed" x="330" y="160" width="540" height="320" rx="64"/><path class="g-route route-bed" d="M280 640 890 30"/><rect class="ak-route" x="330" y="160" width="540" height="320" rx="64"/><path class="g-route" d="M280 640 890 30"/></g><g class="route-label" transform="translate(479 267)" aria-hidden="true">${badge('ak','',0,0)}<text x="44" y="-2" class="route-name">環状線</text><text x="45" y="19" class="route-en">Kanjō Line</text></g><g class="route-label" transform="translate(630 410)" aria-hidden="true">${badge('g','',0,0)}<text x="44" y="-2" class="route-name">学園都市線</text><text x="45" y="19" class="route-en">Gakuen-toshi Line</text></g>${stations.map(station).join('')}</svg>`;
  document.querySelectorAll('.line-symbol').forEach(el=>{el.innerHTML=lineIcon(el.classList.contains('g')?'g':'ak');});
  let entrance;
  window.CyberMetro = {
    stations,
    lineIcon,
    async enter(link) {
      if (entrance || reduced()) return !entrance;
      const map=$('#metro-map');const svg=map.querySelector('svg');const point=svg.createSVGPoint();point.x=Number(link.dataset.x);point.y=Number(link.dataset.y);const screen=point.matrixTransform(svg.getScreenCTM()), rect=map.getBoundingClientRect();
      map.style.transformOrigin=`${screen.x-rect.left}px ${screen.y-rect.top}px`;
      map.dataset.transitioning='true';
      entrance=map.animate([{transform:'scale(1)',opacity:1},{transform:'scale(1.35)',opacity:.9,offset:.35},{transform:'scale(3.5)',opacity:0}],{duration:680,easing:'cubic-bezier(.25,.05,.2,1)',fill:'forwards'});
      try {await entrance.finished;return true;}catch{return false;}
    },
    reset(){if(entrance){entrance.cancel();entrance=null;}delete $('#metro-map').dataset.transitioning;}
  };
  const theme=$('#blog-theme');
  function updateTheme(){const dark=document.documentElement.dataset.blogTheme!=='light';theme.setAttribute('aria-label',dark?'切换浅色模式':'切换深色模式');theme.setAttribute('aria-pressed',String(!dark));theme.firstElementChild.textContent=dark?'☼':'☾';}
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
    function tick(now){const t=Math.min(1,(now-start)/2700),p=t+.115*Math.sin(2*Math.PI*t);$('#intro-type').textContent=words.slice(0,Math.ceil(p*words.length));$('#intro-train').style.transform=`translateX(${(-850+(innerWidth+1700)*p)}px)`;intro.style.opacity=t>.92?String((1-t)/.08):'1';if(t<1)frame=requestAnimationFrame(tick);else finish();}
    frame=requestAnimationFrame(tick);
  }
})();
