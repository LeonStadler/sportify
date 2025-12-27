import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ObfuscatedText } from '@/components/common/ObfuscatedText';
import { LegalPageTemplate } from '@/components/LegalPageTemplate';
import { contactInfo } from '@/config/contactInfo';

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
                <strong>{t('imprint.responsibility.name')}</strong>: {contactInfo.responsiblePerson}
              </p>
              <p>
                <strong>{t('imprint.responsibility.address')}</strong>
              </p>
              <ObfuscatedText
                value={contactInfo.address.full}
                as="p"
                className="pl-4 whitespace-pre-line"
              />
              <p className="mt-2 text-muted-foreground">
                {t('imprint.responsibility.content')}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.contact.title')}</h2>
            <div className="space-y-2">
              <p className="mb-2">{t('imprint.contact.content')}</p>
              <p>
                <strong>{t('imprint.contact.email')}</strong>:{" "}
                <ObfuscatedText
                  value={contactInfo.email}
                  hrefPrefix="mailto:"
                  className="text-primary hover:underline"
                />
              </p>
              <p>
                <strong>{t('imprint.contact.phone')}</strong>:{" "}
                <ObfuscatedText
                  value={contactInfo.phone}
                  hrefPrefix="tel:"
                  hrefValue={contactInfo.phone.replace(/\s/g, '')}
                  className="text-primary hover:underline"
                />
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.hosting.title')}</h2>
            <p className="mb-4">{t('imprint.hosting.content')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('imprint.hosting.domainProvider')}</li>
              <li>{t('imprint.hosting.hostingProvider')}</li>
              <li>{t('imprint.hosting.serverLocation')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.disclaimer.title')}</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('imprint.disclaimer.content.title')}</h3>
            <p className="mb-4">{t('imprint.disclaimer.content.intro')}</p>
            <p className="mb-4">{t('imprint.disclaimer.content.responsibility')}</p>
            <p className="mb-4">{t('imprint.disclaimer.content.liability')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('imprint.disclaimer.links.title')}</h3>
            <p className="mb-4">{t('imprint.disclaimer.links.intro')}</p>
            <p className="mb-4">{t('imprint.disclaimer.links.responsibility')}</p>
            <p className="mb-4">{t('imprint.disclaimer.links.investigation')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('imprint.disclaimer.userContent.title')}</h3>
            <p className="mb-4">{t('imprint.disclaimer.userContent.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('imprint.disclaimer.health.title')}</h3>
            <p className="mb-4">{t('imprint.disclaimer.health.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.copyright.title')}</h2>
            <p className="mb-4">{t('imprint.copyright.content')}</p>
            <p className="mb-4">{t('imprint.copyright.prohibition')}</p>
            <p>{t('imprint.copyright.violation')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('imprint.dataProtection.title')}</h2>
            <p className="mb-4">{t('imprint.dataProtection.content')}</p>
            <p className="mb-4">{t('imprint.dataProtection.noTracking')}</p>
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
