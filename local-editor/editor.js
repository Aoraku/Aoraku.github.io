let data, currentId, dirty=false, saving=false;
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const structural=new Set(['首节标题被替换','副标题被替换','章节格式待确认']);
function status(message,error=false){$('#status').textContent=message;$('#status').classList.toggle('error',error);}
function values(){return {title:$('#title').value,date:$('#date').value,categories:[...document.querySelectorAll('#categories input:checked')].map(i=>i.value),selected:$('#selected').checked,tags:$('#tags').value.split(/[,，]/).map(x=>x.trim()).filter(Boolean),summary:$('#summary').value};}
function list(){
 const search=$('#search').value.toLowerCase(),category=$('#filter').value,issues=$('#issues-only').checked;
 const entries=Object.entries(data.articles).filter(([id,a])=>(!search||`${id} ${a.title} ${a.tags.join(' ')}`.toLowerCase().includes(search))&&(!category||(category==='selected'?a.selected:a.categories.includes(category)))&&(!issues||structural.has(data.audit.find(r=>r.id===id)?.status))).sort((a,b)=>b[1].date.localeCompare(a[1].date)||Number(b[0])-Number(a[0]));
 $('#count').textContent=`${entries.length} 篇文章`;
 $('#articles').innerHTML=entries.map(([id,a])=>`<button type="button" data-id="${id}" class="${id===currentId?'active':''}"><span>${id} · ${escape(a.date)}</span>${escape(a.title)}</button>`).join('');
}
function preview(){const v=values();$('#preview-meta').textContent=`${v.categories.map(c=>data.categories.find(x=>x.id===c)?.label).join(' / ')} · ${v.date}${v.selected?' · 精选':''}`;$('#preview-title').textContent=v.title;$('#preview-summary').textContent=v.summary;$('#preview-tags').textContent=v.tags.join(' · ');}
function choose(id,force=false){
 if(saving)return;
 if(!force&&dirty&&!confirm('有未保存的修改，确定放弃吗？'))return;
 currentId=id;dirty=false;const a=data.articles[id];
 $('#article-id').textContent=`文章 ${id} · /blog/${id}`;$('#preview-link').href=`http://127.0.0.1:8765/blog/${id}`;
 for(const key of ['title','date','summary'])$('#'+key).value=a[key];$('#selected').checked=a.selected;$('#tags').value=a.tags.join(', ');
 $('#categories').innerHTML=data.categories.filter(c=>c.id!=='selected').map(c=>`<label class="check"><input type="checkbox" value="${c.id}" ${a.categories.includes(c.id)?'checked':''}>${escape(c.label)}</label>`).join('');
 const issue=data.audit.find(r=>r.id===id);$('#audit-status').textContent=issue?.status||'';$('#audit-note').textContent=issue?.note||'';$('#audit-heading').textContent=issue?.firstHeading?`源文件第一个 Markdown 标题：${issue.firstHeading}`:'';$('#source').textContent=a.document;
 $('#audit').open=structural.has(issue?.status);status('所有修改已保存');list();preview();history.replaceState({},'',`/editor/?article=${id}`);
}
$('#metadata').addEventListener('input',()=>{dirty=true;status('有未保存的修改');preview();});
$('#metadata').addEventListener('submit',async event=>{
 event.preventDefault();if(saving||!currentId)return;
 const article=values();if(!article.categories.length){status('请选择至少一个实际分类。',true);return;}
 saving=true;$('#save').disabled=true;const controls=[...$('#metadata').querySelectorAll('input,textarea,button')];controls.forEach(c=>c.disabled=true);status('正在保存…');
 try{const response=await fetch(`/api/blog/${currentId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:data.revision,article})});const result=await response.json();if(!response.ok)throw Error(result.error);data=result;dirty=false;saving=false;choose(currentId,true);status('已保存到本机仓库，刷新文章即可预览。');}catch(error){status(error.message,true);}finally{saving=false;controls.forEach(c=>c.disabled=false);$('#save').disabled=false;}
});
$('#reset').onclick=()=>choose(currentId);
$('#articles').onclick=event=>{const target=event.target.closest('[data-id]');if(target)choose(target.dataset.id);};
for(const id of ['search','filter','issues-only'])$('#'+id).addEventListener('input',()=>data&&list());
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();$('#metadata').requestSubmit();}});
(async()=>{try{const response=await fetch('/api/blog');if(!response.ok)throw Error('无法加载编辑台');data=await response.json();$('#filter').insertAdjacentHTML('beforeend',data.categories.map(c=>`<option value="${c.id}">${escape(c.label)}</option>`).join(''));const requested=new URLSearchParams(location.search).get('article');choose(data.articles[requested]?requested:Object.keys(data.articles).sort((a,b)=>Number(b)-Number(a))[0]);}catch(error){status(error.message,true);}})();
