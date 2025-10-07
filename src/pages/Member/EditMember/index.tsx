import showPassIcon from "@/assets/show-password.png";
import { AvatarImage } from "@/components/AvatarImage";
import MyMultiselect from "@/components/MultiSelect";
import { PermissionProtector } from "@/components/PermissionProtector";
import { Spinner } from "@/components/Spinner";
import { CurrUserCtx } from "@/contexts/current_user";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import { IUser } from "@/commonlib/types/frontend/contextTypes";
import { MainWebsiteRole } from "@/commonlib/types/mainWebsiteRole";
import Permission from "@/commonlib/types/permissions";
import { Role } from "@/commonlib/types/role";
import React, { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

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
  target_websiteRole: MainWebsiteRole;
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
  setMainWebsiteRole,
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
    target_websiteRole: 3,
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
      case ActionType.setMainWebsiteRole:
        console.log("Team", action.payload);
        updatedData.target_websiteRole = action.payload;
        break;

      default:
        return updatedData;
    }
    return updatedData;
  };

  const [state, dispatch] = React.useReducer(reducer, initialState);
  // local state to track file selected by user (so we can show the clear '×' only for newly chosen files)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

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
    loading,
    target_websiteRole,
  } = state;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perform API call to update member info

    const endPoint = "/user/update-user";

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const reqData = {
      target_name: target_name,
      target_email: target_email,
      target_bio: target_bio,
      password: newPassword === "" ? undefined : newPassword,
      target_user_id: id,
    };
    const update_profile_perm = user.permission.includes(
      Permission.UpdateProfile,
    );
    const requestData = {
      ...reqData,
      permission: update_profile_perm
        ? target_selectedPermissions.map((perm) => perm.id)
        : undefined,
      role_id: update_profile_perm ? target_roleId : undefined,
      team_role: update_profile_perm ? target_websiteRole : undefined,
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
        navigate(`/member/member-profile/${id}`); // todo update w pure url
      })
      .catch((e) => setError(e));
  };

  const fetchRoles = () => {
    if (!user.permission.includes(Permission.ReadRole)) return;
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
        dispatch({
          type: ActionType.UpdateProfilePictureLink,
          payload: userData.id,
        });
        dispatch({
          type: ActionType.setMainWebsiteRole,
          payload: userData.team_role,
        });
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

  if (loading)
    return (
      <div className="flex flex-grow w-full h-screen justify-center items-center">
        <Spinner />
      </div>
    );

  const team_roles = Object.keys(MainWebsiteRole)
    .filter((perm) => !isNaN(Number(perm)))
    .map((key) => ({
      name: MainWebsiteRole[key] as MainWebsiteRole,
      id: Number(key),
    }));

  console.log("Team Roles", team_roles);

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 shadow rounded">
      {id !== user.id ? (
        <PermissionProtector
          permission={[Permission.UpdateProfile]}
          fallback={false}
        />
      ) : (
        <></>
      )}
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
            <div className="flex items-center space-x-3">
              <input
                disabled={id !== user.id}
                type="file"
                id="blog-image"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    setSelectedFileName(file.name);
                    dispatch({ type: ActionType.SetProfilePicture, payload: file });
                  } else {
                    setSelectedFileName(null);
                    dispatch({ type: ActionType.UpdateProfilePictureLink, payload: null });
                  }
                }}
                className="border p-2 rounded"
              />
              {/* show filename and clear (×) button when a file/avatar is present (only for owner) */}
              {id === user.id && selectedFileName && (
                <div>
                  <button
                    type="button"
                    aria-label="Remove selected file"
                    title="Remove selected file"
                    onClick={() => {
                      // clear selected filename, state and file input
                      setSelectedFileName(null);
                      dispatch({ type: ActionType.UpdateProfilePictureLink, payload: null });
                      try {
                        const fileInput = document.getElementById(
                          "blog-image",
                        ) as HTMLInputElement | null;
                        if (fileInput) fileInput.value = "";
                      } catch (err) {
                        // ignore
                      }
                    }}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
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
                onClick={() =>
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
                onClick={() =>
                  dispatch({
                    type: ActionType.ToggleShowConfirmPassword,
                    payload: !showConfirmPassword,
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
            {(newPassword !== confirmPassword ||
              (newPassword && !confirmPassword)) && (
              <p className="text-red-500 text-sm">Passwords do not match</p>
            )}
          </div>
        )}
        <PermissionProtector
          permission={[Permission.UpdateProfile]}
          fallback={true}
        >
          <div className="my-2">
            <h1 className="text-2xl text-left font-medium leading-none my-6">
              Update Role and Permissions
            </h1>
            <label className="block text-sm font-semibold mb-2">
              Display Role
            </label>
            <div className="w-1/2">
              <MyMultiselect
                options={team_roles}
                selectedOptions={[team_roles[target_websiteRole]]}
                onSelectionChange={(e) => {
                  dispatch({
                    type: ActionType.setMainWebsiteRole,
                    payload: e[0].id,
                  });
                }}
                isSingleSelect={true}
              />
            </div>
            <PermissionProtector
              permission={[Permission.ReadRole]}
              fallback={true}
            >
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
            </PermissionProtector>
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
          onClick={() => {
            navigate(-1);
          }}
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
