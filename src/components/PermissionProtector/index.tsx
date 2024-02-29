import { CurrUserCtx } from "@/contexts/current_user";
import { PermErrCtx } from "@/contexts/permission_error";
import Permissions from "@/types/permissions";
import React, { ReactNode } from "react";
import { Spinner } from "../Spinner";

interface PermissionProtectorProps {
  children?: ReactNode;
  permission?: Permissions[];
  silent?: boolean;
}

export const PermissionProtector: React.FC<PermissionProtectorProps> = ({ children, permission: required_permissions = [], silent = false }) => {
  const { grantedPermissions, ready } = React.useContext(CurrUserCtx);
  const { setFailedPermissions } = React.useContext(PermErrCtx);

  if (!required_permissions || required_permissions?.length === 0 || grantedPermissions === "*") return children;

  if (!ready) return <div className="flex w-full h-full justify-center items-center"><Spinner /></div>;

  if (grantedPermissions && grantedPermissions.length > 0) {
    const failedPerm = (required_permissions).filter((permission) => !grantedPermissions.includes(permission));
    if (failedPerm.length > 0) {
      if (!silent) setFailedPermissions(failedPerm);
      return <></>;
    } else {
      return children;
    }
  } else {
    if (!silent) setFailedPermissions(required_permissions);
    return <></>;
  }
};