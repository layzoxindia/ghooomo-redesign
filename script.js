(() => {
 'use strict';
 const root=document.documentElement,world=document.body.dataset.world;
 root.classList.add('js');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches;
 const motion=document.querySelector('.motion-button');
 function updateMotion(){root.classList.toggle('paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Resume visual motion':'Pause visual motion');motion.querySelector('span').textContent=paused?'▶':'Ⅱ';}
 updateMotion();motion.addEventListener('click',()=>{paused=!paused;updateMotion()});
 reduced.addEventListener('change',e=>{paused=e.matches;updateMotion()});
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.06});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
 document.querySelector(`[data-nav="${world}"]`)?.setAttribute('aria-current','page');
 const menu=document.querySelector('.menu-button'),nav=document.querySelector('.header nav');
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');menu.textContent=open?'×':'☰'});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.textContent='☰'}});
 const legacy=location.hash.match(/^#\/(solo|couple|group)\/?$/);if(world==='home'&&legacy)location.replace('/'+legacy[1]+'/');
 if(world==='home'){
  const scenes={solo:{photo:'forest',alt:'Sunlight falling across a vast green mountain valley',label:'Enter the solo experience',note:'YOUR OWN KIND OF FREEDOM',accent:'#d9ee85'},couple:{photo:'beach',alt:'A quiet white sand beach beside turquoise water',label:'Enter the couple experience',note:'SOMEWHERE, JUST THE TWO OF YOU',accent:'#ffdbb4'},group:{photo:'coast',alt:'Palm trees along a sunlit tropical coastline',label:'Enter the group experience',note:'GOOD PLACES. BETTER PEOPLE.',accent:'#e4ff55'}};
  const tabs=[...document.querySelectorAll('[data-scene]')],img=document.querySelector('.home-backdrop img'),link=document.getElementById('enter-world');
  let sceneVersion=0;
  function setScene(key){const s=scenes[key],version=++sceneVersion;document.querySelector(".home-stage").dataset.activeWorld=key;tabs.forEach(t=>{const active=t.dataset.scene===key;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});link.href='/'+key+'/';link.lastElementChild.replaceChildren(document.createTextNode(s.label));const small=document.createElement('small');small.textContent=s.note;link.lastElementChild.append(small);root.style.setProperty('--accent',s.accent);const next=new Image();next.onload=()=>{if(version!==sceneVersion)return;img.src=next.src;img.alt=s.alt;img.animate([{opacity:.35},{opacity:1}],{duration:paused?0:650,easing:'ease-out'})};next.src='/assets/scenes/'+s.photo+'.webp';}
  tabs.forEach((t,i)=>{t.tabIndex=i===0?0:-1;t.addEventListener('click',()=>setScene(t.dataset.scene));t.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;tabs[n].focus();setScene(tabs[n].dataset.scene)})});
 }

 // Native-scroll cinematic progression: only visible scenes are updated.
 const sequence=document.querySelector('.world-sequence');
 if(sequence){
  const frames=[...sequence.querySelectorAll('.sequence-landscape,.road-sequence article')];
  const pano=sequence.querySelector('.shared-panorama');
  let ticking=false;
  function paintJourney(){
   ticking=false;
   if(paused)return;
   const rect=sequence.getBoundingClientRect();
   const viewport=innerHeight||1;
   const progress=Math.max(0,Math.min(1,(viewport-rect.top)/(viewport+rect.height)));
   sequence.style.setProperty('--journey-progress',progress.toFixed(3));
   if(pano){
    const split=45+progress*16;
    pano.style.setProperty('--panorama-split',split.toFixed(2)+'%');
   }
   frames.forEach((frame,i)=>{
    const bounds=frame.getBoundingClientRect();
    const local=Math.max(0,Math.min(1,(viewport-bounds.top)/(viewport+bounds.height)));
    frame.style.setProperty('--chapter-progress',local.toFixed(3));
   });
  }
  function queueJourney(){if(!ticking){ticking=true;requestAnimationFrame(paintJourney)}}
  addEventListener('scroll',queueJourney,{passive:true});
  addEventListener('resize',queueJourney,{passive:true});
  motion.addEventListener('click',queueJourney);
  queueJourney();
 }
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});document.querySelectorAll('.journey').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter)}));
 const dialog=document.getElementById('planner'),form=document.getElementById('brief-form'),result=document.getElementById('brief-result');
 let brief='',lastTrigger;
 document.querySelectorAll('[data-plan]').forEach(button=>button.addEventListener('click',()=>{lastTrigger=button;form.hidden=false;result.hidden=true;form.elements.style.value=world==='home'?'solo':world;form.elements.travellers.value=world==='couple'?2:world==='group'?4:1;if(button.dataset.destination)form.elements.destination.value=button.dataset.destination;dialog.showModal();}));
 function close(){dialog.close();lastTrigger?.focus()}
 document.querySelector('.close-dialog').addEventListener('click',close);
 dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close()}});
 const now=new Date();form.elements.month.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);brief=`GHO O O MO — MY TRAVEL BRIEF\n\nTravel style: ${d.get('style')}\nDestination: ${d.get('destination')}\nPreferred month: ${d.get('month')}\nTravellers: ${d.get('travellers')}\n\nTravel notes:\n${d.get('notes')||'Open to ideas.'}\n\nThis is a planning brief, not a confirmed booking. No enquiry has been sent. Confirm itinerary, availability and price with your travel organiser.`;document.getElementById('brief-text').textContent=brief;form.hidden=true;result.hidden=false;document.getElementById('download-brief').focus()});
 document.getElementById('download-brief').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Ghooomo-Travel-Brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
 document.getElementById('edit-brief').addEventListener('click',()=>{result.hidden=true;form.hidden=false;form.elements.destination.focus()});
 document.querySelectorAll('a[href^="/"]').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0||paused||a.pathname===location.pathname)return;e.preventDefault();root.classList.add('leaving');setTimeout(()=>location.assign(a.href),300)}));
 window.addEventListener('pageshow',()=>root.classList.remove('leaving'));
})();
