function envFlag(name, defaultValue = false) {
  const raw = import.meta.env[name];
  if (raw === undefined || raw === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).trim().toLowerCase());
}

export const EMAIL_PASSWORD_REGISTRATION_ENABLED = envFlag(
  'VITE_EMAIL_PASSWORD_REGISTRATION_ENABLED',
  false,
);
