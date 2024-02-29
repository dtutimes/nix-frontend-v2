import React, { useEffect } from "react";
import { CurrentUserCtxType, GrantedPermissions, IUser } from "@/types/contextTypes";
import { getUserFromStorage } from "@/services/localStorageParser";

export const CurrUserCtx = React.createContext<CurrentUserCtxType | null>(null);

const CurrUserCtxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grantedPermissions, setGrantedPermissions] = React.useState<GrantedPermissions>(null);
  const [user, setUserData] = React.useState<IUser>(null);
  const [isReady, setIsReady] = React.useState<boolean>(false);

  const setPermissions = (perms: GrantedPermissions) => {
    setGrantedPermissions(perms);
  };
  const setUser = (user: IUser) => {
    setUserData(user);
    setIsReady(true);
  };

  useEffect(() => {
    const userData = getUserFromStorage();
    if (!userData) {
      // console.error("User data not found in local storage");
      setIsReady(true);
      return;
    }
    const { user, permissions } = userData;
    setUser(user);
    setPermissions(permissions);
    setIsReady(true);
  }, []);

  return (
    <CurrUserCtx.Provider value={{
      user,
      setGrantedPermissions: setPermissions,
      grantedPermissions,
      setUser: setUser,
      ready: isReady,
      setReady: () => { setIsReady(true); }
    }}>
      {children}
    </CurrUserCtx.Provider>
  );
};

export default CurrUserCtxProvider;