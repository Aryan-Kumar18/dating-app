// ====== 1. FILL THESE IN ======
const SB_URL='https://rmywttlijzpmfwsamjlu.supabase.co', SB_KEY='sb_publishable_Z6-8OfMYsbKTRPkMHejQaQ_uL1SqWZu';
// ==============================
const W3F_KEY='5d8f7fd1-d4bc-47fa-9974-af3d5f22c064'; // contact form key (sends messages to your gmail)
const sb=supabase.createClient(SB_URL,SB_KEY);
const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const INTS=['Coding','Data Science','Machine Learning','Maths','Statistics','Gaming','Anime','Movies','Music','Cricket','Football','Gym','Reading','Travel','Cooking','Photography','Startups','Finance','Chess','Art','Memes','Night owl study','Morning study'];
const LV=['Foundation','Diploma','BSc Degree','BS Degree'], LOOK=['Dating','Study partner','Both'];
let prevTab='discover',pi=0;
let me,isAdmin=false,isSuper=false,tab='discover',deck=[],last=null,n=0,showAd=false,chat=null,F={looking:'All',level:'All'};
const prem=p=>p&&p.plan==='premium'&&p.paid_until&&new Date(p.paid_until)>new Date();
const plist=p=>[p.photo,...(p.photos||[])].filter(Boolean);
const imgOf=(p,i=0)=>{const l=plist(p);return l.length?`<img src="${esc(l[Math.min(i,l.length-1)])}" alt="">`:`<div class="ph">🙂</div>`};
const dots=(p,i)=>{const n=plist(p).length;return n>1?`<div class="dots">${Array.from({length:n},(_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div>`:''};
const pathOf=u=>decodeURIComponent(u.split('/photos/')[1].split('?')[0]);
const isHeic=f=>/hei[cf]/i.test(f.type||'')||/\.hei[cf]$/i.test(f.name||'');
async function toJpeg(f){if(!isHeic(f))return f;
 try{if(!window.heic2any)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  const r=await heic2any({blob:f,toType:'image/jpeg',quality:.85});return Array.isArray(r)?r[0]:r}catch(e){return null}}
async function shrink(f,max=1000){f=await toJpeg(f);if(!f)return null;return new Promise(res=>{const img=new Image(),u=URL.createObjectURL(f);img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>res(b),'image/jpeg',.82)};img.onerror=()=>res(null);img.src=u})}
const av=p=>p.photo?`<img class="av" src="${esc(p.photo)}">`:`<div class="av">🙂</div>`;
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>t.style.display='none',3500)}
const day=d=>new Date(Math.max(Date.now(),d?new Date(d):0)+30*864e5).toISOString();

// ---- AI match score (runs free in the browser: interest overlap + study level + cohort + goal) ----
function score(a,b){const A=new Set(a.interests||[]),B=b.interests||[],sh=B.filter(x=>A.has(x)),u=new Set([...A,...B]).size||1;
 let s=sh.length/u*70+10;if(a.looking===b.looking||a.looking==='Both'||b.looking==='Both')s+=10;if(a.level===b.level)s+=5;if(a.cohort===b.cohort)s+=5;return{pct:Math.min(99,Math.round(s)),sh}}

