import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import { Spinner } from "@/components/Spinner";
import UserCard from "@/components/UserCard";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import { Member } from "@/commonlib/types/member";
import React from "react";
import { useEffect } from "react";
import { MEMBERS_PER_PAGE as perPage } from "@/config";

const initialState = {
  membersList: [] as Member[],
  searchTerm: "",
  loading: true,
  currentPage: 1,
};

const enum ActionType {
  SetMemberList,
  SetSearchTerm,
  SetLoading,
  SetCurrentPage,
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
      updatedData.currentPage = 1;
      break;
    case ActionType.SetLoading:
      updatedData.loading = action.payload;
      break;
    case ActionType.SetCurrentPage:
      updatedData.currentPage = action.payload;
      break;
    default:
      return updatedData;
  }
  return updatedData;
};

export default function AllMembers() {
  const { setError } = React.useContext(ErrorContext);
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { membersList, searchTerm, loading } = state;

  useEffect(() => {
    const membersEndpoint = "/user";

    API.get(membersEndpoint)
      .then((membersResponse) => {
        dispatch({
          type: ActionType.SetMemberList,
          payload: membersResponse.data.data,
        });
        dispatch({ type: ActionType.SetLoading, payload: false });
      })
      .catch((error) => {
        setError(error);
        dispatch({ type: ActionType.SetLoading, payload: false });
      });
  }, []);

  //filter members based on search term
  const filteredMembers = membersList.filter((member) => {
    const smallSearchTerm = searchTerm.toLowerCase();
    return (
      member?.name.toLowerCase().includes(smallSearchTerm) ||
      member?.email.toLowerCase().includes(smallSearchTerm) ||
      member?.role.toLowerCase().includes(smallSearchTerm)
    );
  });

  const indexOfLastMember = state.currentPage * perPage;
  const indexOfFirstMember = indexOfLastMember - perPage;
  const paginatedMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember,
  );

  if (loading)
    return (
      <div className="flex flex-grow w-full h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  const handlePageChange = (newPage: number) => {
    dispatch({ type: ActionType.SetCurrentPage, payload: newPage });
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1>All Members</h1>
      <p className="text-lg text-center mt-4 mb-10">
        List of all the members of the DTU Times team.
      </p>
      <div className="px-3">
        <SearchBar
          searchTerm={searchTerm}
          onSearch={(value) =>
            dispatch({ type: ActionType.SetSearchTerm, payload: value })
          }
        />
      </div>

      <div className="w-full  gap-4 flex-wrap flex justify-center items-center">
        {paginatedMembers.map((member) => (
          <div key={member.id}>
            <UserCard
              name={member.name}
              role={member.role}
              email={member.email}
              avatar={member.id}
            />
          </div>
        ))}
      </div>
      <Pagination
        filtered_content={filteredMembers}
        current_page={state.currentPage}
        per_page={perPage}
        handlePageChange={handlePageChange}
      />
    </div>
  );
}
