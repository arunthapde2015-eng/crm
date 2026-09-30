import { ROLES } from './roles';

// Stand-in for the signed-in user until authentication is wired up.
export const CURRENT_USER = {
  name: 'Anita Deshpande',
  role: ROLES.SUPER_ADMIN,
  designation: 'Director',
  unreadNotificationCount: 20,
};

export const APP_NAME = 'FinSolis';
export const APP_TAGLINE = 'CRM, billing and AMC';
