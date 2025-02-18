export interface Contact {
  id: string,
  pictureUrl: string,
  name: string,
  phone: string,
}

export interface Company {
  id: string;
  name: string;
  accessoryId: string | null;
  createdAt: string;
  updatedAt: string;
  Accessory: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  users: {
    id: string;
    name: string;
    email: string;
    companyId: string;
    isActive: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
  }[];
  _count: {
    users: number;
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  userId: string;
  companyId: string;
  userRole: string;
  userName: string;
  userEmail: string;
}

export interface Response {
  access_token: string;
  message: string;
}