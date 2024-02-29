import Permission from "@/types/permissions";
import { AxiosError } from "axios";

export type RequiredPermissions = Permission[] | null;
export type CustomError = AxiosError | Error | null;
export type GrantedPermissions = Permission[] | "*" | null;

export type CurrentUserCtxType = {
  grantedPermissions: GrantedPermissions;
  user: IUser;
  setGrantedPermissions: (permissions: GrantedPermissions) => void;
  setUser: (user: IUser) => void;
  ready: boolean;
  setReady: () => void;
};

export type ErrorCtxType = {
  setError: (error: CustomError) => void;
};

export type PermErrCtxType = {
  failedPermissions: RequiredPermissions;
  setFailedPermissions: (error: RequiredPermissions) => void;
};

export interface IUser {
  name: string;
  email: string;
  id: string;
  bio: string;
  role: string;
  permission: Permission[];
  is_superuser: boolean;
}
