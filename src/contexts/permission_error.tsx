import Permission from "@/types/permissions";
import React from "react";
import { PermErrCtxType } from "@/types/contextTypes";

export const PermErrCtx = React.createContext<PermErrCtxType | null>(null);

const PermErrCtxProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [failedPermissions, setCurrentFailedPerms] = React.useState<
    Permission[]
  >([]);

  const setFailedPermissions = (perms: Permission[]) => {
    setCurrentFailedPerms(perms);
  };

  return (
    <PermErrCtx.Provider
      value={{
        failedPermissions,
        setFailedPermissions,
      }}
    >
      {children}
    </PermErrCtx.Provider>
  );
};

export default PermErrCtxProvider;
