const SB_URL='https://rmywttlijzpmfwsamjlu.supabase.co', SB_KEY='sb_publishable_Z6-8OfMYsbKTRPkMHejQaQ_uL1SqWZu';
const sb=supabase.createClient(SB_URL,SB_KEY);
const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>t.style.display='none',3500)}
const PK={profiles:['id'],swipes:['from_id','to_id'],matches:['id'],messages:['id'],reports:['id'],payments:['id'],allowed_emails:['email'],blocked_users:['email'],admins:['email'],deleted_accounts:['id']};
const TABS=[['dash','Dashboard'],['users','Users'],['deleted','Deleted accounts'],['reports','Reports'],['payments','Payments'],['chats','Chats'],['allowed','Allowed emails'],['blocked','Blocked'],['admins','Admins'],['db','Database']];
let me,isSuper=false,at='dash',dbt='profiles';
const prem=p=>p&&p.plan==='premium'&&p.paid_until&&new Date(p.paid_until)>new Date();
const day=d=>new Date(Math.max(Date.now(),d?+new Date(d):0)+30*864e5).toISOString();
const ok=r=>{toast(r&&r.error?'Error: '+r.error.message:'Done ✓');return !(r&&r.error)};
const fmt=d=>d?new Date(d).toLocaleString():'';
const upd=(id,v)=>sb.from('profiles').update(v).eq('id',id);
async function names(ids){const{data}=ids.length?await sb.from('profiles').select('id,name,email').in('id',ids):{data:[]};const o=Object.fromEntries((data||[]).map(p=>[p.id,p]));
 const miss=ids.filter(i=>!o[i]);if(miss.length){const{data:d}=await sb.from('deleted_accounts').select('old_user_id,name,email').in('old_user_id',miss);(d||[]).forEach(x=>o[x.old_user_id]={id:x.old_user_id,name:x.name+' (deleted)',email:x.email})}return o}

function modal(title,text,onSave,label='Save'){const o=document.createElement('div');o.id='cto';
 o.innerHTML=`<div class="wrap wide"><h2>${esc(title)}</h2><div class="card"><textarea id="mj" rows="16" style="font-family:monospace;font-size:.8rem">${esc(text)}</textarea><button class="btn" id="mS">${esc(label)}</button><button class="btn g" id="mX">Cancel</button></div></div>`;
 document.body.appendChild(o);$('#mX').onclick=()=>o.remove();
 $('#mS').onclick=async()=>{let v;try{v=JSON.parse($('#mj').value)}catch(e){return toast('Invalid JSON')}if(await onSave(v))o.remove()}}

// ---- LOGIN ----
function loginView(m){app.innerHTML=`<div class="wrap hero"><div class="logo">🛡️</div><h1>Admin</h1><p class="mut" style="margin:10px 0">${esc(m||'Admins only')}</p><div class="card"><button class="btn" id="gg">Sign in with Google</button></div></div>`;
 $('#gg').onclick=()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}})}
async function init(){const{data:{session}}=await sb.auth.getSession();if(!session)return loginView();
 me=session.user;const{data}=await sb.from('admins').select('*').eq('email',me.email);
 if(!data||!data.length){app.innerHTML=`<div class="wrap hero"><div class="logo">🚫</div><h2>Access denied</h2><p class="mut" style="margin:10px 0">${esc(me.email)} is not an admin.</p><button class="btn g" id="lo">Sign out</button></div>`;$('#lo').onclick=()=>sb.auth.signOut().then(()=>location.reload());return}
 isSuper=!!data[0].is_super;shell()}
function shell(){app.innerHTML=`<div class="wrap wide"><div class="row" style="cursor:default"><h2 style="flex:1;margin:0">🛡️ Admin ${isSuper?'<span class="pill">super</span>':''}</h2><span class="tiny">${esc(me.email)}</span><button class="btn s g" id="lo">Sign out</button></div>
<div class="tabs">${TABS.map(([k,l])=>`<span class="chip ${at===k?'on':''}" data-t="${k}">${l}</span>`).join('')}</div><div id="ab"></div></div>`;
 $('#lo').onclick=()=>sb.auth.signOut().then(()=>location.reload());
 document.querySelectorAll('.tabs .chip').forEach(c=>c.onclick=()=>{at=c.dataset.t;shell()});
 ({dash:aDash,users:aUsers,deleted:aDeleted,reports:aReports,payments:aPay,chats:aChats,allowed:aAllowed,blocked:aBlocked,admins:aAdmins,db:aDb})[at]()}

