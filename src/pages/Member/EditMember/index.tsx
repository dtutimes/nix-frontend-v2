/* eslint-disable prettier/prettier */
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/services/API";
import { CurrUserCtx } from "@/contexts/current_user";
import { toast } from "react-toastify";
import showPassIcon from "@/assets/show-password.png";
import React from "react";
import { ErrorContext } from "@/contexts/error";
import { AvatarImage } from "@/components/AvatarImage";
import { IUser } from "@/types/contextTypes";
import MyMultiselect from "@/components/MultiSelect";
import Permission from "@/types/permissions";
import { Role } from "@/types/role";
import { PermissionProtector } from "@/components/PermissionProtector";

interface PermissionItem {
  name: string;
  id: Permission;
}

interface EditMemberState {
  target_name: string;
  target_email: string;
  target_bio: string;
  newPassword: string;
  confirmPassword: string;
  profilePicture: string | null;
  showPassword: boolean;
  showConfirmPassword: boolean;
  target_selectedPermissions: PermissionItem[];
  rolesList: Role[];
  target_roleId: string;
  target_roleName: string;
  loading: boolean;
}

enum ActionType {
  ToggleShowPassword,
  ToggleShowConfirmPassword,
  UpdateName,
  UpdateEmail,
  UpdateBio,
  UpdatePassword,
  UpdateConfirmPassword,
  UpdateProfilePictureLink,
  SetProfilePicture,
  setSelectedPermissions,
  setRoleId,
  setRoleName,
  setRolesList,
  setLoading,
}

