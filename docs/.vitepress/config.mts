import { defineConfig, type DefaultTheme } from "vitepress";
import markdownItFootnote from "markdown-it-footnote";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "en-US",
  title: "Ditto",
  description: "DittoETH protocol docs",
  cleanUrls: true,
  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    // logo: { src: '', width: 24, height: 24 },
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
  },
});

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "About Me",
      link: "/me",
    },
    {
      text: "Technical",
      link: "/technical/concepts",
      activeMatch: "/technical/",
    },
    {
      text: "Blog",
      link: "/blog",
      activeMatch: "/blog/",
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
          text: "Contracts",
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
          link: "/technical/margincall",
        },
        {
          text: "ShortRecord NFT",
          link: "/technical/nft",
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
        {
          text: "Parameters",
          link: "/dao/parameters",
        },
      ],
    },
  ];
}
