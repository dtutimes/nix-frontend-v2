import { PermissionProtector } from "@/components/PermissionProtector";
import { Spinner } from "@/components/Spinner";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import Member from "@/types/member";
import Permission from "@/types/permissions";
import React from "react";
import { toast } from "react-toastify";

const categories = ["Name", "Role", "Email"];

const initialState = {
  membersList: [] as Member[],
  searchTerm: "",
  selectedCategory: categories[0].toLowerCase(),
  loading: true,
};

const enum ActionType {
  SetMemberList,
  SetSearchTerm,
  SetSelectedCategory,
  SetLoading,
}

const reducer = (
  state: typeof initialState,
  action: { type: ActionType; payload },
) => {
  const updatedData = { ...state };
  switch (action.type) {
    //underscore convention from react docs
    case ActionType.SetMemberList:
      updatedData.membersList = action.payload;
      break;
    case ActionType.SetSearchTerm:
      updatedData.searchTerm = action.payload;
      break;
    case ActionType.SetSelectedCategory:
      updatedData.selectedCategory = action.payload;
      break;
    case ActionType.SetLoading:
      updatedData.loading = action.payload;
      break;
    default:
      return updatedData;
  }
  return updatedData;
};

export default function AddMember() {
  const { setError } = React.useContext(ErrorContext);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const name = (
      e.currentTarget.elements.namedItem("name") as HTMLInputElement
    ).value;
    const email = (
      e.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;

    API.post("/auth/signup", { name, username: email })
      .then((_) => {
        toast.success("Member added successfully");
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };

  if (loading)
    return (
      <div className="flex flex-grow w-full h-full justify-center items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 shadow rounded">
      <h1>Create Member</h1>
      <p className="text-lg mt-4 mb-10">
        Welcome a new member to the DTU Times team.
      </p>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label
            className="text-2xl font-medium leading-none mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            className="name border p-2 rounded"
            type="text"
            id="roleName"
            placeholder="Enter name"
            name="name"
            pattern="[A-Za-z/s]+"
            title="Only alphabetical role names are allowed"
            required
          />
          <label
            className="text-2xl font-medium leading-none mb-2 mt-6"
            htmlFor="name"
          >
            Email
          </label>
          <input
            className="name border p-2 rounded"
            type="email"
            id="roleName"
            placeholder="Enter email"
            name="email"
            title="Only alphabetical role names are allowed"
            required
          />
          <button
            className="update-button bg-gray-50 text-black hover:bg-indigo-500 border p-3 rounded text-1xl mt-4"
            type="submit"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
