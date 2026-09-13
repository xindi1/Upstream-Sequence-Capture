const KEY = 'upstream-sequence-capture-v1';
const TAGS = ['bid / response', 'recognition', 'outside stressor', 'body state', 'intervention', 'later outcome'];
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
const localParts = (d = new Date()) => ({date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}`});
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
function load() { try { const raw=localStorage.getItem(KEY); if(raw) { const value=JSON.parse(raw); if(Array.isArray(value.entries)) return value; } } catch(e) {} return {entries:[]}; }
let state = load();
const save = () => localStorage.setItem(KEY,JSON.stringify(state));
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dayEntries = date => state.entries.filter(e=>e.date===date).sort((a,b)=>a.time.localeCompare(b.time)||a.createdAt.localeCompare(b.createdAt));
const tagLabel = tags => tags.map(t=>`<span class="pill">${esc(t)}</span>`).join('');
function setView(view) { document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===view)); document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden')); $(`${view}View`).classList.remove('hidden'); if(view==='review') renderReview(); if(view==='capture') renderTimeline(); }
function renderTimeline() {
  const entries=dayEntries($('timelineDate').value);
  $('timeline').innerHTML = entries.length ? entries.map(e=>`<article class="moment"><div class="moment-top"><span class="moment-time">${esc(e.time)}${e.timeQuality==='exact'?'':` <small>(${esc(e.timeQuality)})</small>`}</span><small>${e.history.length ? 'Corrected' : 'Captured'}</small></div><p>${esc(e.note)}</p><div class="moment-tags">${tagLabel(e.tags)}</div><div class="moment-actions"><button type="button" data-edit="${e.id}">Edit</button>${e.history.length?`<button type="button" data-history="${e.id}" aria-expanded="false">View history</button>`:''}</div><div class="history hidden" id="history-${e.id}">${e.history.map((h,i)=>`<div><strong>Earlier version ${i+1}</strong> · ${esc(new Date(h.savedAt).toLocaleString())}<p>${esc(h.date)} ${esc(h.time)}${h.timeQuality==='exact'?'':` (${esc(h.timeQuality)})`} — ${esc(h.note)}</p><small>${esc(h.tags.join(', '))}</small></div>`).join('<hr>')}</div></article>`).join('') : '<div class="empty">No moments on this day. Add one when you want to.</div>';
}
function renderReview() {
  const entries=dayEntries($('reviewDate').value);
  $('reviewList').innerHTML=entries.length ? entries.map(e=>`<article class="card review-card" data-id="${e.id}"><div class="review-source"><time>${esc(e.time)}${e.timeQuality==='exact'?'':` · ${esc(e.timeQuality)}`}</time><p>${esc(e.note)}</p><div class="moment-tags">${tagLabel(e.tags)}</div></div><div class="review-fields"><label>Observed<textarea data-field="observed" placeholder="What could be seen or heard?">${esc(e.review?.observed)}</textarea></label><label>Experienced<textarea data-field="experienced" placeholder="What did you notice in yourself?">${esc(e.review?.experienced)}</textarea></label><label>Interpreted<textarea data-field="interpreted" placeholder="What meaning did you consider?">${esc(e.review?.interpreted)}</textarea></label><label>Chosen action<textarea data-field="chosenAction" placeholder="What did you choose, if anything?">${esc(e.review?.chosenAction)}</textarea></label><div class="review-controls"><label>Sequence relationship <select data-field="relationship"><option value="unsure" ${e.relationship==='unsure'?'selected':''}>Unsure</option><option value="same sequence" ${e.relationship==='same sequence'?'selected':''}>Same sequence</option><option value="separate sequence" ${e.relationship==='separate sequence'?'selected':''}>Separate sequence</option></select></label><label><input type="checkbox" data-field="includeInSummary" ${e.includeInSummary?'checked':''}> Include in summary</label></div></div></article>`).join('') : '<div class="empty">No moments on this day to review.</div>';
}
function resetForm() { $('entryForm').reset(); $('editingId').value=''; $('saveEntry').textContent='Save moment'; $('cancelEdit').classList.add('hidden'); const now=localParts(); $('entryDate').value=now.date; $('entryTime').value=now.time; }
function download(name,content,type) { const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
function reviewedText(entries) { const lines=['Capability Lab — selected reviewed summary',`Day: ${$('reviewDate').value}`,'Prepared from selected moments only. Review before importing.','']; entries.forEach(e=>{lines.push(`${e.time}${e.timeQuality==='exact'?'':` (${e.timeQuality})`} | Sequence relationship: ${e.relationship}`); for(const [label,key] of [['Observed','observed'],['Experienced','experienced'],['Interpreted','interpreted'],['Chosen Action','chosenAction']]) if(e.review?.[key]?.trim()) lines.push(`${label}: ${e.review[key].trim()}`); lines.push('');}); return lines.join('\n'); }
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('tagChoices').innerHTML=TAGS.map((t,i)=>`<label class="tag-choice"><input type="checkbox" value="${esc(t)}" id="tag${i}"><span>${esc(t)}</span></label>`).join('');
const now=localParts(); $('timelineDate').value=now.date; $('reviewDate').value=now.date; resetForm(); renderTimeline();
$('todayBtn').addEventListener('click',()=>{const d=localParts().date;$('timelineDate').value=d;$('reviewDate').value=d;setView('capture');});
$('timelineDate').addEventListener('change',renderTimeline); $('reviewDate').addEventListener('change',renderReview);
$('cancelEdit').addEventListener('click',resetForm);
$('entryForm').addEventListener('submit',ev=>{ev.preventDefault(); const note=$('entryNote').value.trim();if(!note)return;const date=$('entryDate').value,time=$('entryTime').value,timeQuality=$('timeQuality').value,tags=[...document.querySelectorAll('#tagChoices input:checked')].map(x=>x.value);const id=$('editingId').value;let e;if(id){e=state.entries.find(x=>x.id===id);if(!e)return;e.history.push({date:e.date,time:e.time,timeQuality:e.timeQuality,note:e.note,tags:[...e.tags],savedAt:e.updatedAt});Object.assign(e,{date,time,timeQuality,note,tags,updatedAt:new Date().toISOString()});}else{e={id:uid(),sequenceId:uid(),date,time,timeQuality,note,tags,relationship:'unsure',review:{observed:'',experienced:'',interpreted:'',chosenAction:''},includeInSummary:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),history:[]};state.entries.push(e);}save();$('timelineDate').value=date;$('reviewDate').value=date;renderTimeline();resetForm();$('pausePrompt').classList.toggle('hidden',!tags.includes('recognition'));});
$('dismissPrompt').addEventListener('click',()=>$('pausePrompt').classList.add('hidden'));
$('timeline').addEventListener('click',ev=>{const edit=ev.target.closest('[data-edit]');if(edit){const e=state.entries.find(x=>x.id===edit.dataset.edit);if(!e)return;$('editingId').value=e.id;$('entryDate').value=e.date;$('entryTime').value=e.time;$('timeQuality').value=e.timeQuality;$('entryNote').value=e.note;document.querySelectorAll('#tagChoices input').forEach(x=>x.checked=e.tags.includes(x.value));$('saveEntry').textContent='Save correction';$('cancelEdit').classList.remove('hidden');$('entryNote').focus();scrollTo({top:0,behavior:'smooth'});}const history=ev.target.closest('[data-history]');if(history){const panel=$(`history-${history.dataset.history}`);const open=panel.classList.toggle('hidden')===false;history.setAttribute('aria-expanded',String(open));history.textContent=open?'Hide history':'View history';}});
$('reviewList').addEventListener('change',ev=>{const card=ev.target.closest('[data-id]');const field=ev.target.dataset.field;if(!card||!field)return;const e=state.entries.find(x=>x.id===card.dataset.id);if(!e)return;if(field==='relationship')e.relationship=ev.target.value;else if(field==='includeInSummary')e.includeInSummary=ev.target.checked;else e.review[field]=ev.target.value;save();});
$('reviewList').addEventListener('input',ev=>{const card=ev.target.closest('[data-id]');const field=ev.target.dataset.field;if(!card||!['observed','experienced','interpreted','chosenAction'].includes(field))return;const e=state.entries.find(x=>x.id===card.dataset.id);if(e){e.review[field]=ev.target.value;save();}});
$('downloadSummary').addEventListener('click',()=>{const entries=dayEntries($('reviewDate').value).filter(e=>e.includeInSummary);if(!entries.length){$('summaryStatus').textContent='Select at least one moment above.';return;}download(`upstream-reviewed-${$('reviewDate').value}.txt`,reviewedText(entries),'text/plain');$('summaryStatus').textContent='Selected summary downloaded. Review it before adding it to Capability Lab.';});
$('exportAll').addEventListener('click',()=>{download(`upstream-data-${localParts().date}.json`,JSON.stringify({app:'Upstream Sequence Capture Tool',exportedAt:new Date().toISOString(),...state},null,2),'application/json');$('dataStatus').textContent='Full export downloaded.';});
let pendingImport = null;
function validBackup(data) {
  if (!data || data.app !== 'Upstream Sequence Capture Tool' || !Array.isArray(data.entries) || data.entries.length > 10000) throw Error('This is not a supported Upstream export.');
  const ids = new Set();
  for (const e of data.entries) {
    if (!e || typeof e.id !== 'string' || !e.id || ids.has(e.id) || typeof e.sequenceId !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !/^\d{2}:\d{2}$/.test(e.time) || typeof e.note !== 'string' || !e.note.trim() || e.note.length > 50000 || !['exact','approximate','uncertain'].includes(e.timeQuality) || !Array.isArray(e.tags) || e.tags.some(t=>!TAGS.includes(t)) || !['unsure','same sequence','separate sequence'].includes(e.relationship) || !e.review || !Array.isArray(e.history)) throw Error('The backup contains an invalid moment.');
    if (e.history.length > 1000 || e.history.some(h=>!h || typeof h.note !== 'string' || typeof h.date !== 'string' || typeof h.time !== 'string' || !Array.isArray(h.tags))) throw Error('The backup contains an invalid correction history.');
    for (const key of ['observed','experienced','interpreted','chosenAction']) if(typeof e.review[key] !== 'string') throw Error('The backup contains an invalid review.');
    if (typeof e.includeInSummary !== 'boolean' || typeof e.createdAt !== 'string' || typeof e.updatedAt !== 'string') throw Error('The backup contains an invalid moment.');
    ids.add(e.id);
  }
  return {entries:data.entries};
}
$('importFile').addEventListener('change',async ev=>{
  const file=ev.target.files?.[0]; if(!file)return; pendingImport=null;
  try {
    if(file.size > 5_000_000) throw Error('This file is too large to import.');
    pendingImport=validBackup(JSON.parse(await file.text()));
    $('importPreview').textContent=`${file.name} contains ${pendingImport.entries.length} moment${pendingImport.entries.length===1?'':'s'}. This browser currently has ${state.entries.length}.`;
    $('importDialog').showModal();
  } catch(err) { $('dataStatus').textContent=err instanceof SyntaxError?'This file is not valid JSON.':err.message; }
  ev.target.value='';
});
$('importDialog').addEventListener('close',()=>{
  if($('importDialog').returnValue!=='confirm' || !pendingImport){pendingImport=null;return;}
  try { localStorage.setItem(KEY,JSON.stringify(pendingImport)); state=pendingImport; pendingImport=null; const date=localParts().date; $('timelineDate').value=date;$('reviewDate').value=date;renderTimeline();renderReview();resetForm();$('dataStatus').textContent='Backup restored. Choose a date to view its moments.'; }
  catch(err) { $('dataStatus').textContent='The backup could not be saved in this browser. Your current data was kept.'; pendingImport=null; }
});
$('deleteAll').addEventListener('click',()=>$('deleteDialog').showModal());
$('deleteDialog').addEventListener('close',()=>{if($('deleteDialog').returnValue!=='confirm')return;state={entries:[]};save();renderTimeline();renderReview();resetForm();$('dataStatus').textContent='All local data deleted.';});
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
