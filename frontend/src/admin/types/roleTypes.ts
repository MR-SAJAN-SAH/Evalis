export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  userCount?: number;
  permissions: any[];
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string;
}
