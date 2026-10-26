(() => {
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const configs = {
    '156': {file:'china',name:'China',count:34,label:'province-level regions',center:[104,34],zoom:1.65},
    '392': {file:'japan',name:'Japan',count:47,label:'prefectures',center:[137,37],zoom:3.05},
    '840': {file:'us',name:'United States',count:50,label:'states',center:[-103,39],zoom:1.6}
  };
  let world, visits=[], regions={}, activeCountry='', activeRegion='', projection, path, svg, countriesLayer, regionsLayer, markerLayer, frame=0;
  const baseScale=265;
  let spinning=!matchMedia('(prefers-reduced-motion: reduce)').matches, spinFrame=0, spinTime=0, focusing=false;
  function setRotation(value) {
    spinning=value;
    const button=$('#toggle-rotation');
    button.setAttribute('aria-pressed',String(value));
    button.setAttribute('aria-label',value?'Pause globe rotation':'Start globe rotation');
    button.querySelector('.rotation-icon').textContent=value?'Ⅱ':'▷';
    button.querySelector('.rotation-label').textContent=value?'Pause':'Rotate';
  }
  function animate(now) {
    const delta=spinTime?Math.min(now-spinTime,100):0;
    spinTime=now;
    if(spinning&&!focusing&&!document.hidden){
      const rotation=projection.rotate();rotation[0]+=delta*.003;
      projection.rotate(rotation);draw();
    }
    spinFrame=requestAnimationFrame(animate);
  }
  function stopMotion() {setRotation(false);cancelAnimationFrame(frame);focusing=false;}
  function renderCountryPicker() {
    const needle=$('#country-search').value.trim().toLowerCase();
    const countries=world.features.filter(f=>visitedCountry(f.id)&&f.properties.name.toLowerCase().includes(needle)).sort((a,b)=>a.properties.name.localeCompare(b.properties.name));
    $('#country-options').innerHTML=countries.map(f=>`<button type="button" data-place="${esc(f.id)}">${esc(f.properties.name)}<span aria-hidden="true">↗</span></button>`).join('') || '<p class="picker-empty">No places with notes yet.</p>';
  }
  const visitedCountry=id=>visits.some(v=>v.country===id);
  const visitedRegion=id=>visits.some(v=>v.region===id);
  const currentRegions=()=>regions[activeCountry]?.features || [];
  const regionCode = id => id.split('-').pop();
  const travelPath = (country='', region='') => '/travel' + (country ? `/${country}` : '') + (region ? `/${regionCode(region)}` : '');
  function navigate(country='',region='') {
    const url = travelPath(country,region);
    if (location.pathname.replace(/\/+$/, '') !== url || location.hash) history.pushState({}, '', url);
    applyRoute();
  }
  function tooltip(text='') {$('#globe-tooltip').textContent=text;}
  function draw() {
    svg.selectAll('.geo-path').attr('d',path);
    markerLayer.selectAll('circle').attr('transform',d=>`translate(${projection(d.center)})`).attr('display',d=>d3.geoDistance(d.center,[-projection.rotate()[0],-projection.rotate()[1]])<Math.PI/2?null:'none');
  }
  function focus(center,zoom) {
    cancelAnimationFrame(frame);focusing=true;
    const from=projection.rotate(), target=[-center[0],-center[1],0];
    while(target[0]-from[0]>180)target[0]-=360;
    while(target[0]-from[0]<-180)target[0]+=360;
    const scale=projection.scale(),toScale=baseScale*zoom;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const started=performance.now();
    function tick(now){const t=reduced?1:Math.min(1,(now-started)/520),e=d3.easeCubicInOut(t);projection.rotate(from.map((x,i)=>x+(target[i]-x)*e)).scale(scale+(toScale-scale)*e);draw();if(t<1)frame=requestAnimationFrame(tick);else focusing=false;}
    frame=requestAnimationFrame(tick);
  }
  function applyRoute() {
    if (location.hash.startsWith('#country=')) {
      const legacy=new URLSearchParams(location.hash.slice(1));
      history.replaceState({}, '', travelPath(legacy.get('country')||'', legacy.get('region')||''));
    }
    const parts=location.pathname.replace(/\/+$/, '').split('/');
    const id=parts[2]||'';const selected=world.features.find(f=>f.id===id);
    activeCountry=selected?id:'';
    const region=currentRegions().find(f=>regionCode(f.id)===(parts[3]||''));
    const requested=region?.id||'';
    activeRegion=region?requested:'';
    if(selected)setRotation(false);
    $('#reset-globe').setAttribute('aria-pressed',String(!activeCountry));
    $('#country-picker').open=false;
    document.querySelectorAll('[data-country]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.country===activeCountry)));
    countriesLayer.selectAll('path').classed('is-selected',f=>f.id===activeCountry);
    regionsLayer.selectAll('*').remove();markerLayer.selectAll('*').remove();
    if(configs[activeCountry]){
      regionsLayer.selectAll('path').data(currentRegions()).join('path').attr('class',f=>`geo-path region-shape${visitedRegion(f.id)?' has-visits':''}${f.id===activeRegion?' is-selected':''}`).attr('data-region',f=>f.id).on('click',(event,f)=>{if(!event.defaultPrevented){event.stopPropagation();navigate(activeCountry,f.id);}}).on('pointerenter',(_,f)=>tooltip(f.properties.name)).on('pointerleave',()=>tooltip());
      // Provide a visible map target for Hong Kong and Macao at country scale.
      const tiny=currentRegions().filter(f=>['CN-810000','CN-820000'].includes(f.id)).map(f=>({...f,center:f.properties.center||d3.geoCentroid(f)}));
      markerLayer.selectAll('circle').data(tiny).join('circle').attr('class','region-marker').attr('r',3.5).on('click',(event,f)=>{if(!event.defaultPrevented){event.stopPropagation();navigate(activeCountry,f.id);}}).on('pointerenter',(_,f)=>tooltip(f.properties.name)).on('pointerleave',()=>tooltip());
    }
    $('#region-search').value='';renderSidebar(selected,region);renderRegions();tooltip();
    if(region)focus(region.properties.center||d3.geoCentroid(region),Math.min(4.7,(configs[activeCountry]?.zoom||2)*1.6));
    else if(selected){const config=configs[activeCountry];focus(config?.center||d3.geoCentroid(selected),config?.zoom||1.9);}
    else focus([105,20],1);
    draw();
  }
  function renderRegions() {
    const needle=$('#region-search').value.trim().toLowerCase();
    const filtered=currentRegions().filter(f=>`${f.properties.name} ${f.properties.english||''} ${f.id}`.toLowerCase().includes(needle));
    $('#region-list').innerHTML=filtered.map(f=>`<button type="button" class="region-button${visitedRegion(f.id)?' has-visits':''}" data-region="${esc(f.id)}" aria-pressed="${f.id===activeRegion}">${esc(f.properties.name)}</button>`).join('') || '<p class="empty-journal">No matching regions.</p>';
  }
  function renderSidebar(country,region) {
    const config=configs[activeCountry];
    $('#place-title').textContent=region?region.properties.name:country?country.properties.name:'World';
    $('.atlas-sidebar').hidden=!country&&!visits.length;
    $('.atlas-layout').classList.toggle('has-selection',!!country||!!visits.length);
    $('#region-panel').hidden=!config;
    const notes=visits.filter(v=>(!activeCountry||v.country===activeCountry)&&(!activeRegion||v.region===activeRegion)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    $('.travel-journal').hidden=!notes.length;
    $('#visit-list').innerHTML=notes.length?notes.map(v=>`<article class="visit-entry"><h4>${esc(v.title)}</h4>${v.date?`<time datetime="${esc(v.date)}">${esc(v.date)}</time>`:''}${v.note?`<p>${esc(v.note)}</p>`:''}${(v.photos||[]).map(p=>`<a href="${esc(p.src)}" target="_blank" rel="noopener noreferrer"><img src="${esc(p.src)}" alt="${esc(p.alt||v.title)}" loading="lazy"></a>`).join('')}</article>`).join(''):'';
  }
  function zoom(factor) {stopMotion();projection.scale(Math.max(baseScale*.8,Math.min(baseScale*6,projection.scale()*factor)));draw();}
  async function get(file){const response=await fetch(`/data/travel/${file}.json`,{cache:'no-cache'});if(!response.ok)throw new Error(file);return response.json();}
  async function init(){
    $('#year').textContent=new Date().getFullYear();
    try{
      if(!window.d3)throw new Error('The globe renderer is unavailable.');
      const [countries,cn,jp,us,notes]=await Promise.all(['world','china','japan','us','visits'].map(get));
      world=countries;regions={'156':cn,'392':jp,'840':us};visits=notes.visits||[];
      renderCountryPicker();setRotation(spinning);
      projection=d3.geoOrthographic().translate([340,300]).scale(baseScale).rotate([-105,-20]).clipAngle(90).precision(.3);
      path=d3.geoPath(projection);svg=d3.select('#globe');
      svg.append('path').datum({type:'Sphere'}).attr('class','geo-path globe-ocean');
      svg.append('path').datum(d3.geoGraticule10()).attr('class','geo-path graticule');
      countriesLayer=svg.append('g');regionsLayer=svg.append('g');markerLayer=svg.append('g');
      countriesLayer.selectAll('path').data(world.features).join('path').attr('class',f=>`geo-path country-shape${visitedCountry(f.id)?' has-visits':''}`).attr('data-country',f=>f.id).on('click',(event,f)=>{if(!event.defaultPrevented)navigate(f.id);}).on('pointerenter',(_,f)=>tooltip(f.properties.name)).on('pointerleave',()=>tooltip());
      svg.append('path').datum({type:'Sphere'}).attr('class','geo-path globe-rim');
      svg.call(d3.drag().on('start',stopMotion).on('drag',event=>{const rot=projection.rotate(),ratio=680/$('#globe').getBoundingClientRect().width,k=ratio*50/projection.scale();projection.rotate([rot[0]+event.dx*k,Math.max(-85,Math.min(85,rot[1]-event.dy*k)),0]);draw();}));
      svg.on('wheel',event=>{event.preventDefault();zoom(Math.exp(-event.deltaY*.001));},{passive:false});
      $('#globe').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key))return;event.preventDefault();stopMotion();if(['+','=','-'].includes(event.key)){zoom(event.key==='-'?.85:1.15);return;}const r=projection.rotate();r[0]+=event.key==='ArrowLeft'?-8:event.key==='ArrowRight'?8:0;r[1]=Math.max(-85,Math.min(85,r[1]+(event.key==='ArrowUp'?8:event.key==='ArrowDown'?-8:0)));projection.rotate(r);draw();});
      document.querySelectorAll('.country-shortcuts button').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.country)));
      $('#country-search').addEventListener('input',renderCountryPicker);
      $('#country-options').addEventListener('click',event=>{const button=event.target.closest('[data-place]');if(button)navigate(button.dataset.place);});
      document.addEventListener('click',event=>{if(!$('#country-picker').contains(event.target))$('#country-picker').open=false;});
      $('#country-picker').addEventListener('keydown',event=>{if(event.key==='Escape'){$('#country-picker').open=false;$('#country-picker summary').focus();}});
      $('#toggle-rotation').addEventListener('click',()=>{cancelAnimationFrame(frame);focusing=false;setRotation(!spinning);});
      $('#region-search').addEventListener('input',renderRegions);
      $('#region-list').addEventListener('click',e=>{const button=e.target.closest('[data-region]');if(button)navigate(activeCountry,button.dataset.region);});
      $('#zoom-in').addEventListener('click',()=>zoom(1.2));$('#zoom-out').addEventListener('click',()=>zoom(1/1.2));$('#reset-globe').addEventListener('click',()=>navigate());
      window.addEventListener('hashchange',applyRoute);window.addEventListener('popstate',applyRoute);$('#map-loading').hidden=true;applyRoute();spinFrame=requestAnimationFrame(animate);
    }catch(error){console.error(error);$('#map-loading').textContent='The atlas could not load. Please refresh to try again.';}
  }
  document.addEventListener('DOMContentLoaded',init);
})();
