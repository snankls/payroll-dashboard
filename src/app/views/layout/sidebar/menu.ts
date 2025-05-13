import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    label: 'Main',
    isTitle: true
  },
  {
    label: 'Dashboard',
    icon: 'home',
    link: '/dashboard'
  },
  {
    label: 'Companies',
    icon: 'codesandbox',
    link: '/companies',
  },
  {
    label: 'Users',
    icon: 'user',
    link: '/users',
  },
];
