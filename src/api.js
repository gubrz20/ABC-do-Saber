export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.status = status; }
}

export class AccountAPI {
  constructor(config = {}, fetcher = globalThis.fetch) {
    this.url = (config.supabaseUrl || '').replace(/\/$/, '');
    this.key = config.supabasePublishableKey || '';
    this.fetcher = fetcher.bind(globalThis);
    this.session = null;
  }
  get configured() { return /^https:\/\/[a-z\d.-]+(?::\d+)?$/i.test(this.url) && !!this.key; }
  async request(path, body, { method = 'POST', adult = true } = {}) {
    if (!this.configured) throw new ApiError('As contas ainda não foram conectadas. Você pode explorar as atividades enquanto isso.');
    if (adult && !this.session) throw new ApiError('Entre novamente para continuar.', 401);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await this.fetcher(this.url + path, {
        method, signal: controller.signal,
        headers: { apikey: this.key, 'Content-Type': 'application/json', ...(adult ? { Authorization: `Bearer ${this.session.access_token}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const known = {
          invalid_credentials: 'E-mail ou senha incorretos. Confira e tente novamente.',
          email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
          user_already_exists: 'Este e-mail já tem uma conta. Tente entrar.',
          over_email_send_rate_limit: 'Aguarde um pouco antes de pedir outro e-mail.',
          weak_password: 'Use uma senha com pelo menos 10 caracteres.',
        };
        const rpcMessages = {
          'invalid_invite': 'Esse convite não está disponível. Peça um novo ao professor.',
          'access_denied': 'Este perfil não está disponível para sua conta.',
          'session_expired': 'A sessão da criança terminou ou a autorização mudou. Entre na área adulta para continuar.',
          'invalid_name': 'Digite um nome de exibição entre 2 e 30 caracteres.',
        };
        throw new ApiError(known[data?.error_code] || rpcMessages[data?.message] || (response.status === 401 ? 'Sua sessão terminou. Entre novamente.' : 'Não foi possível concluir. Confira sua conexão e tente novamente.'), response.status);
      }
      return data;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(e.name === 'AbortError' ? 'A conexão demorou. Tente novamente.' : 'Sem conexão com as contas. Confira a internet e tente novamente.');
    } finally { clearTimeout(timeout); }
  }
  async login(email, password) {
    const data = await this.request('/auth/v1/token?grant_type=password', { email, password }, { adult: false });
    this.session = data;
    return this.dashboard();
  }
  async signup({ email, password, name, role, school }) {
    return this.request('/auth/v1/signup', { email, password, data: { display_name: name, adult_role: role, school_name: school || '' } }, { adult: false });
  }
  async recover(email) {
    return this.request('/auth/v1/recover', { email, redirect_to: new URL('./', location.href).href + '#nova-senha' }, { adult: false });
  }
  async resetPassword(password) {
    await this.request('/auth/v1/user', { password }, { method: 'PUT' });
    await this.logout();
  }
  async logout() {
    try { if (this.session) await this.request('/auth/v1/logout', {}); } finally { this.session = null; }
  }
  rpc(name, params = {}, options) { return this.request('/rest/v1/rpc/' + name, params, options); }
  dashboard() { return this.rpc('dashboard_data'); }
  createChild(name, avatar) { return this.rpc('create_child', { p_name: name, p_avatar: avatar }); }
  createInvite() { return this.rpc('create_invite'); }
  previewInvite(code) { return this.rpc('preview_invite', { p_code: code }); }
  acceptInvite(code, child) { return this.rpc('accept_invite', { p_code: code, p_child: child }); }
  revokeGrant(id) { return this.rpc('revoke_grant', { p_grant: id }); }
  startChild(id) { return this.rpc('start_child_session', { p_child: id }); }
  childStatus(token) { return this.rpc('child_status', { p_token: token }, { adult: false }); }
  complete(token, activity) { return this.rpc('complete_activity', { p_token: token, p_activity: activity }, { adult: false }); }
  endChild(token) { return this.rpc('end_child_session', { p_token: token }, { adult: false }); }
}
