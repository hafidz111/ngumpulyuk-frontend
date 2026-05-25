import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  RETURN_AFTER_OUTAGE_KEY,
  checkBackendReady,
  consumeReturnPathAfterOutage,
} from '@/infrastructure/http/health-check';
import { ROUTES } from '@/shared/config/routes';

export function useOutageRecovery() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const retryAfterOutage = useCallback(async () => {
    setChecking(true);
    try {
      const ready = await checkBackendReady();
      if (!ready) {
        toast.error(
          'Layanan masih belum tersedia. Silakan coba lagi dalam beberapa menit.',
        );
        return;
      }
      const destination = consumeReturnPathAfterOutage();
      navigate(destination, { replace: true });
    } catch {
      toast.error(
        'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.',
      );
    } finally {
      setChecking(false);
    }
  }, [navigate]);

  const goHome = useCallback(async () => {
    setChecking(true);
    try {
      const ready = await checkBackendReady();
      if (!ready) {
        toast.error(
          'Layanan masih belum tersedia. Tunggu sebentar lalu coba lagi.',
        );
        return;
      }
      sessionStorage.removeItem(RETURN_AFTER_OUTAGE_KEY);
      navigate(ROUTES.home, { replace: true });
    } catch {
      toast.error(
        'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.',
      );
    } finally {
      setChecking(false);
    }
  }, [navigate]);

  return { checking, retryAfterOutage, goHome };
}
