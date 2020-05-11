const apiSideBarRelative = require('./api-sidebar-relative.json');

module.exports = {
  locales: {
      '/': {
      lang: 'en-US',
      title: 'Portablegabi',
      description: 'Anonymous credentials'
      },
  },
  themeConfig: {
      repo: 'kiltprotocol/portablegabi',
      docsDir: 'docs',
      docsBranch: 'master',
      editLinks: true,
      sidebarDepth: 2,
      sidebar: {
        '/api/': apiSideBarRelative,
        '/tutorial/': [
          '0a_introduction.md',
          '1_getting_started.md',
          '2_attestation.md',
          '3_verification.md',
          '4_revocation.md',
          '5_with_chain.md',
          '6_development.md',
        ],
      },
      locales: {
        '/': {
          label: 'English',
          selectText: 'Languages',
          lastUpdated: 'Last Updated',
          editLinkText: 'Edit this page on GitHub',
          nav: [
          {
              text: 'API',
              link: '/api/'
          },
          {
              text: 'Examples',
              link: '/examples/'
          },
        ],
      },
    }
  }
}