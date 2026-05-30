export function getAppBaseUrl() {
  return new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString();
}

export function buildInviteUrl(inviteToken: string) {
  const appUrl = new URL(getAppBaseUrl());
  appUrl.searchParams.set('invite', inviteToken);
  return appUrl.toString();
}

export function buildProspectSimpleAuditUrl() {
  const defaultEntry = import.meta.env.VITE_DEFAULT_ENTRY?.trim();
  const publicFormUrl = import.meta.env.VITE_PUBLIC_PROSPECT_FORM_URL?.trim();

  if (publicFormUrl) {
    return publicFormUrl;
  }

  if (defaultEntry === 'prospect-simple-audit') {
    return getAppBaseUrl();
  }

  const appUrl = new URL(getAppBaseUrl());
  appUrl.searchParams.set('form', 'prospect-simple-audit');
  return appUrl.toString();
}

export function getPublicProspectSimpleAuditUrl() {
  return buildProspectSimpleAuditUrl();
}
