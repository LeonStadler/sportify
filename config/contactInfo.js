/**
 * Zentrale Kontaktdaten-Konfiguration für Sportify
 * 
 * Diese Datei enthält alle Kontaktdaten, die an verschiedenen Stellen
 * der Anwendung verwendet werden (Kontaktseite, Impressum, AGBs, Datenschutz, etc.)
 */

/**
 * Kontaktdaten
 */
export const contactInfo = {
  // E-Mail-Adresse
  email: 'sportify@leon-stadler.com',
  
  // Telefonnummer
  phone: '+49 176 35491384',
  
  // Adresse
  address: {
    street: 'Uferstraße 42',
    postalCode: '88149',
    city: 'Nonnenorn',
    country: 'Deutschland',
    // Vollständige Adresse als mehrzeiliger String
    full: 'Uferstraße 42\n88149 Nonnenorn\nDeutschland',
    // Vollständige Adresse als HTML
    fullHtml: 'Uferstraße 42<br />\n88149 Nonnenorn<br />\nDeutschland',
  },
  
  // Name des Verantwortlichen
  responsiblePerson: 'Leon Stadler',
  
  // Domain (wird aus ENV genommen, Fallback für Entwicklung)
  get domain() {
    return process.env.FRONTEND_URL || 'https://www.vertic-id.com';
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
};

/**
 * Formatierte Kontaktdaten für verschiedene Verwendungszwecke
 */
export const formattedContactInfo = {
  // E-Mail als Link
  emailLink: `mailto:${contactInfo.email}`,
  
  // Telefon als Link
  phoneLink: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
  
  // Adresse als einzeiliger String
  addressSingleLine: `${contactInfo.address.street}, ${contactInfo.address.postalCode} ${contactInfo.address.city}, ${contactInfo.address.country}`,
  
  // Adresse für Impressum (mehrzeilig)
  addressImprint: contactInfo.address.full,
  
  // Adresse für HTML (mit <br />)
  addressHtml: contactInfo.address.fullHtml,
};

