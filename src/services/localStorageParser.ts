import Permission from "@/commonlib/types/permissions";
import {
  GrantedPermissions,
  IUser,
} from "@/commonlib/types/frontend/contextTypes";

export const getUserFromStorage = () => {
  const data = localStorage.getItem("user");
  if (!data) {
    return null;
  }
  try {
    const user = JSON.parse(data);
    return getUserFromJSON(user);
  } catch (e) {
    localStorage.clear();
    console.error(e);
    return null;
  }
};

export const getTokenFromStorage = () => {
  const token = localStorage.getItem("token");
  if (token) return token;
  localStorage.clear();
  return null;
};

export const getUserFromJSON = (user_data) => {
  if (!user_data) {
    return null;
  }

  const user: IUser = {
    name: user_data.name,
    email: user_data.email,
    id: user_data.id,
    bio: user_data.bio,
    role: user_data.role,
    permission: user_data.permission,
    is_superuser: user_data.is_superuser,
    created_at: user_data.created_at,
    team_role: user_data.team_role,
  };

  const permissions = (
    user_data.is_superuser ? "*" : (user_data.permission as Permission[])
  ) as GrantedPermissions;
  if (user.name && user.email && user.id && user.role) {
    return { user: user, permissions: permissions };
  } else {
    return null;
  }
};
