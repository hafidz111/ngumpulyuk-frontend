import { LegalDocumentLayout } from '../components/legal-document-layout';
import { PRIVACY_POLICY_SECTIONS } from '@/shared/legal/privacy-policy-content';

export default function PrivacyPage() {
  return (
    <LegalDocumentLayout
      title='Kebijakan Privasi'
      description='Cara kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda sesuai UU PDP dan peraturan terkait.'
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}
