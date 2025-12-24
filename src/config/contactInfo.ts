/**
 * Zentrale Kontaktdaten-Konfiguration für Sportify (Frontend)
 * 
 * Diese Datei enthält alle Kontaktdaten, die an verschiedenen Stellen
 * der Anwendung verwendet werden (Kontaktseite, Impressum, AGBs, Datenschutz, etc.)
 */

/**
 * Kontaktdaten
 */
const getEnvValue = (value?: string) => (value ? value.trim() : '');

const address = {
  street: getEnvValue(import.meta.env.VITE_CONTACT_ADDRESS_STREET),
  postalCode: getEnvValue(import.meta.env.VITE_CONTACT_ADDRESS_POSTAL_CODE),
  city: getEnvValue(import.meta.env.VITE_CONTACT_ADDRESS_CITY),
  country: getEnvValue(import.meta.env.VITE_CONTACT_ADDRESS_COUNTRY),
};

const addressLines = [
  address.street,
  [address.postalCode, address.city].filter(Boolean).join(' ').trim(),
  address.country,
].filter(Boolean);

const addressFull = addressLines.join('\n');
const addressHtml = addressLines.join('<br />\n');
const addressSingleLine = addressLines.join(', ');

export const contactInfo = {
  // E-Mail-Adresse
  email: getEnvValue(import.meta.env.VITE_CONTACT_EMAIL),
  
  // Telefonnummer
  phone: getEnvValue(import.meta.env.VITE_CONTACT_PHONE),
  
  // Adresse
  address: {
    ...address,
    // Vollständige Adresse als mehrzeiliger String
    full: addressFull,
    // Vollständige Adresse als HTML
    fullHtml: addressHtml,
  },
  
  // Name des Verantwortlichen
  responsiblePerson: getEnvValue(import.meta.env.VITE_CONTACT_RESPONSIBLE_PERSON),
  
  // Domain (wird aus ENV genommen, Fallback für Entwicklung)
  get domain(): string {
    return getEnvValue(import.meta.env.VITE_FRONTEND_URL) || 'http://localhost:8080';
  },
  
  // Hosting-Informationen
  hosting: {
    provider: 'Vercel',
    serverLocation: 'Frankfurt',
    domainProvider: 'All Inkl Neue Münchner Medien',
  },
  
  // Datenbank-Informationen
  database: {
    provider: 'neon.tech',
  },
} as const;

/**
 * Formatierte Kontaktdaten für verschiedene Verwendungszwecke
 */
export const formattedContactInfo = {
  // Adresse als einzeiliger String
  addressSingleLine,
  
  // Adresse für Impressum (mehrzeilig)
  addressImprint: contactInfo.address.full,
  
  // Adresse für HTML (mit <br />)
  addressHtml: contactInfo.address.fullHtml,
} as const;
