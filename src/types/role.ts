import Permission from "./permissions";

export interface Role {
    role_id: string;
    role_name: string;
    permissions: Permission[];
}