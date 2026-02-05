// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Sportify Dokumentation",
  tagline: "Produkt-, API- und Betriebsdokumentation",
  favicon: "img/favicon.svg",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://sportify.leon-stadler.com",
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
                href: "https://sportify.leon-stadler.com",
              },
              {
                label: "Dokumentation",
                to: "/overview",
              },
              {
                label: "Changelog",
                href: "https://sportify.leon-stadler.com/changelog",
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
                href: "https://sportify.leon-stadler.com/privacy",
              },
              {
                label: "AGB",
                href: "https://sportify.leon-stadler.com/terms",
              },
              {
                label: "Impressum",
                href: "https://sportify.leon-stadler.com/imprint",
              },
              {
                label: "Kontakt",
                href: "https://sportify.leon-stadler.com/contact",
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
