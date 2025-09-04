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
import ChevronDownIcon from "@/assets/ChevronDownIcon";
import CheckIcon from "@/assets/CheckIcon";

const initialState = {
  membersList: [] as Member[],
  searchTerm: "",
  loading: true,
  currentPage: 1,
  roleFilter: "all",
  dateSort: "default" as "default" | "newest" | "oldest",
};

const enum ActionType {
  SetMemberList,
  SetSearchTerm,
  SetLoading,
  SetCurrentPage,
  SetRoleFilter,
  SetDateSort,
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
    case ActionType.SetRoleFilter:
      updatedData.roleFilter = action.payload;
      updatedData.currentPage = 1;
      break;
    case ActionType.SetDateSort:
      updatedData.dateSort = action.payload;
      updatedData.currentPage = 1;
      break;
    default:
      return updatedData;
  }
  return updatedData;
};

export default function AllMembers() {
  const { setError } = React.useContext(ErrorContext);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [isRoleOpen, setIsRoleOpen] = React.useState(false);
  const [isDateOpen, setIsDateOpen] = React.useState(false);
  const roleRef = React.useRef<HTMLDivElement>(null);
  const dateRef = React.useRef<HTMLDivElement>(null);

  const { membersList, searchTerm, loading, roleFilter, dateSort } = state;

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

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (isRoleOpen && roleRef.current && !roleRef.current.contains(target)) {
        setIsRoleOpen(false);
      }
      if (isDateOpen && dateRef.current && !dateRef.current.contains(target)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRoleOpen, isDateOpen]);

  const rolesOptions = [
    "all",
    "superhuman",
    "developer",
    "editor",
    "columnist",
    "designer",
    "alumni",
    "illustrator",
    "photographer",
    "coordinator",
    "npc",
  ];

  const filteredMembers = membersList
  .filter((member) => {
    const smallSearchTerm = searchTerm.toLowerCase();
    return (
      member?.name.toLowerCase().includes(smallSearchTerm) ||
      member?.email.toLowerCase().includes(smallSearchTerm) ||
      member?.role.toLowerCase().includes(smallSearchTerm)
    );
  })
  .filter((member) => {
    if (!roleFilter || roleFilter === "all") return true;
    return member?.role?.toLowerCase() === roleFilter.toLowerCase();
  })
  .sort((a, b) => {
    if (dateSort === "default") return 0;
    const aDate = a && (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
    const bDate = b && (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
    if (dateSort === "newest") return bDate - aDate;
    return aDate - bDate;
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
        <div className="w-full flex flex-col sm:flex-row justify-center sm:justify-end gap-3 px-4 mb-4">
          <div className="relative" ref={roleRef}>
            <button
              className={`mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none text-gray-500 ${isRoleOpen && "text-gray-900"} w-full sm:w-auto justify-center sm:justify-start`}
              onClick={() => { setIsRoleOpen((v) => !v); setIsDateOpen(false); }}
            >
                             Role
               <ChevronDownIcon className="h-4 w-4" />
            </button>
            {isRoleOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 z-20 mt-2 w-full sm:w-64 rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="px-4 py-3 text-sm font-semibold">Filter by Role</div>
                <div className="border-t border-gray-100" />
                <div className="py-2">
                  {rolesOptions.map((role) => {
                    const value = role.toLowerCase();
                    const selected = roleFilter === value;
                    return (
                      <button
                        key={role}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 ${selected ? "text-gray-900" : "text-gray-700"}`}
                        onClick={() => {
                          dispatch({ type: ActionType.SetRoleFilter, payload: value });
                          setIsRoleOpen(false);
                        }}
                                             >
                         {selected ? (
                           <CheckIcon className="h-4 w-4 text-blue-600" />
                         ) : (
                           <span className="h-4 w-4" />
                         )}
                         <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

                     <div className="relative" ref={dateRef}>
             <button
               className={`mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none text-gray-500 ${isDateOpen && "text-gray-900"} w-full sm:w-auto justify-center sm:justify-start`}
               onClick={() => { setIsDateOpen((v) => !v); setIsRoleOpen(false); }}
             >
                               Date
                <ChevronDownIcon className="h-4 w-4" />
             </button>
             {isDateOpen && (
               <div className="absolute left-0 sm:left-auto sm:right-0 z-20 mt-2 w-full sm:w-48 rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="px-4 py-3 text-sm font-semibold">Filter by Date</div>
                <div className="border-t border-gray-100" />
                <div className="py-2">
                  {["default", "newest", "oldest"].map((d) => {
                    const selected = dateSort === (d as any);
                    const label = d.charAt(0).toUpperCase() + d.slice(1);
                    return (
                      <button
                        key={d}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 ${selected ? "text-gray-900" : "text-gray-700"}`}
                        onClick={() => {
                          dispatch({ type: ActionType.SetDateSort, payload: d as any });
                          setIsDateOpen(false);
                        }}
                                             >
                         {selected ? (
                           <CheckIcon className="h-4 w-4 text-blue-600" />
                         ) : (
                           <span className="h-4 w-4" />
                         )}
                         <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
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
