export interface NavItem {
  label: string;
  href: string;
}

export const navbarConfig = {
  logo: {
    src: '/assets/luffy_avatar.jpg',
    alt: 'logo',
    width: 100,
    height: 100,
  },
  navItems: [
    {
      label: 'Work',
      href: '/work-experience',
    },
    {
      label: 'Certificates',
      href: '/certificates',
    },
    {
      label: 'Projects',
      href: '/projects',
    },
    {
      label: 'Techs',
      href: '/techs',
    },
    {
      label: 'Achievements',
      href: '/achievements',
    },
  ] as NavItem[],
};
