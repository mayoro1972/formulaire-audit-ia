export function getAppBaseUrl() {
  return new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString();
}

export function buildInviteUrl(inviteToken: string) {
  const appUrl = new URL(getAppBaseUrl());
  appUrl.searchParams.set('invite', inviteToken);
  return appUrl.toString();
}
