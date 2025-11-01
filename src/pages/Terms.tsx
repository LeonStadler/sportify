import { Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LegalPageTemplate } from '@/components/LegalPageTemplate';

export default function Terms() {
  const { t } = useTranslation();

  return (
    <LegalPageTemplate
      title={t('terms.title')}
      icon={<Scale className="w-5 h-5 text-primary-foreground" />}
      content={
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.acceptance.title')}</h2>
            <p className="mb-4">{t('terms.acceptance.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.service.title')}</h2>
            <p className="mb-4">{t('terms.service.description')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('terms.service.features.title')}</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.service.features.tracking')}</li>
              <li>{t('terms.service.features.statistics')}</li>
              <li>{t('terms.service.features.community')}</li>
              <li>{t('terms.service.features.scoreboard')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.account.title')}</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('terms.account.registration.title')}</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>{t('terms.account.registration.age')}</li>
              <li>{t('terms.account.registration.accuracy')}</li>
              <li>{t('terms.account.registration.responsibility')}</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('terms.account.security.title')}</h3>
            <p className="mb-4">{t('terms.account.security.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.usage.title')}</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('terms.usage.allowed.title')}</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>{t('terms.usage.allowed.personal')}</li>
              <li>{t('terms.usage.allowed.lawful')}</li>
              <li>{t('terms.usage.allowed.respectful')}</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('terms.usage.prohibited.title')}</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.usage.prohibited.illegal')}</li>
              <li>{t('terms.usage.prohibited.harm')}</li>
              <li>{t('terms.usage.prohibited.unauthorized')}</li>
              <li>{t('terms.usage.prohibited.spam')}</li>
              <li>{t('terms.usage.prohibited.reverse')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.content.title')}</h2>
            <p className="mb-4">{t('terms.content.ownership')}</p>
            <p className="mb-4">{t('terms.content.userContent')}</p>
            <p>{t('terms.content.license')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.liability.title')}</h2>
            <p className="mb-4">{t('terms.liability.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('terms.liability.limitations.title')}</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.liability.limitations.availability')}</li>
              <li>{t('terms.liability.limitations.accuracy')}</li>
              <li>{t('terms.liability.limitations.damages')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.termination.title')}</h2>
            <p className="mb-4">{t('terms.termination.user')}</p>
            <p className="mb-4">{t('terms.termination.provider')}</p>
            <p>{t('terms.termination.effect')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.changes.title')}</h2>
            <p className="mb-4">{t('terms.changes.content')}</p>
            <p>{t('terms.changes.notification')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.governingLaw.title')}</h2>
            <p className="mb-4">{t('terms.governingLaw.content')}</p>
            <p>{t('terms.governingLaw.jurisdiction')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('terms.contact.title')}</h2>
            <p className="mb-4">{t('terms.contact.content')}</p>
            <p>
              <strong>{t('terms.contact.email')}</strong>: contact@sportify.com
            </p>
          </section>

          <section className="border-t pt-6 mt-6">
            <p className="text-sm text-muted-foreground">
              {t('terms.lastUpdated')}: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      }
    />
  );
}

