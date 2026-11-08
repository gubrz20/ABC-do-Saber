import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {PGlite}=require(process.env.ABC_PGLITE || '@electric-sql/pglite');
const db=new PGlite();
let checks=0;
const assertCheck=(condition,message)=>{assert.ok(condition,message);checks++;};
const val=async(sql,params=[]) => Object.values((await db.query(sql,params)).rows[0])[0];
const ids={parent:'10000000-0000-4000-8000-000000000001',other:'10000000-0000-4000-8000-000000000002',teacher:'10000000-0000-4000-8000-000000000003',stranger:'10000000-0000-4000-8000-000000000004'};
async function login(id,role='authenticated') { await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role '+role); }
async function denied(fn,label){await assert.rejects(fn);checks++;console.log('PASS',label);}
try{
  await db.exec(`create schema auth;create role anon;create role authenticated;grant usage on schema public,auth to anon,authenticated;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;`);
  await db.exec(await readFile(new URL('../supabase/migrations/202610260001_abc_do_saber.sql',import.meta.url),'utf8'));
  for(const [name,id] of Object.entries(ids)) await db.query('insert into auth.users values($1,$2,$3)',[id,name+'@example.test',JSON.stringify({adult_role:['teacher','stranger'].includes(name)?'teacher':'parent',display_name:name,school_name:'Escola de Teste'})]);
  await login(ids.parent);
  const child=await val("select public.create_child('Criança A','star')");
  await denied(()=>db.query('select * from public.children'),'direct tables are inaccessible even to parent');
  await denied(()=>db.query('select public._completed($1)',[child]),'private helper cannot bypass permissions');
  await login(ids.other);assertCheck((await val('select public.dashboard_data()')).children.length===0,'unrelated family sees no children');
  await denied(()=>db.query('select public.start_child_session($1)',[child]),'another family cannot open child session');
  await login(ids.teacher);
  await denied(()=>db.query("select public.create_child('Wrong owner','star')"),'teacher cannot create family profiles');
  await denied(()=>db.query('select public.start_child_session($1)',[child]),'teacher needs explicit parent authorization');
  const invite=await val('select public.create_invite()');
  await login(ids.parent);
  const preview=await val('select public.preview_invite($1)',[invite.code]);assertCheck(preview.email==='teacher@example.test','invitation exposes exact teacher identity to parent');
  const grant=await val('select public.accept_invite($1,$2)',[invite.code,child]);
  await denied(()=>db.query('select public.accept_invite($1,$2)',[invite.code,child]),'invitation is single-use');
  await login(ids.teacher);assertCheck((await val('select public.dashboard_data()')).children.length===1,'approved teacher sees authorized child');
  const session=await val('select public.start_child_session($1)',[child]);
  await login(null,'anon');
  await denied(()=>db.query('select public.dashboard_data()'),'child token cannot call adult RPC');
  const first=await val('select public.complete_activity($1,$2)',[session.token,'vogais']);
  const repeated=await val('select public.complete_activity($1,$2)',[session.token,'vogais']);
  assertCheck(first.completed.length===1&&repeated.completed.length===1,'repeat completion is idempotent');
  await db.exec('reset role');
  await db.exec(await readFile(new URL('../supabase/migrations/202610260002_more_activities.sql',import.meta.url),'utf8'));
  await login(null,'anon');
  assertCheck((await val('select public.child_status($1)',[session.token])).completed.includes('vogais'),'content migration preserves previous completions and open sessions');
  for(const activity of ['memoria-vogais','letras-figuras','elefantinho-semente','pipa-amizade']){
    const saved=await val('select public.complete_activity($1,$2)',[session.token,activity]);
    assertCheck(saved.completed.includes(activity),'new content can be saved: '+activity);
  }
  const repeatNew=await val('select public.complete_activity($1,$2)',[session.token,'memoria-vogais']);
  assertCheck(repeatNew.completed.length===5,'new activities remain idempotent after content migration');
  await db.exec('reset role');
  await db.exec(await readFile(new URL('../supabase/migrations/202610260003_garden_train.sql',import.meta.url),'utf8'));
  await login(null,'anon');
  assertCheck((await val('select public.child_status($1)',[session.token])).completed.length===5,'garden/train migration preserves all previous completions and sessions');
  for(const activity of ['jardim-letras','trem-vogais']){
    const saved=await val('select public.complete_activity($1,$2)',[session.token,activity]);
    assertCheck(saved.completed.includes(activity),'new game can be saved: '+activity);
  }
  const repeatGarden=await val('select public.complete_activity($1,$2)',[session.token,'jardim-letras']);
  assertCheck(repeatGarden.completed.length===7,'garden replay remains idempotent');
  await denied(()=>db.query('select public.complete_activity($1,$2)',[session.token,'fake']),'unknown activity cannot be saved');
  await denied(()=>db.query('select public.child_status($1)',['x'.repeat(64)]),'forged token cannot access progress');
  await login(ids.stranger);
  await denied(()=>db.query('select public.revoke_grant($1)',[grant]),'another teacher cannot revoke a family grant');
  await login(ids.parent);await db.query('select public.revoke_grant($1)',[grant]);
  await login(null,'anon');
  await denied(()=>db.query('select public.child_status($1)',[session.token]),'revocation invalidates already-open child session');
  await denied(()=>db.query('select public.complete_activity($1,$2)',[session.token,'casa-das-vogais']),'revoked teacher cannot record more activities');
  await login(ids.teacher);assertCheck((await val('select public.dashboard_data()')).children.length===0,'revoked teacher no longer sees the profile');
  await denied(()=>db.query('select public.start_child_session($1)',[child]),'revoked teacher cannot reopen child');
  await login(ids.parent);const own=await val('select public.start_child_session($1)',[child]);
  await login(null,'anon');await db.query('select public.end_child_session($1)',[own.token]);
  await denied(()=>db.query('select public.child_status($1)',[own.token]),'ended session token is unusable');
  console.log(`PASS ${checks} PostgreSQL access and lifecycle checks`);
}finally{await db.close();}
