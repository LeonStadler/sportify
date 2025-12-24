import { Shield } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

import { ObfuscatedText } from '@/components/ObfuscatedText';
import { LegalPageTemplate } from '@/components/LegalPageTemplate';
import { contactInfo, formattedContactInfo } from '@/config/contactInfo';

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
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.overview.general.title')}</h3>
            <p className="mb-4">{t('privacy.overview.general.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.overview.dataCollection.title')}</h3>
            <h4 className="text-lg font-semibold mb-2 mt-4">{t('privacy.overview.dataCollection.who.title')}</h4>
            <p className="mb-4">{t('privacy.overview.dataCollection.who.content')}</p>
            <h4 className="text-lg font-semibold mb-2 mt-4">{t('privacy.overview.dataCollection.how.title')}</h4>
            <p className="mb-4">{t('privacy.overview.dataCollection.how.content')}</p>
            <h4 className="text-lg font-semibold mb-2 mt-4">{t('privacy.overview.dataCollection.why.title')}</h4>
            <p className="mb-4">{t('privacy.overview.dataCollection.why.content')}</p>
            <h4 className="text-lg font-semibold mb-2 mt-4">{t('privacy.overview.dataCollection.rights.title')}</h4>
            <p className="mb-4">{t('privacy.overview.dataCollection.rights.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.overview.noAnalysis.title')}</h3>
            <p className="mb-4">{t('privacy.overview.noAnalysis.content')}</p>
            <p className="mb-4">
              <Trans
                i18nKey="privacy.overview.responsibility"
                components={[
                  <ObfuscatedText
                    key="responsible-person"
                    value={contactInfo.responsiblePerson}
                  />,
                  <ObfuscatedText
                    key="address-single-line"
                    value={formattedContactInfo.addressSingleLine}
                  />,
                ]}
              />
            </p>
            <p>{t('privacy.overview.legalBasis')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.hosting.title')}</h2>
            <p className="mb-4">{t('privacy.hosting.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.hosting.allinkl.title')}</h3>
            <p className="mb-4">{t('privacy.hosting.allinkl.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.hosting.vercel.title')}</h3>
            <p className="mb-4">{t('privacy.hosting.vercel.content')}</p>
            <p className="mb-4">{t('privacy.hosting.vercel.provider')}</p>
            <p className="mb-4">{t('privacy.hosting.vercel.processing')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.hosting.avv.title')}</h3>
            <p className="mb-4">{t('privacy.hosting.avv.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.generalInfo.title')}</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.generalInfo.dataProtection.title')}</h3>
            <p className="mb-4">{t('privacy.generalInfo.dataProtection.content')}</p>
            <p className="mb-4">{t('privacy.generalInfo.dataProtection.security')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.generalInfo.responsible.title')}</h3>
            <p className="mb-4">
              <Trans
                i18nKey="privacy.generalInfo.responsible.content"
                components={[
                  <ObfuscatedText
                    key="responsible-person"
                    value={contactInfo.responsiblePerson}
                  />,
                  <ObfuscatedText
                    key="address-single-line"
                    value={formattedContactInfo.addressSingleLine}
                  />,
                  <ObfuscatedText key="phone" value={contactInfo.phone} />,
                  <ObfuscatedText key="email" value={contactInfo.email} />,
                ]}
              />
            </p>
            <p className="mb-4">{t('privacy.generalInfo.responsible.definition')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.generalInfo.retention.title')}</h3>
            <p className="mb-4">{t('privacy.generalInfo.retention.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.generalInfo.legalBasis.title')}</h3>
            <p className="mb-4">{t('privacy.generalInfo.legalBasis.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.generalInfo.recipients.title')}</h3>
            <p className="mb-4">{t('privacy.generalInfo.recipients.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.generalInfo.revocation.title')}</h3>
            <p className="mb-4">{t('privacy.generalInfo.revocation.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.generalInfo.objection.title')}</h3>
            <p className="mb-4">{t('privacy.generalInfo.objection.content')}</p>
            <p className="mb-4">{t('privacy.generalInfo.objection.directMarketing')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.generalInfo.ssl.title')}</h3>
            <p className="mb-4">{t('privacy.generalInfo.ssl.content')}</p>
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
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>{t('privacy.dataCollection.purpose.service')}</li>
              <li>{t('privacy.dataCollection.purpose.communication')}</li>
              <li>{t('privacy.dataCollection.purpose.improvement')}</li>
              <li>{t('privacy.dataCollection.purpose.legal')}</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.dataCollection.noHealthData.title')}</h3>
            <p className="mb-4">{t('privacy.dataCollection.noHealthData.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.cookies.title')}</h2>
            <p className="mb-4">{t('privacy.cookies.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.cookies.types.title')}</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>{t('privacy.cookies.types.essential')}</li>
              <li>{t('privacy.cookies.types.functional')}</li>
              <li>{t('privacy.cookies.types.analytics')}</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.cookies.noTracking.title')}</h3>
            <p className="mb-4">{t('privacy.cookies.noTracking.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.contactForm.title')}</h2>
            <p className="mb-4">{t('privacy.contactForm.content')}</p>
            <p className="mb-4">{t('privacy.contactForm.legalBasis')}</p>
            <p className="mb-4">{t('privacy.contactForm.retention')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.dataUsage.title')}</h2>
            <p className="mb-4">{t('privacy.dataUsage.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.dataUsage.sharing.title')}</h3>
            <p className="mb-4">{t('privacy.dataUsage.sharing.content')}</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>{t('privacy.dataUsage.sharing.providers')}</li>
              <li>{t('privacy.dataUsage.sharing.legal')}</li>
              <li>{t('privacy.dataUsage.sharing.business')}</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.dataUsage.noCommercial.title')}</h3>
            <p className="mb-4">{t('privacy.dataUsage.noCommercial.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.security.title')}</h2>
            <p className="mb-4">{t('privacy.security.content')}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.security.encryption')}</li>
              <li>{t('privacy.security.access')}</li>
              <li>{t('privacy.security.regular')}</li>
              <li>{t('privacy.security.database')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.rights.title')}</h2>
            <p className="mb-4">{t('privacy.rights.intro')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-4">{t('privacy.rights.access.title')}</h3>
            <p className="mb-4">{t('privacy.rights.access.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.rights.correction.title')}</h3>
            <p className="mb-4">{t('privacy.rights.correction.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.rights.deletion.title')}</h3>
            <p className="mb-4">{t('privacy.rights.deletion.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.rights.restriction.title')}</h3>
            <p className="mb-4">{t('privacy.rights.restriction.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.rights.objection.title')}</h3>
            <p className="mb-4">{t('privacy.rights.objection.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.rights.portability.title')}</h3>
            <p className="mb-4">{t('privacy.rights.portability.content')}</p>
            <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.rights.complaint.title')}</h3>
            <p className="mb-4">{t('privacy.rights.complaint.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.retention.title')}</h2>
            <p className="mb-4">{t('privacy.retention.content')}</p>
            <p>{t('privacy.retention.accountDeletion')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.changes.title')}</h2>
            <p className="mb-4">{t('privacy.changes.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.contact.title')}</h2>
            <p className="mb-4">{t('privacy.contact.content')}</p>
            <p>
              <strong>{t('privacy.contact.email')}</strong>:{" "}
              <ObfuscatedText
                value={contactInfo.email}
                hrefPrefix="mailto:"
                className="text-primary hover:underline"
              />
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacy.noForums.title')}</h2>
            <p className="mb-4">{t('privacy.noForums.content')}</p>
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
