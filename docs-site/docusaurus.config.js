// Type-checking aus: Module liegen in docs-site/node_modules, IDE löst oft vom Repo-Root auf.
// @ts-nocheck

import { themes as prismThemes } from "prism-react-renderer";

// Basis-URL aus Umgebung (wie FRONTEND_URL im Rest des Projekts), ohne trailing slash
const siteBaseUrl = (process.env.FRONTEND_URL || "https://sportify.leon-stadler.com").replace(
  /\/$/,
  ""
);

const config = {
  title: "Sportify Dokumentation",
  tagline: "Produkt-, API- und Betriebsdokumentation",
  favicon: "img/favicon.svg",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Production URL aus FRONTEND_URL (bis zum Slug)
  url: siteBaseUrl,
  // Serve docs under /docs
  baseUrl: "/docs/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "LeonStadler",
  projectName: "sportify",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "de",
    locales: ["de"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          routeBasePath: "/",
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/docusaurus-social-card.jpg",
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Sportify Docs",
        logo: {
          alt: "Sportify Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "docs",
            position: "left",
            label: "Dokumentation",
          },
          {
            href: "https://github.com/LeonStadler/sportify",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Dokumentation",
            items: [
              {
                label: "Überblick",
                to: "/overview",
              },
              {
                label: "Architektur",
                to: "/architecture",
              },
              {
                label: "API",
                to: "/api",
              },
            ],
          },
          {
            title: "Plattform",
            items: [
              {
                label: "Website",
                href: siteBaseUrl,
              },
              {
                label: "Dokumentation",
                to: "/overview",
              },
              {
                label: "Changelog",
                href: `${siteBaseUrl}/changelog`,
              },
              {
                label: "Repository",
                href: "https://github.com/LeonStadler/sportify",
              },
            ],
          },
          {
            title: "Rechtliches",
            items: [
              {
                label: "Datenschutz",
                href: `${siteBaseUrl}/privacy`,
              },
              {
                label: "AGB",
                href: `${siteBaseUrl}/terms`,
              },
              {
                label: "Impressum",
                href: `${siteBaseUrl}/imprint`,
              },
              {
                label: "Kontakt",
                href: `${siteBaseUrl}/contact`,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Leon Stadler`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