// ---- DASHBOARD ----
async function aDash(){const c=async(t,f)=>{let q=sb.from(t).select('*',{count:'exact',head:true});if(f)q=f(q);return(await q).count??0};
 const[u,p,s,m,g,r,a,bl,dl]=await Promise.all([c('profiles'),c('profiles',q=>q.eq('plan','premium')),c('profiles',q=>q.eq('status','suspended')),c('matches'),c('messages'),c('reports'),c('allowed_emails'),c('blocked_users'),c('deleted_accounts')]);
 $('#ab').innerHTML=`<div class="grid">${Object.entries({Users:u,Premium:p,Suspended:s,Matches:m,Messages:g,Reports:r,'Allowed emails':a,Blocked:bl,'Deleted accounts':dl}).map(([k,v])=>`<div class="card"><span class="mut">${k}</span><h2>${v}</h2></div>`).join('')}</div>`}

// ---- USERS ----
async function aUsers(q=''){const b=$('#ab');let r=sb.from('profiles').select('*').order('created_at',{ascending:false}).limit(40);if(q)r=r.or(`name.ilike.%${q}%,email.ilike.%${q}%`);const{data,error}=await r;
 b.innerHTML=`<div class="send"><input id="sq" placeholder="Search name or email" value="${esc(q)}"><button class="btn" id="sg" style="width:90px">Search</button></div>${error?`<p style="color:#e03150">${esc(error.message)}</p>`:''}
 ${(data||[]).map(p=>`<div class="card"><b>${esc(p.name)}, ${esc(p.age)}</b> <span class="pill">${esc(p.plan)}${prem(p)?' ✓':''}</span><span class="pill">${esc(p.status)}</span>${p.hidden?'<span class="pill">hidden</span>':''}
 <div class="tiny">${esc(p.email)} · ${esc(p.level)} · ${esc(p.cohort)}${p.paid_until?' · premium until '+new Date(p.paid_until).toLocaleDateString():''}</div>
 <button class="btn s" data-a="paid" data-i="${p.id}">Mark paid +30d</button><button class="btn s g" data-a="free" data-i="${p.id}">Mark free</button>
 <button class="btn s d" data-a="${p.status==='suspended'?'unsus':'sus'}" data-i="${p.id}">${p.status==='suspended'?'Unsuspend':'Suspend'}</button>
 <button class="btn s g" data-a="ver" data-i="${p.id}">${p.verified?'Unverify':'Verify'}</button><button class="btn s g" data-a="edit" data-i="${p.id}">Edit</button>
 <button class="btn s d" data-a="ban" data-i="${p.id}">Remove &amp; ban</button></div>`).join('')||'<p class="mut">No users.</p>'}`;
 $('#sg').onclick=()=>aUsers($('#sq').value.trim());
 b.querySelectorAll('button[data-a]').forEach(x=>x.onclick=async()=>{const i=x.dataset.i,a=x.dataset.a,p=data.find(z=>z.id===i);let r;
  if(a==='paid')r=await upd(i,{plan:'premium',paid_until:day(p.paid_until)});
  else if(a==='free')r=await upd(i,{plan:'free',paid_until:null});
  else if(a==='sus')r=await upd(i,{status:'suspended'});
  else if(a==='unsus')r=await upd(i,{status:'active'});
  else if(a==='ver')r=await upd(i,{verified:!p.verified});
  else if(a==='edit')return modal('Edit '+p.name,JSON.stringify(p,null,2),async v=>{const{id,...rest}=v;if(ok(await upd(i,rest))){aUsers(q);return true}});
  else if(a==='ban'){if(!confirm('Remove this user and block their email from signing in again?'))return;await sb.from('blocked_users').upsert({email:p.email,reason:'removed by admin'});r=await sb.from('profiles').delete().eq('id',i)}
  ok(r);aUsers(q)})}

