(() => {
  const routes = {
    ak: ['frontier','japanese','journal','society','cst','poem','philosophy','arts'],
    g: ['highschool','cst','frontier','travel']
  };
  const names = {
    frontier: ['先端','せんたん','Sentan'], japanese: ['日本語','にほんご','Nihongo'],
    journal: ['雑感','ざっかん','Zakkan'], society: ['社会','しゃかい','Shakai'],
    cst: ['CST','シー・エス・ティー','CST'], poem: ['詩歌','しいか','Shiika'],
    philosophy: ['哲学','てつがく','Tetsugaku'], arts: ['文藝','ぶんげい','Bungei'],
    highschool: ['高校時代','こうこうじだい','Kōkō Jidai'], travel: ['旅','たび','Tabi']
  };
  let frame = 0, currentLine = null, moving = false;
  const host = document.getElementById('station-platform');
  const code = (id,line) => String(routes[line].indexOf(id)+1).padStart(2,'0');
  const symbol = (id,line) => `<span class="platform-code ${line}"><b>${line.toUpperCase()}</b><b>${code(id,line)}</b></span>`;
  const href = id => id === 'travel' ? '/travel' : `/blog/${id}`;

  function train(line) {
    const red = line === 'g', body = red ? '#d72c37' : '#cbd1d0';
    // Original side elevation: E235 green doors / Marunouchi 2000 red body and white wave.
    const car = (x, cab) => `<g transform="translate(${x} 0)">
      <rect x="30" y="11" width="90" height="9" rx="3" fill="#737e83"/>
      <rect x="245" y="11" width="90" height="9" rx="3" fill="#737e83"/>
      <path d="M8 32Q8 20 22 20H${cab?374:390}Q${cab?400:404} 20 404 ${cab?45:32}V119H8Z" fill="${body}" stroke="#687176" stroke-width="1.5"/>
      <path d="M14 26H${cab?371:397}" stroke="${red?'#f56469':'#88bd32'}" stroke-width="5"/>
      ${[40,136,232].map(x=>`<g><rect x="${x}" y="32" width="36" height="80" rx="2" fill="${red?'#c51e2c':'#8cc63e'}" stroke="${red?'#9b1625':'#798b6b'}"/>
      <path d="M${x+18} 33V111" stroke="${red?'#f27b83':'#c6de9a'}"/>
      <rect x="${x+4}" y="41" width="11" height="38" rx="2" fill="#17282d"/><rect x="${x+21}" y="41" width="11" height="38" rx="2" fill="#17282d"/>
      <rect x="${x+43}" y="40" width="43" height="39" rx="3" fill="#17282d" stroke="#6b787b"/><path d="M${x+64} 41V78" stroke="#697b80"/></g>`).join('')}
      ${red?'<path d="M10 92H315Q339 92 359 101T400 101" fill="none" stroke="#faf7ec" stroke-width="5"/>':'<path d="M10 115H400" stroke="#a0aaa9" stroke-width="3"/>'}
      ${cab?`<path d="M368 33H382Q394 33 394 47V80H368Z" fill="#14252b"/><path d="M398 47V110" stroke="${red?'#f6efdf':'#8cc63e'}" stroke-width="7"/><circle cx="394" cy="91" r="4" fill="#fff7ce"/>`:''}
      <rect x="16" y="119" width="382" height="9" rx="2" fill="#424c51"/>
      ${[55,300].map(x=>`<rect x="${x-9}" y="125" width="64" height="12" rx="3" fill="#242c30"/><circle cx="${x}" cy="136" r="9" fill="#0a1114" stroke="#637076" stroke-width="3"/><circle cx="${x+36}" cy="136" r="9" fill="#0a1114" stroke="#637076" stroke-width="3"/>`).join('')}
    </g>`;
    return `<svg viewBox="0 0 840 150" aria-hidden="true"><path d="M405 103H432" stroke="#647076" stroke-width="9"/>${car(0,false)}${car(426,true)}</svg>`;
  }

  function cancel() {
    cancelAnimationFrame(frame); frame = 0; moving = false;
    host.classList.remove('is-moving'); host.removeAttribute('aria-busy');
  }

  function render(id, navigate) {
    cancel();
    const valid = Object.keys(routes).filter(line=>routes[line].includes(id));
    host.hidden = !valid.length;
    if (!valid.length) return;
    if (!valid.includes(currentLine)) currentLine = valid.includes('g') ? 'g' : 'ak';
    const line = currentLine, order = routes[line], i = order.indexOf(id), loop = line === 'ak';
    const prev = order[loop ? (i-1+order.length)%order.length : i-1];
    const next = order[loop ? (i+1)%order.length : i+1];
    const [name,kana,roman] = names[id];
    const neighbor = (dest,dir) => dest ? `<a class="platform-neighbor ${dir}" href="${href(dest)}" data-direction="${dir}" aria-label="${dir==='left'?'前':'次'}の駅：${names[dest][0]}"><span>${names[dest][0]}</span><small>${names[dest][2]}</small></a>` : '<span class="platform-terminus" aria-hidden="true"></span>';
    const arrow = (dest,dir) => dest ? `<a class="platform-arrow ${dir}" href="${href(dest)}" data-direction="${dir}" aria-label="${dir==='left'?'前':'次'}の駅：${names[dest][0]}">${dir==='left'?'←':'→'}</a>` : `<span class="platform-arrow unavailable" aria-hidden="true">${dir==='left'?'←':'→'}</span>`;
    host.dataset.platformLine = line;
    host.innerHTML = `<div class="platform-controls">${valid.length===2?`<button class="platform-transfer" type="button" aria-label="${line==='ak'?'学園都市線':'環状線'}に乗換">乗換 <span class="transfer-target ${line==='ak'?'g':'ak'}">${line==='ak'?'G':'AK'}</span></button>`:''}</div>
      <div class="platform-sign-row">${arrow(prev,'left')}<div class="station-sign ${line}">
        <div class="sign-heading">${symbol(id,line)}<div class="sign-name"><strong>${name}</strong><span>${kana}</span></div><span class="sign-line-name">${line==='ak'?'環状線':'学園都市線'}</span></div>
        <div class="sign-band"><span>${prev?'←':''}</span><i></i><span>${next?'→':''}</span></div>
        <div class="sign-neighbors">${neighbor(prev,'left')}<span class="sign-roman">${roman}</span>${neighbor(next,'right')}</div>
      </div>${arrow(next,'right')}</div>
      <div class="platform-track" aria-hidden="true"><div class="platform-train">${train(line)}</div><div class="rail-sleepers"></div><div class="rail-top"></div><div class="rail-bottom"></div></div>`;
    host.querySelector('.platform-transfer')?.addEventListener('click',()=>{
      if(moving)return;
      currentLine = line === 'ak' ? 'g' : 'ak'; render(id,navigate);
    });
    host.querySelectorAll('a[data-direction]').forEach(link=>link.addEventListener('click',event=>{
      if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault(); event.stopPropagation();
      if(moving)return;
      const dest = link.getAttribute('href'), left = link.dataset.direction === 'left';
      const arrive = ()=>{
        cancel();
        if(dest==='/travel') location.assign(dest);
        else {
          const list = new URLSearchParams(location.search).get('view') === 'list';
          navigate(dest+(list?'?view=list':''));
        }
      };
      if(matchMedia('(prefers-reduced-motion: reduce)').matches) { arrive(); return; }
      moving = true; host.classList.add('is-moving'); host.setAttribute('aria-busy','true');
      const vehicle = host.querySelector('.platform-train'), track = host.querySelector('.platform-track');
      const width = track.clientWidth, length = vehicle.clientWidth, start = performance.now();
      const animate = now=>{
        const t = Math.min(1,(now-start)/window.CyberMetro.motion.duration);
        const p = window.CyberMetro.motion.progress(t);
        const x = left ? width-(width+length)*p : -length+(width+length)*p;
        vehicle.style.transform = `translateX(${x}px)`;
        vehicle.querySelector('svg').style.transform = left ? 'scaleX(-1)' : '';
        if(t<1)frame=requestAnimationFrame(animate);else arrive();
      };
      frame=requestAnimationFrame(animate);
    }));
  }
  window.StationPlatform = {render,cancel};
})();
