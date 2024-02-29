import Permission from "./permissions";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  role_id: string;
  bio: string;
  permission: Permission[];
}

export default Member;