// ---- DELETED ACCOUNTS ----
async function aDeleted(){const b=$('#ab');const{data,error}=await sb.from('deleted_accounts').select('*').order('deleted_at',{ascending:false}).limit(50);
 b.innerHTML=`<p class="tiny">Accounts that users deleted themselves. They are hidden from everyone else, and the person can sign up again with the same email as a new profile. <b>Delete forever</b> removes the record and photo from the database for good.</p>${error?`<p style="color:#e03150">${esc(error.message)}</p>`:''}
 ${(data||[]).map(d=>`<div class="card"><b>${esc(d.name)}</b> <span class="pill">deleted</span><div class="tiny">${esc(d.email)} · deleted ${fmt(d.deleted_at)} · ${(d.matches||[]).length} matches · ${(d.messages||[]).length} messages</div>
 <button class="btn s g" data-v="${d.id}">View data</button><button class="btn s d" data-f="${d.id}">Delete forever</button></div>`).join('')||'<p class="mut">No deleted accounts.</p>'}`;
 b.querySelectorAll('[data-v]').forEach(x=>x.onclick=()=>{const d=data.find(z=>String(z.id)===x.dataset.v);modal('Deleted account: '+d.name,JSON.stringify(d,null,2),async()=>true,'Close')});
 b.querySelectorAll('[data-f]').forEach(x=>x.onclick=async()=>{const d=data.find(z=>String(z.id)===x.dataset.f);if(!confirm('Permanently delete this record? This cannot be undone.'))return;
  const ph=d.profile&&d.profile.photo;if(ph&&ph.includes('/photos/'))await sb.storage.from('photos').remove([decodeURIComponent(ph.split('/photos/')[1].split('?')[0])]);
  ok(await sb.from('deleted_accounts').delete().eq('id',d.id));aDeleted()})}

// ---- REPORTS ----
async function aReports(){const b=$('#ab');const{data}=await sb.from('reports').select('*').order('created_at',{ascending:false}).limit(60);
 const nm=await names([...new Set((data||[]).flatMap(r=>[r.reporter,r.reported]))]);const N=i=>nm[i]?nm[i].name+' ('+nm[i].email+')':'deleted user';
 b.innerHTML=(data||[]).map(r=>`<div class="card"><b>${esc(N(r.reported))}</b><div class="tiny">reported by ${esc(N(r.reporter))} · ${fmt(r.created_at)}</div><p>${esc(r.reason)}</p>
 <button class="btn s d" data-s="${r.reported}">Suspend</button><button class="btn s g" data-d="${r.id}">Dismiss</button></div>`).join('')||'<p class="mut">No reports.</p>';
 b.querySelectorAll('[data-s]').forEach(x=>x.onclick=async()=>{ok(await upd(x.dataset.s,{status:'suspended'}))});
 b.querySelectorAll('[data-d]').forEach(x=>x.onclick=async()=>{ok(await sb.from('reports').delete().eq('id',x.dataset.d));aReports()})}

// ---- PAYMENTS ----
async function aPay(){const b=$('#ab');const{data}=await sb.from('payments').select('*').order('created_at',{ascending:false}).limit(60);const nm=await names((data||[]).map(p=>p.user_id));
 b.innerHTML='<p class="tiny">Payments are automatic (Razorpay). To give premium by hand, use Users → Mark paid.</p>'+((data||[]).map(p=>`<div class="card"><b>${esc(nm[p.user_id]?.name)}</b><span class="pill">${esc(p.status)}</span><div class="tiny">${esc(nm[p.user_id]?.email)} · ${esc(p.ref)} · ${fmt(p.created_at)}</div></div>`).join('')||'<p class="mut">No payments yet.</p>')}

