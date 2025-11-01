import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LegalPageTemplate } from '@/components/LegalPageTemplate';

export default function Imprint() {
  const { t } = useTranslation();

  return (
    <LegalPageTemplate
      title={t('imprint.title')}
      icon={<Building2 className="w-5 h-5 text-primary-foreground" />}
      content={
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.responsibility.title')}</h2>
            <div className="space-y-2">
              <p>
                <strong>{t('imprint.responsibility.name')}</strong>: Leon Stadler
              </p>
              <p>
                <strong>{t('imprint.responsibility.address')}</strong>
              </p>
              <p className="pl-4">
                Musterstraße 123<br />
                12345 Musterstadt<br />
                Deutschland
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.contact.title')}</h2>
            <div className="space-y-2">
              <p>
                <strong>{t('imprint.contact.email')}</strong>: contact@sportify.com
              </p>
              <p>
                <strong>{t('imprint.contact.phone')}</strong>: +49 (0) 123 456 789
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.disclaimer.title')}</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('imprint.disclaimer.content.title')}</h3>
            <p className="mb-4">{t('imprint.disclaimer.content.intro')}</p>
            <p className="mb-4">{t('imprint.disclaimer.content.responsibility')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('imprint.disclaimer.links.title')}</h3>
            <p className="mb-4">{t('imprint.disclaimer.links.intro')}</p>
            <p className="mb-4">{t('imprint.disclaimer.links.responsibility')}</p>
            <p>{t('imprint.disclaimer.links.investigation')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.copyright.title')}</h2>
            <p className="mb-4">{t('imprint.copyright.content')}</p>
            <p>{t('imprint.copyright.prohibition')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.dataProtection.title')}</h2>
            <p className="mb-4">{t('imprint.dataProtection.content')}</p>
            <p>
              <Link to="/privacy" className="text-primary hover:underline">
                {t('imprint.dataProtection.link')}
              </Link>
            </p>
          </section>

          <section className="border-t pt-6 mt-6">
            <p className="text-sm text-muted-foreground">
              {t('imprint.lastUpdated')}: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      }
    />
  );
}

