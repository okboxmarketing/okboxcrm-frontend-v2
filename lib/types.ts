export interface Contact {
  id: string,
  pictureUrl: string,
  name: string,
  remoteJid: string,
  phone: string,
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  Product: {
    name: string;
  };
}

export interface Sale {
  id: string;
  ticketId: number;
  totalAmount: number;
  createdAt: string;
  Ticket: {
    Contact: {
      name: string;
      phone: string;
    };
    Responsible: {
      name: string;
    };
  };
  SaleItems: SaleItem[];
}

export interface Company {
  id: string;
  name: string;
  advisorId: string | null;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  profileImage?: string;
  Advisor: {
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
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  AdvisorOf?: (Company & { _count?: { users: number } })[];
}

export interface AuthUser {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  companyId: string;
  companyName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  AdvisorOf?: (Company & { _count?: { users: number } })[];
  profileImage?: string;
  companyImage?: string;
}

export interface Response {
  access_token: string;
  message: string;
}

export type TicketStatusEnum = "PENDING" | "OPEN" | "SOLD" | "LOSS";

export interface KanbanStep {
  id: number;
  name: string;
  color: string;
  companyId?: string;
  ticketCount: number;
  tickets: Ticket[];
  position: number;
}

export interface Ticket {
  id: number;
  companyId: string;
  contactId: string;
  responsibleId?: string;
  status: TicketStatusEnum;
  createdAt: string;
  updatedAt: string;
  kanbanStepId: number;
  Contact: {
    id: string;
    name: string;
    phone: string;
    pictureUrl: string | null;
    remoteJid: string
    origin: string
  };
  KanbanStep: {
    id: number;
    name: string;
    color: string;
  }
  Responsible: {
    name: string;
  }
  lastMessage: {
    content: string;
    createdAt: string;
    mediaType: MediaEnum;
    fromMe: boolean;
    read: boolean
  }
}


export enum MediaEnum {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  AUDIO = "AUDIO",
  TEXT = "TEXT",
}

export interface Loss {
  id: string;
  ticketId: number;
  lossReasonId: string;
  observation: string;
  createdAt: string;
  LossReason?: {
    id: string;
    description: string;
    companyId: string;
  };
  Ticket: {
    Contact: {
      name: string;
      phone: string;
    };
    Responsible: {
      name: string;
    };
  };
}

export interface LossReason {
  id: string;
  description: string;
  companyId: string;
  createdAt: string;
}


export interface NewMessagePayload {
  contactId: string;
  data: {
    key: {
      fromMe: boolean;
      id: string;
      remoteJid: string;
    };
    message: {
      conversation: string;
    };
    messageType: string;
    messageTimestamp: number;
    instanceId: string;
    pushName?: string;
    status?: string;
  };
  mediaType: MediaEnum;
  contentUrl?: string;
  content?: string;
}

export interface Message {
  id: string;
  companyId: string;
  fromMe: boolean;
  contactId: string;
  content: string;
  createdAt: string;
  mediaType: MediaEnum;
  status: string;
}
