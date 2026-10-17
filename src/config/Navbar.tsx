export interface NavItem {
  label: string;
  href: string;
  hideOnMobile?: boolean;
}

export const navbarConfig = {
  logo: {
    src: '/assets/samim-avatar.jpg',
    alt: 'Samim Reza',
    width: 100,
    height: 100,
  },
  navItems: [
    {
      label: 'Work',
      href: '/work-experience',
    },
    {
      label: 'Projects',
      href: '/projects',
    },
    {
      label: 'Research',
      href: '/#research',
      hideOnMobile: true,
    },
    {
      label: 'Chat',
      href: '/chat',
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ] as NavItem[],
};
