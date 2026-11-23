// ============================================================
//  CPCON UAE — Camile-compatible lead handoff (/chatbot/js/chatbot.js)
//
//  The on-page assistant is Khalid (React, src/components/Chatbot).
//  This file is the public script path BR/ES/UK/FR already serve.
//  It does not mount a second widget. It posts a lead to
//  POST /api/leads/chatbot/ with the same HMAC form token as the
//  contact form (GET /api/leads/form-token/ → cookie cpcon_ft +
//  body form_token). empresa/company is optional.
//
//  Trailing slashes are required: next.config trailingSlash redirects
//  /api/leads/chatbot → /api/leads/chatbot/ with 308.
// ============================================================

const CRM_PROXY_URL = '/api/leads';

async function cpconFetchFormToken() {
  const res = await fetch('/api/leads/form-token/', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('form-token HTTP ' + res.status);
  const data = await res.json().catch(function () { return null; });
  if (!data || !data.form_token) throw new Error('form-token missing');
  return data.form_token;
}

async function cpconPostChatbotLead(fields) {
  const form_token = await cpconFetchFormToken();
  const res = await fetch(CRM_PROXY_URL + '/chatbot/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(Object.assign({}, fields || {}, { form_token: form_token })),
  });
  const data = await res.json().catch(function () { return null; });
  if (!res.ok) {
    const err = new Error('POST /api/leads/chatbot HTTP ' + res.status);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

if (typeof window !== 'undefined') {
  window.cpconPostChatbotLead = cpconPostChatbotLead;
}
