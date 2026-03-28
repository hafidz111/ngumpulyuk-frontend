import { useContext } from 'react';

import { AuthContext } from '../context/auth-context';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return ctx;
}
