(() => {
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function inline(text) {
    return esc(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
  }
  const link = item => `<a href="${esc(item.url)}">${esc(item.name || item.label)}</a>`;
  function route() {
    const hash = location.hash.slice(1).split('/')[0];
    if (hash === 'info') { location.replace('assets/CV_Qingle_Liu.pdf'); return; }
    if (hash === 'blog' || hash === 'doc') { location.replace('/blog/' + location.hash); return; }
    const research = hash === 'research' || hash === 'scholar';
    $('#view-main').hidden = research;
    $('#view-research').hidden = !research;
    document.querySelectorAll('[data-nav]').forEach(a => {
      if (a.dataset.nav === (research ? 'research' : 'main')) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
    document.title = research ? 'Research | Qingle Liu' : 'Qingle Liu | Aoraku';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function institutionLogo(item) {
    return `<span class="institution-logo" data-logo="${esc(item.logoType)}"><img src="${esc(item.logo)}" alt="${esc(item.name)} logo" loading="lazy"></span>`;
  }
  function records(items) {
    return items.map(item=>`<article class="record-row"><p>${esc(item.title)}</p><span>${esc(item.date)}</span></article>`).join('');
  }
  function experience(item) {
    return `<article class="experience-row">${institutionLogo(item)}<div><div class="experience-topline"><h3>${link(item)}</h3><span class="experience-date">${esc(item.date)}</span></div><p>${esc(item.topics)}</p>${item.advisors ? `<p>Advisor${item.advisors.length > 1 ? 's' : ''}: ${item.advisors.map(link).join(', ')}</p>` : ''}</div></article>`;
  }
  function author(name) {
    const match = name.match(/^(.*?)([*†‡]+)?$/);
    return `${match[1] === 'Qingle Liu' ? `<span class="self-author">${esc(match[1])}</span>` : esc(match[1])}${match[2] ? `<sup>${esc(match[2])}</sup>` : ''}`;
  }
  function authors(paper, compact) {
    const names = paper.authors.split(', ');
    // Keep the owner visible even when the full list is collapsed.
    const visible = new Set(names.slice(0, compact ? 4 : 6));
    names.filter(n => n.startsWith('Qingle Liu')).forEach(n => visible.add(n));
    if (visible.size >= names.length) return names.map(author).join(', ');
    const first = names.filter(n => visible.has(n)).map(author).join(', ');
    const full = names.map(author).join(', ');
    return `<span class="authors-short">${first}, <button class="author-toggle" type="button" aria-expanded="false">and ${names.length-visible.size} more authors</button></span><span class="authors-full" hidden>${full} <button class="author-toggle" type="button" aria-expanded="true">Show less</button></span>`;
  }
  function publication(p, compact) {
    const badge = p.venue.replace(' 2026','');
    const links = [...p.links];
    if (!links.some(x=>x.label==='PDF')) links.splice(1,0,{label:'PDF',url:p.url.replace('/abs/','/pdf/')});
    const tag = compact ? 'h3' : 'h2';
    return `<article class="publication" data-paper="${esc(p.id)}"><div class="publication-visual"><span class="venue-badge">${esc(badge)}</span><a class="paper-thumb" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${esc(p.title)}"><img src="${esc(p.image)}" alt="Overview of ${esc(p.title)}" loading="lazy" width="174" height="112"></a></div><div class="publication-body"><${tag}><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></${tag}><p class="paper-authors">${authors(p,compact)}</p><p class="paper-venue">${esc(p.venue === 'arXiv' ? 'arXiv, '+p.year : p.venue)}</p>${compact ? '' : `<p class="paper-abstract">${esc(p.abstract)}</p>`}<div class="paper-links">${links.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('')}</div></div></article>`;
  }
  async function init() {
    $('#year').textContent = new Date().getFullYear();
    route();window.addEventListener('hashchange',route);
    try {
      const [profile, papers, news] = await Promise.all(['profile','papers','news'].map(async file=>{
        const response=await fetch(`data/${file}.json`,{cache:'no-cache'});
        if(!response.ok)throw new Error(file);
        return response.json();
      }));
      $('#profile-bio').innerHTML=profile.bioParagraphs.map(p=>`<p>${inline(p)}</p>`).join('');
      $('#social-links').innerHTML=profile.socials.filter(x=>x.url).map(link).join('');
      const edu=profile.education;
      $('#education').innerHTML=`<article class="experience-row">${institutionLogo(edu)}<div><div class="experience-topline"><h3>${link(edu)}</h3><span class="experience-date">${esc(edu.date)}</span></div><p>${esc(edu.degree)}</p><details class="coursework"><summary>Core coursework & grades</summary><dl>${edu.courses.map(c=>`<dt>${esc(c.category)}</dt><dd><ul>${c.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></dd>`).join('')}</dl></details></div></article>`;
      $('#research-experience').innerHTML=profile.researchExperience.map(experience).join('');
      $('#industry-experience').innerHTML=profile.industryExperience.map(experience).join('');
      $('#selected-papers').innerHTML=papers.papers.filter(p=>p.selected).map(p=>publication(p,true)).join('');
      $('#paper-list').innerHTML=papers.papers.map(p=>publication(p,false)).join('');
      $('#honors-list').innerHTML=records(profile.honors);
      $('#services-list').innerHTML=records(profile.services);
      $('#news-list').innerHTML=news.map(n=>`<article class="news-item"><time datetime="${esc(n.date)}">${new Intl.DateTimeFormat('en',{month:'short',year:'numeric'}).format(new Date(n.date+'-01T00:00:00'))}</time><p>${inline(n.title)}.</p></article>`).join('');
      document.addEventListener('click',event=>{
        const button=event.target.closest('.author-toggle');if(!button)return;
        const container=button.closest('.paper-authors');const more=button.getAttribute('aria-expanded')==='false';
        container.querySelector('.authors-short').hidden=more;
        container.querySelector('.authors-full').hidden=!more;
        container.querySelector(more?'.authors-full button':'.authors-short button').focus({preventScroll:true});
      });
    } catch(error) {console.error(error);$('#load-error').hidden=false;}
  }
  document.addEventListener('DOMContentLoaded',init);
})();
