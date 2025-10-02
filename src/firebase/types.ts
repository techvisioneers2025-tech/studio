import { User as AuthUser } from 'firebase/auth';

export interface User extends AuthUser {
  preferredLanguage?: string;
}