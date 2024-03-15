import { defineConfig, type DefaultTheme } from "vitepress";
import markdownItFootnote from "markdown-it-footnote";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "en-US",
  title: "Ditto Docs (WIP)",
  description: "DittoETH protocol docs",
  cleanUrls: true,
  /* prettier-ignore */
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/circle.png' }],
  ],
  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    logo: "circle.png",
    search: {
      provider: "local",
    },
    nav: nav(),

    sidebar: {
      "/technical/": sidebar(),
      "/dao/": sidebar(),
      "/": [
        {
          text: "Overview",
          items: [
            {
              text: "Litepaper",
              link: "/litepaper",
            },
            {
              text: "System Lifecycle",
              link: "/overview/lifecycle",
            },
            {
              text: "Glossary",
              link: "/overview/glossary",
            },
            {
              text: "FAQ",
              link: "/overview/faq",
            },
            {
              text: "Contracts",
              link: "/contracts",
            },
          ],
        },
        {
          text: "Technical",
          items: [
            {
              text: "Concepts",
              link: "/technical/concepts",
            },
          ],
        },
      ],
      "/blog/": [],
    },

    editLink: {
      pattern: "https://github.com/dittoeth/docs/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/dittoeth/docs" },
      { icon: "twitter", link: "https://twitter.com/dittoproj" },
    ],

    // footer: {}
  },
  rewrites: {
    // 'technical/contracts.md': 'contracts.md',
  },
  markdown: {
    config: (md) => {
      md.use(markdownItFootnote);
    },
    math: true,
  },
});

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "Contracts",
      link: "/contracts",
      activeMatch: "/contracts",
    },
    {
      text: "Blog",
      link: "/blog",
      activeMatch: "/blog/",
    },
    {
      text: "Devs",
      link: "/technical/concepts",
      activeMatch: "/technical/",
    },
    {
      text: "Me",
      link: "/me",
    },
    {
      text: "UI",
      link: "https://preview.dittoeth.com",
    },
    {
      text: "Audit",
      link: "https://www.codehawks.com/contests/clm871gl00001mp081mzjdlwc",
    },
  ];
}

function sidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Overview",
      items: [
        {
          text: "Litepaper",
          link: "/litepaper",
        },
        {
          text: "System Lifecycle",
          link: "/overview/lifecycle",
        },
        {
          text: "Glossary",
          link: "/overview/glossary",
        },
        {
          text: "FAQ",
          link: "/overview/faq",
        },
        {
          text: "Contracts",
          link: "/contracts",
        },
      ],
    },
    {
      text: "Technical",
      items: [
        {
          text: "Concepts",
          link: "/technical/concepts",
        },
        {
          text: "Contract Overview",
          link: "/technical/contracts",
        },
        {
          text: "Oracles",
          link: "/technical/oracles",
        },
        {
          text: "Orderbook",
          link: "/technical/ob",
        },
        {
          text: "Yield",
          link: "/technical/yield",
        },
        {
          text: "Exiting a Short",
          link: "/technical/exitshort",
        },
        {
          text: "Liquidating a Short",
          link: "/technical/liquidation",
        },
        {
          text: "Redemptions",
          link: "/technical/redemptions"
        },
        {
          text: "ShortRecord NFT",
          link: "/technical/nft",
        },
        {
          text: "Arbitrage",
          link: "/technical/arbitrage"
        },
        {
          text: "Black Swan",
          link: "/technical/blackswan",
        },
        {
          text: "Misc",
          link: "/technical/misc",
        },
      ],
    },
    {
      text: "DAO",
      items: [
        { text: "Ditto Token", link: "/dao/ditto" },
        { text: "DittoDAO", link: "/dao/governance" },
        {
          text: "Parameters",
          link: "/dao/parameters",
        },
      ],
    },
  ];
}