// ---- AUTH ----
function authView(){const bad=new URLSearchParams(location.hash.slice(1)).get('error_description');if(bad)history.replaceState(null,'',location.pathname);
 app.innerHTML=`<div class="wrap hero"><div class="logo">💞</div><h1>BS Degree<br>Dating App</h1><p class="mut" style="margin:10px 0">For IIT Madras BS students only. Find your person or your study partner.</p>
<div class="card">${bad?`<p style="color:#e03150;margin-bottom:8px">Sign-in was blocked. Only IITM BS student emails (ds, mg, es, ae .study.iitm.ac.in) can join.</p><p class="tiny">Details: ${esc(bad)}</p>`:''}
<button class="btn" id="gg">Continue with Google</button>
<p class="tiny">Use your IITM student email (@ds, @mg, @es or @ae .study.iitm.ac.in). Messages are encrypted in transit and at rest. Admins may review reported conversations for safety.</p>
<p class="tiny"><a href="#" id="alt" style="color:var(--b)">Use an email code instead</a></p>
<div id="a1" hidden><input id="em" type="email" placeholder="you@ds.study.iitm.ac.in"><button class="btn" id="go">Send login code</button></div>
<div id="a2" hidden><input id="cd" inputmode="numeric" placeholder="Code from your email"><button class="btn" id="vf">Verify &amp; enter</button></div></div>
<button class="btn g" id="ctc">Contact us</button></div>`;
 $('#gg').onclick=()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}});
 $('#alt').onclick=e=>{e.preventDefault();$('#a1').hidden=false};
 let em;$('#ctc').onclick=()=>contact();$('#go').onclick=async()=>{em=$('#em').value.trim().toLowerCase();const{error}=await sb.auth.signInWithOtp({email:em});
  if(error)return toast('Not allowed or error: only IITM BS emails can join');$('#a1').hidden=true;$('#a2').hidden=false;toast('Code sent. Check your email')};
 $('#vf').onclick=async()=>{const{data,error}=await sb.auth.verifyOtp({email:em,token:$('#cd').value.trim(),type:'email'});if(error)return toast(error.message);boot(data.user)}}

async function boot(user){
 const{data:ad}=await sb.from('admins').select('*').eq('email',user.email);isAdmin=!!(ad&&ad.length);isSuper=!!(ad&&ad[0]&&ad[0].is_super);
 const{data:bl}=await sb.from('blocked_users').select('email').eq('email',user.email);if(bl&&bl.length)return blocked('This account cannot use the app. Use Contact us if you think this is a mistake.');
 const{data:p}=await sb.from('profiles').select('*').eq('id',user.id).maybeSingle();
 if(!p)return form(user,{});me=p;
 if(p.status==='suspended'){app.innerHTML=`<div class="wrap hero"><div class="logo">🚫</div><h2>Account suspended</h2><p class="mut">Only an admin can lift this suspension.</p><button class="btn g" onclick="sb.auth.signOut()">Sign out</button></div>`;return}
 shell();live()}

function blocked(m){app.innerHTML=`<div class="wrap hero"><div class="logo">🚫</div><h2>Not eligible</h2><p class="mut" style="margin:10px 0">${esc(m)}</p><button class="btn g" id="ctc">Contact us</button><button class="btn g" id="lo">Sign out</button></div>`;$('#ctc').onclick=()=>contact();$('#lo').onclick=()=>sb.auth.signOut()}

