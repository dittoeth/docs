import { defineConfig, type DefaultTheme } from "vitepress";

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

    sidebar: sidebar(),

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
    // 'Technical/contracts.md': 'contracts.md',
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
          text: "FAQ",
          link: "/faq",
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

    {
      text: "Technical",
      items: [
        { text: "Contracts", link: "/technical/contracts" },
        {
          text: "Concepts",
          link: "/technical/concepts",
        },
        {
          text: "System Lifecycle",
          link: "/technical/lifecycle",
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
          text: "Black Swan",
          link: "/technical/blackswan",
        },
        {
          text: "Misc",
          link: "/technical/misc",
        },
      ],
    },
  ];
}