export default function EditMember() {
  const navigate = useNavigate();
  const { user, setUser, setGrantedPermissions } = useContext(CurrUserCtx);
  const { setError } = useContext(ErrorContext);
  const toastId = React.useRef(null);
  const { id } = useParams<{ id: string }>();

  const initialState: EditMemberState = {
    target_name: null,
    target_email: "",
    target_bio: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: null,
    showPassword: false,
    showConfirmPassword: false,
    target_selectedPermissions: [],
    target_roleId: "",
    target_roleName: "",
    rolesList: [],
    loading: true,
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

  const handleRoleNameChange = (e) => {
    const roleData = e[0];
    dispatch({
      type: ActionType.setSelectedPermissions,
      payload: roleData.permissions.map((index) => ({
        name: Permission[index],
        id: index,
      })),
    });
    dispatch({ type: ActionType.setRoleId, payload: roleData.id });
    dispatch({ type: ActionType.setRoleName, payload: roleData.name });
  };

  const reducer = (
    state: EditMemberState,
    action: { type: ActionType; payload },
  ) => {
    const updatedData = { ...state };
    switch (action.type) {
      case ActionType.ToggleShowConfirmPassword:
        updatedData.showConfirmPassword = action.payload;
        break;
      case ActionType.ToggleShowPassword:
        updatedData.showPassword = action.payload;
        break;
      case ActionType.UpdateName:
        updatedData.target_name = action.payload;
        break;
      case ActionType.UpdateEmail:
        updatedData.target_email = action.payload;
        break;
      case ActionType.UpdateBio:
        updatedData.target_bio = action.payload;
        break;
      case ActionType.UpdatePassword:
        updatedData.newPassword = action.payload;
        break;

      case ActionType.UpdateConfirmPassword:
        updatedData.confirmPassword = action.payload;
        break;
      case ActionType.UpdateProfilePictureLink:
        updatedData.profilePicture = action.payload;
        break;
      case ActionType.SetProfilePicture:
        {
          const avatar = action.payload as File;
          if (avatar) {
            toastId.current = toast.info("Uploading 0%", { autoClose: false });
            const form = new FormData();
            form.append("avatar", avatar);
            const endpoint = "/images/upload-avatar";
            const requestMethod = "POST";

            API({
              method: requestMethod,
              url: endpoint,
              data: form,
              onUploadProgress: (progressEvent) => {
                const progress = progressEvent.loaded / progressEvent.total;
                const percentCompleted = Math.round(progress * 100);
                console.log(progress);
                toast.update(toastId.current, {
                  render: `Uploading ${percentCompleted}%`,
                  type: "info",
                  progress: progress,
                });
              },
            })
              .then((res) => {
                toast.update(toastId.current, {
                  render: "Uploading complete!",
                  type: "info",
                  progress: 1,
                });
                toast.done(toastId.current);
                toast.success("Image uploaded successfully");
                const image_name = res.data.data.name;
                dispatch({
                  type: ActionType.UpdateProfilePictureLink,
                  payload: image_name,
                });
              })
              .catch((e) => {
                toast.done(toastId.current);
                setError(e);
              })
              .finally(() => (toastId.current = null));
          }
        }
        break;
      case ActionType.setSelectedPermissions:
        updatedData.target_selectedPermissions = action.payload;
        break;
      case ActionType.setRoleId:
        updatedData.target_roleId = action.payload;
        break;
      case ActionType.setRolesList:
        updatedData.rolesList = action.payload;
        break;
      case ActionType.setRoleName:
        updatedData.target_roleName = action.payload;
        break;
      case ActionType.setLoading:
        updatedData.loading = action.payload;
        break;

      default:
        return updatedData;
    }
    return updatedData;
  };

  const [state, dispatch] = React.useReducer(reducer, initialState);

  const {
    target_name,
    target_email,
    target_bio,
    newPassword,
    confirmPassword,
    profilePicture,
    showPassword,
    showConfirmPassword,
    rolesList,
    target_roleId,
    target_roleName,
    target_selectedPermissions,
  } = state;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perform API call to update member info

    const endPoint = "/user/update-user";

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const requestData = {
      target_name: target_name,
      target_email: target_email,
      target_bio: target_bio,
      password: newPassword === "" ? undefined : newPassword,
      target_user_id: id,
      permission: target_selectedPermissions.map((perm) => perm.id),
      role_id: target_roleId,
    };

    API.put(endPoint, requestData)
      .then((response) => {
        toast.success("Successfully updated");
        const new_user = response.data.data.user as IUser;

        if (new_user.id == user.id) {
          localStorage.setItem("user", JSON.stringify(new_user));
          setGrantedPermissions(new_user.permission);
          setUser(new_user);
        }
        navigate("/profile"); // todo update w pure url
      })
      .catch((e) => setError(e));
  };

  const fetchRoles = () => {
    const rolesEndpoint = "/role";

    return API.get(rolesEndpoint).then((rolesResponse) => {
      dispatch({
        type: ActionType.setRolesList,
        payload: rolesResponse.data.data,
      });
    });
  };

  const fetchTargetUser = () => {
    if (id) {
      return API.get(`/user/get-user/${id}`).then((response) => {
        const userData = response.data.data;
        dispatch({ type: ActionType.UpdateName, payload: userData.name });
        dispatch({ type: ActionType.UpdateName, payload: userData.name });
        dispatch({ type: ActionType.UpdateEmail, payload: userData.email });
        dispatch({ type: ActionType.UpdateBio, payload: userData.bio || "" });
        dispatch({
          type: ActionType.setSelectedPermissions,
          payload: userData.permission.map((index) => ({
            name: Permission[index],
            id: index,
          })),
        });
        dispatch({ type: ActionType.setRoleId, payload: userData.role_id });
        dispatch({ type: ActionType.setRoleName, payload: userData.role });
        dispatch({type: ActionType.UpdateProfilePictureLink, payload: userData.id})
      });
    } //TODO handle if no id present
  };

  React.useEffect(() => {
    Promise.all([fetchRoles(), fetchTargetUser()])
      .then(() => {
        dispatch({ type: ActionType.setLoading, payload: false });
      })
      .catch((error) => {
        setError(error);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 shadow rounded">
      <h1 className="text-4xl font-semibold mb-4">Edit Info: {target_name}</h1>
      <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
        <hr className="border-t border-gray-300 mt-6 mb-6 w-full" />
        <div className="space-y-2">
          {/* //todo make this to the right of name and username */}
        {profilePicture ? (
          <div className="flex items-center justify-center ">
            <AvatarImage
              className="h-36 w-36 rounded-full"
              user_id={profilePicture}
              thumbnail={true}
              alt={profilePicture}
            />
            </div>
          ) : (
            <></>
          )}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block font-semibold text-sm mb-2 ">Name</label>
              <input
                disabled={id !== user.id}
                type="name"
                name="name"
                value={target_name}
                onChange={(e) =>
                  dispatch({
                    type: ActionType.UpdateName,
                    payload: e.target.value,
                  })
                }
                placeholder="Name"
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          <div className="w-1/2">
            <label className="block font-semibold text-sm mb-2">
              Email Address
            </label>
            <input
              disabled={id !== user.id}
              type="email"
              name="email"
              value={target_email}
              onChange={(e) =>
                dispatch({
                  type: ActionType.UpdateEmail,
                  payload: e.target.value,
                })
              }
              placeholder="Email Address"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              About You
            </label>
            <textarea
              disabled={id !== user.id}
              name="about"
              value={target_bio}
              onChange={(e) =>
                dispatch({
                  type: ActionType.UpdateBio,
                  payload: e.target.value,
                })
              }
              placeholder="Tell us about yourself!"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Profile picture
            </label>
            <input
              disabled={id !== user.id}
              type="file"
              id="blog-image"
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) =>
                dispatch({
                  type: ActionType.SetProfilePicture,
                  payload: e.target.files[0],
                })
              }
              className="border p-2 rounded"
            />
          </div>
          
        </div>
        {id === user.id && (
          <div className="relative">
            <h1 className="text-2xl text-left mb-4">Update Password</h1>
            <div className="relative w-1/2">
              <label className="block text-sm font-semibold mb-2">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={newPassword}
                onChange={(e) =>
                  dispatch({
                    type: ActionType.UpdatePassword,
                    payload: e.target.value,
                  })
                }
                placeholder="New Password"
                className="border p-2 rounded w-full mb-2"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 pt-4 flex items-center cursor-pointer"
                onClick={(e) =>
                  dispatch({
                    type: ActionType.ToggleShowPassword,
                    payload: !showPassword,
                  })
                }
              >
                <img
                  src={showPassIcon}
                  alt="toggle password visibility"
                  className="w-6 h-6"
                />
              </div>
            </div>
            <div className="relative w-1/2">
              <label className="block text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) =>
                  dispatch({
                    type: ActionType.UpdateConfirmPassword,
                    payload: e.target.value,
                  })
                }
                placeholder="Confirm Password"
                className="border p-2 rounded w-full"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 pt-5 flex items-center cursor-pointer"
                onClick={(e) =>
                  dispatch({
                    type: ActionType.ToggleShowConfirmPassword,
                    payload: !showPassword,
                  })
                }
              >
                <img
                  src={showPassIcon}
                  alt="toggle password visibility"
                  className="w-6 h-6"
                />
              </div>
            </div>
            <small className="block text-xs mt-2 text-slate-500">
              You can enter the same password or update your password.
            </small>
          </div>
        )}
        <PermissionProtector permission={[Permission.UpdateRole]} silent={true}>
          <div className="flex flex-col">
            <h1 className="text-2xl text-left font-medium leading-none my-6">
              Update Role and Permissions
            </h1>
            <div className="my-2">
              <label className="block text-sm font-semibold mb-2">Role</label>
              <div className="w-1/2">
                <MyMultiselect
                  options={rolesList.map((role) => ({
                    name: role.role_name,
                    id: role.role_id,
                    permissions: role.permissions,
                  }))}
                  selectedOptions={[
                    {
                      name: target_roleName,
                      id: target_roleId,
                      permissions: target_selectedPermissions,
                    },
                  ]}
                  onSelectionChange={handleRoleNameChange}
                  isSingleSelect={true}
                />
              </div>
            </div>
            <div className="my-2">
              <label className="block text-sm font-semibold mb-2">
                Permissions
              </label>
              <fieldset className="flex flex-col">
                <MyMultiselect
                  options={Object.keys(Permission)
                    .filter((perm) => !isNaN(Number(perm)))
                    .map((key) => ({ name: Permission[key], id: key }))}
                  selectedOptions={target_selectedPermissions}
                  onSelectionChange={handlePermissionChange}
                  isSingleSelect={false}
                />
              </fieldset>
            </div>
          </div>
        </PermissionProtector>
        <button
          type="button"
          className="bg-gray-200 text-black p-3 rounded hover:bg-indigo-500 hover:text-white mx-2"
          onClick={() => {navigate(-1)}}
        >
          Cancel Update
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white p-3 rounded hover:bg-indigo-500 mx-2"
          onClick={handleSubmit}
        >
          Update Info
        </button>
       
        
      </form>
    </div>
  );
}