// ---- PROFILE FORM ----
function form(user,p){let sel=new Set(p.interests||[]);const edit=!!p.id;
 app.innerHTML=`<div class="wrap"><h2>${edit?'Your profile':'Create your profile'}</h2><div class="card">
 <input id="nm" placeholder="Name" value="${esc(p.name)}"><input id="ag" type="number" min="18" max="60" placeholder="Age (18+)" value="${p.age||''}">
 <input id="co" placeholder="Cohort (e.g. Jan 2025)" value="${esc(p.cohort)}">
 <select id="lv">${LV.map(x=>`<option ${p.level===x?'selected':''}>${x}</option>`).join('')}</select>
 <select id="lk">${LOOK.map(x=>`<option ${p.looking===x?'selected':''}>${x}</option>`).join('')}</select>
 <textarea id="bio" rows="3" placeholder="Short bio">${esc(p.bio)}</textarea>
 <p class="mut">Interests (used by AI matching)</p><div class="chips" id="ch">${INTS.map(i=>`<span class="chip ${sel.has(i)?'on':''}">${i}</span>`).join('')}</div>
 <p class="mut">Profile picture</p><div class="mainph"><div id="mp"></div><button class="btn s g" type="button" id="mpb">Add / change picture</button><input id="mpf" type="file" accept="image/*,.heic,.heif" hidden></div>
 <p class="mut">More photos (up to 4)</p><div class="gal" id="gl"></div><input id="gf" type="file" accept="image/*,.heic,.heif" multiple hidden>
 ${edit?'':`<label class="tiny" style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" id="ok18" style="width:auto;margin-top:2px"> I am 18 or older and I agree to the <a href="legal.html" target="_blank" style="color:var(--b)">Terms &amp; Privacy</a></label>`}
 <button class="btn" id="sv">Save</button>${edit?`<button class="btn g" id="bk">Back</button>
 <button class="btn g" id="hd">${p.hidden?'Show my profile':'Hide my profile'}</button><button class="btn g" id="ctc">Contact us</button><button class="btn g" id="lo">Sign out</button><button class="btn d" id="dl">Delete my profile &amp; data</button>`:''}</div></div>`;
 let main={url:p.photo||null},gal=(p.photos||[]).map(u=>({url:u})),removed=[];
 const paint=()=>{$('#mp').innerHTML=main.url?`<img class="av big" src="${esc(main.url)}">`:`<div class="av big">🙂</div>`;
  $('#gl').innerHTML=gal.map((g,i)=>`<div class="gi"><img src="${esc(g.url)}"><b data-r="${i}">✕</b></div>`).join('')+(gal.length<4?'<div class="gi" id="ga">+</div>':'');
  document.querySelectorAll('#gl [data-r]').forEach(x=>x.onclick=()=>{const g=gal.splice(+x.dataset.r,1)[0];if(!g.file)removed.push(g.url);paint()});
  if($('#ga'))$('#ga').onclick=()=>$('#gf').click()};paint();
 $('#mpb').onclick=()=>$('#mpf').click();
 $('#mpf').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const b=await shrink(f);if(!b)return toast('Could not read that image');if(main.url&&!main.file)removed.push(main.url);main={url:URL.createObjectURL(b),file:b};paint()};
 $('#gf').onchange=async e=>{for(const f of [...e.target.files].slice(0,4-gal.length)){const b=await shrink(f);if(b)gal.push({url:URL.createObjectURL(b),file:b});else toast('Could not read one image')}e.target.value='';paint()};
 $('#ch').onclick=e=>{if(e.target.className.includes('chip')){const t=e.target.textContent;sel.has(t)?sel.delete(t):sel.add(t);e.target.classList.toggle('on')}};
 $('#sv').onclick=async()=>{const age=+$('#ag').value;if(!$('#nm').value||!age)return toast('Name and age required');
  if(age<18){await sb.rpc('block_underage');const ps=plist(p).filter(u=>u.includes('/photos/')).map(pathOf);if(ps.length)await sb.storage.from('photos').remove(ps);await sb.from('profiles').delete().eq('id',user.id);return blocked('Sorry, you must be 18 or older to use this app.')}
  if(!edit&&!$('#ok18').checked)return toast('Please confirm you are 18+ and accept the Terms');
  if(!main.url)return toast('Please add a profile picture');
  const btn=$('#sv');btn.disabled=true;btn.textContent='Saving...';
  const up=async f=>{const path=`${user.id}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.jpg`;const r=await sb.storage.from('photos').upload(path,f,{contentType:'image/jpeg'});if(r.error)throw r.error;return sb.storage.from('photos').getPublicUrl(path).data.publicUrl};
  let photo,photos=[];try{photo=main.file?await up(main.file):main.url;for(const g of gal)photos.push(g.file?await up(g.file):g.url)}catch(e){btn.disabled=false;btn.textContent='Save';return toast('Photo upload failed: '+e.message)}
  const row={id:user.id,name:$('#nm').value,age,cohort:$('#co').value,level:$('#lv').value,looking:$('#lk').value,bio:$('#bio').value,interests:[...sel],photo,photos};
  const{error}=await sb.from('profiles').upsert(row);if(error){btn.disabled=false;btn.textContent='Save';return toast(error.message)}
  if(removed.length)sb.storage.from('photos').remove(removed.filter(u=>u.includes('/photos/')).map(pathOf)).then(()=>{},()=>{});
  if(edit){tab=prevTab;deck=[];last=null;toast('Profile saved ✓')}boot(user)};
 if(edit){$('#bk').onclick=()=>{tab=prevTab;shell()};$('#ctc').onclick=()=>contact();$('#lo').onclick=()=>sb.auth.signOut();
  $('#hd').onclick=async()=>{await sb.from('profiles').update({hidden:!p.hidden}).eq('id',p.id);boot(user)};
  $('#dl').onclick=async()=>{if(confirm('Delete your profile? Your profile, matches and chats disappear for everyone. You can create a new profile later with the same email.')){await sb.rpc('delete_my_account');sb.auth.signOut()}}}}

// ---- SHELL ----
function shell(){app.innerHTML=`<div class="wrap" id="v"></div>
 <nav>${[['discover','🔥','Discover'],['likes','💛','Likes'],['chats','💬','Chats'],['premium','⭐','Premium'],['me','👤','Me']].map(([k,i,l])=>`<button data-t="${k}"><b>${i}</b>${l}</button>`).join('')}</nav>`;
 document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{if(b.dataset.t==='me'&&tab!=='me')prevTab=tab;tab=b.dataset.t;chat=null;go()});
 go()}
function go(){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));({discover,likes,chats,premium,me:()=>form({id:me.id,email:me.email},me)})[tab]()}

// ---- DISCOVER ----
async function discover(){
 if(!deck.length&&!last){await loadDeck()}
 const p=deck[0],v=$('#v');
 const fl=`<div class="chips"><select id="fk" style="width:auto">${['All',...LOOK].map(x=>`<option ${F.looking===x?'selected':''}>${x}</option>`).join('')}</select>
 <select id="fl" style="width:auto" ${prem(me)?'':'disabled'}>${['All',...LV].map(x=>`<option ${F.level===x?'selected':''}>${x}</option>`).join('')}</select><span class="tiny">${prem(me)?'Advanced filters on':'Level filter: Premium'}</span></div>`;
 let body;
 if(showAd&&!prem(me))body=`<div class="ad">📢 Ad space<br><small>Free tier ads. Go Premium to remove.</small></div><div class="acts"><button class="btn" id="ct">Continue</button></div>`;
 else if(!p)body=`<div class="card">No more profiles right now. Try changing filters or check back soon.</div>`;
 else{const s=p._s;body=`<div class="pcard"><div id="pimg">${imgOf(p,pi)}</div>${dots(p,pi)}<div class="score">🤖 ${s.pct}% match</div><div class="info"><h2>${esc(p.name)}, ${p.age} ${p.verified?'✅':''}</h2><div class="mut">${esc(p.level)} · ${esc(p.cohort)} · ${esc(p.looking)}</div><p style="margin:6px 0">${esc(p.bio)}</p>
 <div class="chips">${(p.interests||[]).map(i=>`<span class="chip ${s.sh.includes(i)?'sh':''}">${esc(i)}</span>`).join('')}</div></div></div>
 <div class="acts"><button class="rb" id="x">✕</button>${prem(me)?'<button class="rb" id="u">↩</button>':''}<button class="rb" id="s">⭐</button><button class="rb" id="l">💚</button></div>`}
 v.innerHTML=fl+body;
 if(p&&$('#pimg'))$('#pimg').onclick=e=>{const n=plist(p).length;if(n<2)return;const r=e.currentTarget.getBoundingClientRect();pi=e.clientX-r.left<r.width/2?Math.max(0,pi-1):Math.min(n-1,pi+1);discover()};
 $('#fk').onchange=e=>{F.looking=e.target.value;deck=[];last=null;discover()};$('#fl').onchange=e=>{F.level=e.target.value;deck=[];last=null;discover()};
 if($('#ct'))$('#ct').onclick=()=>{showAd=false;discover()};
 if(p&&!showAd){$('#x').onclick=()=>swipe('pass');$('#s').onclick=()=>swipe('super');$('#l').onclick=()=>swipe('like');
  if($('#u'))$('#u').onclick=async()=>{if(!last)return toast('Nothing to undo');await sb.from('swipes').delete().eq('from_id',me.id).eq('to_id',last.id);deck.unshift(last);last=null;discover()}}}
async function loadDeck(){
 const{data:sw}=await sb.from('swipes').select('to_id').eq('from_id',me.id);const seen=new Set((sw||[]).map(x=>x.to_id));seen.add(me.id);
 const{data}=await sb.from('profiles').select('*').eq('status','active').eq('hidden',false).limit(200);
 deck=(data||[]).filter(p=>!seen.has(p.id)&&(F.looking==='All'||p.looking===F.looking||p.looking==='Both')&&(F.level==='All'||p.level===F.level)).map(p=>({...p,_s:score(me,p)})).sort((a,b)=>b._s.pct-a._s.pct)}
async function swipe(kind){const p=deck[0];
 const{error}=await sb.from('swipes').insert({from_id:me.id,to_id:p.id,kind});
 if(error)return toast(error.message.includes('LIMIT')?'Daily limit of 20 likes reached. Go Premium for unlimited!':error.message);
 last=p;deck.shift();pi=0;n++;if(n%5===0)showAd=true;
 if(kind!=='pass'){const[a,b]=[me.id,p.id].sort();const{data}=await sb.from('matches').select('id').eq('a',a).eq('b',b);if(data&&data.length)toast("🎉 It's a match with "+p.name+'!')}
 discover()}

// ---- LIKES (premium) ----
async function likes(){const v=$('#v');
 if(!prem(me)){v.innerHTML=`<h2>Who liked you</h2><div class="card"><div class="lock">${[1,2,3].map(()=>`<div class="row"><div class="av">🙂</div><b>Someone special</b></div>`).join('')}</div><button class="btn" onclick="tab='premium';go()">Unlock with Premium ₹50/mo</button></div>`;return}
 const{data}=await sb.from('swipes').select('from_id,kind').eq('to_id',me.id).in('kind',['like','super']);
 const ids=(data||[]).map(x=>x.from_id);const{data:ps}=ids.length?await sb.from('profiles').select('*').in('id',ids):{data:[]};
 v.innerHTML=`<h2>Who liked you</h2>${(ps||[]).map(p=>`<div class="row">${av(p)}<div style="flex:1"><b>${esc(p.name)}, ${p.age}</b><div class="tiny">${esc(p.level)} · ${esc(p.looking)}</div></div><button class="btn s" data-id="${p.id}">Like back</button></div>`).join('')||'<p class="mut">No likes yet.</p>'}`;
 v.querySelectorAll('button[data-id]').forEach(b=>b.onclick=async()=>{const r=await sb.from('swipes').upsert({from_id:me.id,to_id:b.dataset.id,kind:'like'});toast(r.error?r.error.message:'Liked back! Check Chats');likes()})}

// ---- CHATS ----
async function chats(){const v=$('#v');
 const{data:ms}=await sb.from('matches').select('*').or(`a.eq.${me.id},b.eq.${me.id}`);
 const ids=(ms||[]).map(m=>m.a===me.id?m.b:m.a);const{data:ps}=ids.length?await sb.from('profiles').select('*').in('id',ids):{data:[]};
 const by=Object.fromEntries((ps||[]).map(p=>[p.id,p]));
 v.innerHTML=`<h2>Matches</h2>${(ms||[]).map(m=>{const o=by[m.a===me.id?m.b:m.a];return o?`<div class="row" data-m="${m.id}" data-o="${o.id}">${av(o)}<b>${esc(o.name)}</b></div>`:''}).join('')||'<p class="mut">No matches yet. Keep swiping!</p>'}`;
 v.querySelectorAll('.row').forEach(r=>r.onclick=()=>openChat(r.dataset.m,by[r.dataset.o]))}
async function openChat(mid,o){chat={mid,o};const v=$('#v');
 v.innerHTML=`<div class="row" style="cursor:default"><button class="btn s g" id="bk">←</button>${av(o)}<b style="flex:1">${esc(o.name)}</b><button class="btn s g" id="mn">⋯</button></div><div class="msgs" id="ms"></div><div class="send"><input id="mi" placeholder="Message 😊" maxlength="1000"><button class="btn" id="sn">Send</button></div>`;
 $('#bk').onclick=()=>{chat=null;chats()};
 $('#mn').onclick=async()=>{const c=prompt('Type: report, block or unmatch');if(!c)return;
  if(c==='report'){const r=prompt('Reason?');if(r){await sb.from('reports').insert({reporter:me.id,reported:o.id,reason:r});toast('Reported. Admins will review.')}}
  else if(c==='block'||c==='unmatch'){if(c==='block')await sb.from('swipes').upsert({from_id:me.id,to_id:o.id,kind:'block'});await sb.from('matches').delete().eq('id',mid);chat=null;chats()}};
 $('#sn').onclick=async()=>{const b=$('#mi').value.trim();if(!b)return;$('#mi').value='';const{error}=await sb.from('messages').insert({match_id:mid,sender:me.id,body:b});if(error)toast(error.message);else loadMsgs()};
 loadMsgs()}
async function loadMsgs(){if(!chat)return;const{data}=await sb.from('messages').select('*').eq('match_id',chat.mid).order('created_at');
 const el=$('#ms');if(!el)return;el.innerHTML=(data||[]).map(m=>`<div class="bub ${m.sender===me.id?'me':''}">${esc(m.body)}${m.sender===me.id?` <small>${m.read?'✓✓':'✓'}</small>`:''}</div>`).join('');el.scrollTop=1e9;
 sb.from('messages').update({read:true}).eq('match_id',chat.mid).neq('sender',me.id).eq('read',false).then(()=>{})}
let ch;function live(){if(ch)return;ch=sb.channel('live')
 .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},e=>{if(e.new.sender!==me.id){if(chat&&chat.mid===e.new.match_id)loadMsgs();else toast('💬 New message')}})
 .on('postgres_changes',{event:'INSERT',schema:'public',table:'matches'},e=>{if([e.new.a,e.new.b].includes(me.id))toast("🎉 New match!")}).subscribe()}

// ---- PREMIUM ----
async function premium(){const v=$('#v');const{data:pay}=await sb.from('payments').select('*').eq('user_id',me.id).order('created_at',{ascending:false});
 v.innerHTML=`<h2>Plans</h2><div class="card"><b>Free · ₹0</b><p class="mut">20 likes/day, basic matching, chat after match, basic filters, ads.</p></div>
 <div class="card" style="border-color:var(--b)"><b>Premium · ₹50/month</b><p class="mut">Unlimited likes, see who liked you, advanced filters, undo swipes, no ads.</p>
 ${prem(me)?`<p style="color:var(--ok)">✅ Active until ${new Date(me.paid_until).toLocaleDateString()}</p>`:''}
 <button class="btn" id="pn">Pay ₹50 and activate instantly</button></div>
 ${(pay||[]).map(p=>`<div class="row" style="cursor:default"><span>${esc(p.ref)}</span><span class="pill">${p.status}</span></div>`).join('')}`;
$('#pn').onclick=payNow}

// ---- AUTOMATIC PAYMENT (Razorpay) ----
async function payNow(){const{data,error}=await sb.functions.invoke('create-order');
 if(error||!data||!data.order_id)return toast('Could not start payment. Try again');
 new Razorpay({key:data.key,order_id:data.order_id,name:'BS Degree Dating App',description:'Premium, 1 month',theme:{color:'#ff4d94'},prefill:{email:me.email},
  handler:()=>{toast('Payment received! Activating Premium...');pollPrem()}}).open()}
async function pollPrem(i=0){const{data}=await sb.from('profiles').select('*').eq('id',me.id).single();
 if(prem(data)){me=data;toast('⭐ Premium activated!');return premium()}
 if(i<15)setTimeout(()=>pollPrem(i+1),2000);else toast('Payment is processing. Premium will turn on shortly.')}

// ---- CONTACT (messages are emailed to you via Web3Forms) ----
function contact(){const o=document.createElement('div');o.id='cto';o.innerHTML=`<div class="wrap"><h2>Contact us</h2><div class="card"><input id="cn" placeholder="Your name"><input id="ce" type="email" placeholder="Your email (so we can reply)"><textarea id="cm" rows="5" placeholder="Your message"></textarea><button class="btn" id="cs">Send</button><button class="btn g" id="cx">Close</button></div></div>`;document.body.appendChild(o);
 $('#cx').onclick=()=>o.remove();
 $('#cs').onclick=async()=>{const m=$('#cm').value.trim();if(m.length<5)return toast('Please write a message');
  const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:W3F_KEY,subject:'BS Degree Dating App: new message',name:$('#cn').value,email:$('#ce').value,message:m})}).then(x=>x.json()).catch(()=>({}));
  if(r.success){toast('Sent! We will reply soon');o.remove()}else toast('Could not send. Try again')}}

// ---- START ----
sb.auth.getSession().then(({data:{session}})=>session?boot(session.user):authView());
sb.auth.onAuthStateChange(e=>{if(e==='SIGNED_OUT'){ch&&sb.removeChannel(ch);ch=null;authView()}});