// ---- CHATS ----
async function aChats(){const b=$('#ab');b.innerHTML=`<p class="tiny">Chat access is for safety reviews only. Use responsibly.</p><div class="send"><input id="cq" placeholder="Search user name or email"><button class="btn" id="cs" style="width:90px">Search</button></div><div id="cr"></div>`;
 $('#cs').onclick=async()=>{const q=$('#cq').value.trim();const{data}=await sb.from('profiles').select('id,name,email').or(`name.ilike.%${q}%,email.ilike.%${q}%`).limit(10);
  $('#cr').innerHTML=(data||[]).map(p=>`<div class="row" data-u="${p.id}"><b>${esc(p.name)}</b><span class="tiny">${esc(p.email)}</span></div>`).join('')||'<p class="mut">No users.</p>';
  $('#cr').querySelectorAll('.row').forEach(r=>r.onclick=()=>userChats(r.dataset.u))}}
async function userChats(u){const{data:ms}=await sb.from('matches').select('*').or(`a.eq.${u},b.eq.${u}`);const nm=await names([...new Set((ms||[]).flatMap(m=>[m.a,m.b]))]);
 $('#cr').innerHTML=(ms||[]).map(m=>`<div class="row" data-m="${m.id}">${esc(nm[m.a]?.name)} ↔ ${esc(nm[m.b]?.name)}</div>`).join('')||'<p class="mut">No chats.</p>';
 $('#cr').querySelectorAll('.row').forEach(x=>x.onclick=()=>showChat(x.dataset.m,u))}
async function showChat(mid,u){const{data}=await sb.from('messages').select('*').eq('match_id',mid).order('created_at');
 $('#cr').innerHTML=`<button class="btn s g" id="bk">← Back</button><button class="btn s d" id="dm">Delete this match &amp; chat</button><div class="msgs">${(data||[]).map(m=>`<div class="bub ${m.sender===u?'me':''}">${esc(m.body)} <small data-x="${m.id}" style="cursor:pointer">🗑</small></div>`).join('')||'Empty'}</div>`;
 $('#bk').onclick=()=>userChats(u);$('#dm').onclick=async()=>{if(confirm('Delete this match and all its messages?')){ok(await sb.from('matches').delete().eq('id',mid));userChats(u)}};
 $('#cr').querySelectorAll('[data-x]').forEach(x=>x.onclick=async()=>{ok(await sb.from('messages').delete().eq('id',x.dataset.x));showChat(mid,u)})}

// ---- ALLOWED EMAILS (non-student logins) ----
async function aAllowed(){const b=$('#ab');const{data}=await sb.from('allowed_emails').select('*').order('created_at',{ascending:false});
 b.innerHTML=`<div class="card"><b>Let non-student emails log in</b><p class="tiny">Add testers' Gmail or any email. One per line or separated by commas. Removing an email only stops new sign-ups. To stop an existing user, use Users → Remove &amp; ban.</p><textarea id="ae" rows="3" placeholder="friend@gmail.com"></textarea><input id="an" placeholder="Note (optional)"><button class="btn" id="aa">Add</button></div>
 ${(data||[]).map(a=>`<div class="row" style="cursor:default"><span style="flex:1">${esc(a.email)}<div class="tiny">${esc(a.note)}</div></span><button class="btn s d" data-r="${esc(a.email)}">Remove</button></div>`).join('')}`;
 $('#aa').onclick=async()=>{const es=[...new Set($('#ae').value.toLowerCase().split(/[\s,;]+/).filter(x=>x.includes('@')))];if(!es.length)return toast('Enter an email');ok(await sb.from('allowed_emails').upsert(es.map(email=>({email,note:$('#an').value,added_by:me.email}))));aAllowed()};
 b.querySelectorAll('[data-r]').forEach(x=>x.onclick=async()=>{ok(await sb.from('allowed_emails').delete().eq('email',x.dataset.r));aAllowed()})}

