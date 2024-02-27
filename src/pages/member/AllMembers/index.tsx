import SearchBar from "@/components/SearchBar";
import { Spinner } from "@/components/Spinner";
import UserCard from "@/components/UserCard";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import Member from "@/types/member";
import React from "react";
import { useEffect } from "react";

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

const reducer = (state: typeof initialState, action: { type: ActionType, payload }) => {
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

export default function AllMembers() {
  const { setError } = React.useContext(ErrorContext);
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const {
    membersList,
    searchTerm,
    selectedCategory,
    loading,
  } = state;


  useEffect(() => {
    const membersEndpoint = "/user";

    API.get(membersEndpoint)
      .then((membersResponse) => {
        dispatch({ type: ActionType.SetMemberList, payload: membersResponse.data.data });
        dispatch({ type: ActionType.SetLoading, payload: false });
      })
      .catch((error) => {
        setError(error);
        dispatch({ type: ActionType.SetLoading, payload: false });
      });
  }, []);

  //filter members based on search term
  const filteredMembers = membersList.filter((member) => {
    const category = member[selectedCategory.toLowerCase()];
    const categoryValue = category ? category.toString().toLowerCase() : "";
    return categoryValue.includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="flex w-full h-full justify-center items-center"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-semibold text-center">All Members</h1>
      <p className="text-lg text-center mt-4 mb-10">
        List of all the members of the DTU Times team.
      </p>
      <div className="px-3">
        <SearchBar
          searchTerm={searchTerm}
          onSearch={(value) => dispatch({ type: ActionType.SetSearchTerm, payload: value })}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(value) => dispatch({ type: ActionType.SetSelectedCategory, payload: value })}
        />
      </div>
      
      <div className="w-full  gap-4 flex-wrap flex justify-center items-center">
        {filteredMembers.map((member) => (
          <div key={member.id}>
            <UserCard name={member.name} role={member.role} email={member.email} avatar={member.id} />
          </div>))}
      </div>
    </div>
  );
}
