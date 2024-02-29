import MyMultiselect from "@/components/MultiSelect";
import { Spinner } from "@/components/Spinner";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import Permission from "@/types/permissions";
import { useContext, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { Role } from "@/types/role";
import { PermissionProtector } from "@/components/PermissionProtector";

interface PermissionItem {
  name: string;
  id: Permission;
}

interface NewRoleState {
  roleName: string;
  selectedPermissions: PermissionItem[];
  roleId: string;
  isUpdateMode: boolean;
  rolesList: Role[];
  loading: boolean;
}

const enum ActionType {
  setRoleName,
  setSelectedPermissions,
  setRoleId,
  setIsUpdateMode,
  setRolesList,
  setLoading,
}

const reducer = (
  state: NewRoleState,
  action: { type: ActionType; payload },
) => {
  //console.debug(action); (good way to keep track of state)
  const updatedData = { ...state };
  switch (action.type) {
    //underscore convention from react docs
    case ActionType.setRoleName:
      //TODO check for role name constraints here
      updatedData.roleName = action.payload;
      break;
    case ActionType.setSelectedPermissions:
      updatedData.selectedPermissions = action.payload;
      break;
    case ActionType.setRoleId:
      updatedData.roleId = action.payload;
      break;
    case ActionType.setIsUpdateMode:
      updatedData.isUpdateMode = action.payload;
      break;
    case ActionType.setRolesList:
      updatedData.rolesList = action.payload;
      break;
    case ActionType.setLoading:
      updatedData.loading = action.payload;
      break;
    default:
      return updatedData;
  }
  return updatedData;
};

export default function NewRole({ update_page = false }) {
  const { setError } = useContext(ErrorContext);
  const initialState: NewRoleState = {
    roleName: "",
    selectedPermissions: [],
    roleId: "",
    isUpdateMode: update_page,
    rolesList: [],
    loading: true,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    roleName,
    selectedPermissions,
    roleId,
    isUpdateMode,
    rolesList,
    loading,
  } = state;

  //to toggle between update and create mode
  const handleToggleChange = (e) => {
    dispatch({ type: ActionType.setIsUpdateMode, payload: !isUpdateMode });
    dispatch({ type: ActionType.setRoleId, payload: "" });
    dispatch({ type: ActionType.setSelectedPermissions, payload: [] });

    if (!isUpdateMode) {
      //roleIDd needs to be reset when switching back to create mode
      dispatch({ type: ActionType.setRoleId, payload: null });
    }
  };

  const handleRoleNameChange = (e) => {
    const roleData = e[0];
    if (isUpdateMode) {
      dispatch({ type: ActionType.setRoleName, payload: roleData.name });
      dispatch({
        type: ActionType.setSelectedPermissions,
        payload: roleData.permissions.map((index) => ({
          name: Permission[index],
          id: index,
        })),
      });
      dispatch({ type: ActionType.setRoleId, payload: roleData.id });
    } else {
      dispatch({ type: ActionType.setRoleName, payload: e.target.value });
    }
  };

  const handlePermissionChange = (selectedItems) => {
    const selectedPermissionsWithIntIds = selectedItems.map((permission) => ({
      ...permission,
      id: parseInt(permission.id),
    }));
    dispatch({
      type: ActionType.setSelectedPermissions,
      payload: selectedPermissionsWithIntIds,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isUpdateMode) {
      const updateRequest = {
        role_name: roleName,
        role_id: roleId,
        permissions: selectedPermissions.map((perm) => perm.id),
      };

      const updateRoleEndpoint = "/role/update";

      API.post(updateRoleEndpoint, updateRequest)
        .then(() => {
          toast.success("Successfully updated");
          fetchRoles();
        })
        .catch((e) => setError(e));
    } else {
      const createRequest = {
        role_name: roleName,
        permissions: selectedPermissions.map((perm) => perm.id),
      };

      const createRoleEndpoint = "/role/update";

      API.post(createRoleEndpoint, createRequest)
        .then(() => {
          toast.success("Successfully created");
          fetchRoles();
        })
        .catch((e) => setError(e));
    }
  };

  const fetchRoles = () => {
    const rolesEndpoint = "/role";

    API.get(rolesEndpoint)
      .then((rolesResponse) => {
        dispatch({
          type: ActionType.setRolesList,
          payload: rolesResponse.data.data,
        });
        dispatch({ type: ActionType.setLoading, payload: false });
      })
      .catch((error) => {
        setError(error);
        dispatch({ type: ActionType.setLoading, payload: false });
      });
  };

  useEffect(() => {
    fetchRoles();
    //useEffect runs when value of isUpdateMode changes
  }, [isUpdateMode]);

  if (loading)
    return (
      <div className="flex flex-grow w-full h-full justify-center items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 shadow rounded">
      <h1>{isUpdateMode ? "Update" : "Create"} Roles</h1>
      <p className="text-lg mb-8">Change current roles in the organization</p>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isUpdateMode}
          className="sr-only peer"
          onChange={handleToggleChange}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ms-3 text-sm font-medium text-gray-900 ">
          Switch to {isUpdateMode ? "Create Role" : "Update Role"} Mode
        </span>
      </label>

      <form className="space-y-6 mt-4">
        <div className="flex flex-col">
          <label
            className="text-2xl font-medium leading-none mb-2"
            htmlFor="name"
          >
            Name
          </label>
          {isUpdateMode ? (
            <MyMultiselect
              options={rolesList.map((role) => ({
                name: role.role_name,
                id: role.role_id,
                permissions: role.permissions,
              }))}
              selectedOptions={[
                { name: roleName, permissions: selectedPermissions },
              ]}
              onSelectionChange={handleRoleNameChange}
              isSingleSelect={true}
            />
          ) : (
            <input
              className="name border p-2 rounded "
              type="text"
              id="roleName"
              placeholder="Enter role name"
              name="name"
              value={roleName}
              onChange={handleRoleNameChange}
              pattern="[A-Za-z]+"
              title="Only alphabetical role names are allowed"
              required
            />
          )}
        </div>
        <fieldset className="flex flex-col">
          <label className="text-2xl text-black font-medium leading-none mb-2">
            Permissions
          </label>
          <MyMultiselect
            options={Object.keys(Permission)
              .filter((perm) => !isNaN(Number(perm)))
              .map((key) => ({ name: Permission[key], id: key }))}
            selectedOptions={selectedPermissions}
            onSelectionChange={handlePermissionChange}
            isSingleSelect={false}
          />
        </fieldset>
        {/* todo: what's with this type thing? */}
        {isUpdateMode ? (
          <button
            className="update-button bg-gray-50 text-black hover:bg-indigo-500 border p-3 rounded text-1xl"
            // type="update"
            onClick={handleSubmit}
          >
            Update
          </button>
        ) : (
          <button
            className="create-button bg-gray-50 text-black hover:bg-indigo-500 border p-3 rounded text-1xl"
            // type="create"
            onClick={handleSubmit}
          >
            Create
          </button>
        )}
      </form>
    </div>
  );
}