// ---- BLOCKED ----
async function aBlocked(){const b=$('#ab');const{data}=await sb.from('blocked_users').select('*').order('created_at',{ascending:false});
 b.innerHTML=`<div class="card"><b>Block an email</b><input id="be" type="email" placeholder="email to block"><input id="br" placeholder="Reason"><button class="btn d" id="ba">Block</button></div>
 <p class="tiny">People who enter an age under 18 land here automatically. Unblock only if it was a mistake.</p>
 ${(data||[]).map(a=>`<div class="row" style="cursor:default"><span style="flex:1">${esc(a.email)}<div class="tiny">${esc(a.reason)} · ${fmt(a.created_at)}</div></span><button class="btn s g" data-r="${esc(a.email)}">Unblock</button></div>`).join('')||'<p class="mut">Nobody blocked.</p>'}`;
 $('#ba').onclick=async()=>{const e=$('#be').value.trim().toLowerCase();if(!e)return;ok(await sb.from('blocked_users').upsert({email:e,reason:$('#br').value||'blocked by admin'}));aBlocked()};
 b.querySelectorAll('[data-r]').forEach(x=>x.onclick=async()=>{ok(await sb.from('blocked_users').delete().eq('email',x.dataset.r));aBlocked()})}

// ---- ADMINS ----
async function aAdmins(){const b=$('#ab');const{data}=await sb.from('admins').select('*');
 b.innerHTML=(data||[]).map(a=>`<div class="row" style="cursor:default"><span style="flex:1">${esc(a.email)}${a.is_super?' <span class="pill">super</span>':''}</span>${isSuper&&!a.is_super?`<button class="btn s d" data-r="${esc(a.email)}">Remove</button>`:''}</div>`).join('')+
 (isSuper?`<div class="card"><b>Add admin</b><input id="ne" type="email" placeholder="New admin email"><button class="btn" id="na">Add admin</button></div>`:'<p class="tiny">Only the super admin can add or remove admins.</p>');
 if(isSuper){$('#na').onclick=async()=>{const e=$('#ne').value.trim().toLowerCase();if(!e)return;ok(await sb.from('admins').insert({email:e}));aAdmins()};
  b.querySelectorAll('[data-r]').forEach(x=>x.onclick=async()=>{if(confirm('Remove this admin?')){ok(await sb.from('admins').delete().eq('email',x.dataset.r));aAdmins()}})}}

// ---- DATABASE EDITOR (any table, any row) ----
async function aDb(){const b=$('#ab');const{data,error}=await sb.from(dbt).select('*').limit(100);
 b.innerHTML=`<div class="send"><select id="dt" style="margin:0">${Object.keys(PK).map(x=>`<option ${x===dbt?'selected':''}>${x}</option>`).join('')}</select><button class="btn s" id="da">+ Add row</button></div>
 <p class="tiny">Up to 100 rows shown. Changes here edit the live database directly. Be careful.${dbt==='admins'&&!isSuper?' Only the super admin can change admins.':''}</p>${error?`<p style="color:#e03150">${esc(error.message)}</p>`:''}
 ${(data||[]).map((r,i)=>`<div class="card"><pre>${esc(JSON.stringify(r,null,1))}</pre><button class="btn s" data-e="${i}">Edit</button><button class="btn s d" data-x="${i}">Delete</button></div>`).join('')}`;
 const f=(q,r)=>PK[dbt].reduce((q,c)=>q.eq(c,r[c]),q);
 $('#dt').onchange=e=>{dbt=e.target.value;aDb()};
 $('#da').onclick=()=>modal('Add row to '+dbt,'{\n  \n}',async v=>{if(ok(await sb.from(dbt).insert(v))){aDb();return true}});
 b.querySelectorAll('[data-e]').forEach(x=>x.onclick=()=>{const r=data[x.dataset.e];modal('Edit row in '+dbt,JSON.stringify(r,null,2),async v=>{const v2={...v};PK[dbt].forEach(c=>delete v2[c]);if(ok(await f(sb.from(dbt).update(v2),r))){aDb();return true}})});
 b.querySelectorAll('[data-x]').forEach(x=>x.onclick=async()=>{if(confirm('Delete this row?')){const r=data[x.dataset.x];ok(await f(sb.from(dbt).delete(),r));aDb()}})}

init();
