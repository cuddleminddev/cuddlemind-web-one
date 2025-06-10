export interface Role {
    id: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: any;
    createdAt: Date;
    updatedAt: Date;
    role: Role;
}