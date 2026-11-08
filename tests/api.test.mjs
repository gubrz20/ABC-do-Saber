import test from 'node:test';
import assert from 'node:assert/strict';
import { AccountAPI } from '../src/api.js';
const config={supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'sb_publishable_example'};

test('unconfigured accounts never pretend to sign in',async()=>{
  const api=new AccountAPI({},()=>{throw new Error('Should not fetch');});
  await assert.rejects(api.login('family@example.test','password'),/não foram conectadas/);
});
test('child-scoped RPC sends no adult JWT or invalid publishable-key bearer',async()=>{
  let headers,body;
  const api=new AccountAPI(config,async(url,opts)=>{headers=opts.headers;body=JSON.parse(opts.body);return Response.json({completed:['vogais']});});
  api.session={access_token:'ADULT_PRIVATE_TOKEN'};
  await api.complete('scoped-child-token','vogais');
  assert.equal(headers.Authorization,undefined);assert.equal(headers.apikey,config.supabasePublishableKey);
  assert.deepEqual(body,{p_token:'scoped-child-token',p_activity:'vogais'});
});
test('adult session is erased even when logout fails',async()=>{
  const api=new AccountAPI(config,async()=>{throw new Error('Network unavailable');});api.session={access_token:'test'};
  await assert.rejects(api.logout());assert.equal(api.session,null);
});
test('provider failures and session revocation yield actionable Portuguese copy',async()=>{
  const api=new AccountAPI(config,async()=>Response.json({message:'session_expired'},{status:400}));
  await assert.rejects(api.childStatus('invalid'),/autorização mudou/);
});
