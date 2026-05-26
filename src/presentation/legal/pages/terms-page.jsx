import { LegalDocumentLayout } from '../components/legal-document-layout';
import { TERMS_OF_SERVICE_SECTIONS } from '@/shared/legal/terms-of-service-content';

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      title='Syarat dan Ketentuan'
      description='Ketentuan penggunaan platform NgumpulYuk untuk event, circle, obrolan, dan layanan Ngumpsky.'
      sections={TERMS_OF_SERVICE_SECTIONS}
    />
  );
}
