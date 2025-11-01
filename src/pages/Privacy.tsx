import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LegalPageTemplate } from '@/components/LegalPageTemplate';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <LegalPageTemplate
      title={t('privacy.title')}
      icon={<Shield className="w-5 h-5 text-primary-foreground" />}
      content={
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.overview.title')}</h2>
            <p className="mb-4">{t('privacy.overview.content')}</p>
            <p>{t('privacy.overview.responsibility')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.dataCollection.title')}</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.dataCollection.types.title')}</h3>
            <p className="mb-4">{t('privacy.dataCollection.types.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>{t('privacy.dataCollection.types.personal')}</li>
              <li>{t('privacy.dataCollection.types.usage')}</li>
              <li>{t('privacy.dataCollection.types.technical')}</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.dataCollection.purpose.title')}</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.dataCollection.purpose.service')}</li>
              <li>{t('privacy.dataCollection.purpose.communication')}</li>
              <li>{t('privacy.dataCollection.purpose.improvement')}</li>
              <li>{t('privacy.dataCollection.purpose.legal')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.dataUsage.title')}</h2>
            <p className="mb-4">{t('privacy.dataUsage.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.dataUsage.sharing.title')}</h3>
            <p className="mb-4">{t('privacy.dataUsage.sharing.content')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.dataUsage.sharing.providers')}</li>
              <li>{t('privacy.dataUsage.sharing.legal')}</li>
              <li>{t('privacy.dataUsage.sharing.business')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.cookies.title')}</h2>
            <p className="mb-4">{t('privacy.cookies.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.cookies.types.title')}</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.cookies.types.essential')}</li>
              <li>{t('privacy.cookies.types.functional')}</li>
              <li>{t('privacy.cookies.types.analytics')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.security.title')}</h2>
            <p className="mb-4">{t('privacy.security.content')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.security.encryption')}</li>
              <li>{t('privacy.security.access')}</li>
              <li>{t('privacy.security.regular')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.rights.title')}</h2>
            <p className="mb-4">{t('privacy.rights.intro')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.rights.access')}</li>
              <li>{t('privacy.rights.correction')}</li>
              <li>{t('privacy.rights.deletion')}</li>
              <li>{t('privacy.rights.restriction')}</li>
              <li>{t('privacy.rights.objection')}</li>
              <li>{t('privacy.rights.portability')}</li>
              <li>{t('privacy.rights.complaint')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.retention.title')}</h2>
            <p className="mb-4">{t('privacy.retention.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.changes.title')}</h2>
            <p className="mb-4">{t('privacy.changes.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.contact.title')}</h2>
            <p className="mb-4">{t('privacy.contact.content')}</p>
            <p>
              <strong>{t('privacy.contact.email')}</strong>: contact@sportify.com
            </p>
          </section>

          <section className="border-t pt-6 mt-6">
            <p className="text-sm text-muted-foreground">
              {t('privacy.lastUpdated')}: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      }
    />
  );
}

