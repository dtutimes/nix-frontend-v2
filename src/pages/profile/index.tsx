import Member from "@/types/member";
import { useReducer } from "react";

const initialState: Member = {
  email: "",
  role: "",
  permission: [],
  bio: "",
  id: "",
  name: "",
  role_id: "",
};

const enum ActionType {
  SetAvatar,
  SetBio,
  DeleteUser,
  UpdateRole,
  SetPermission,
}

const reducer = (state: typeof initialState, action: { type: ActionType, payload }) => {
  const updatedData = { ...state };
  switch (action.type) {
  default:
    return updatedData;
  }
  return updatedData;
};

export default function Profile() {
  const [state, dispatch] = useReducer(reducer, initialState);

}
