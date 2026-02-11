import { AvatarImage } from "@/components/AvatarImage";
import { PermissionProtector } from "@/components/PermissionProtector";
import { Spinner } from "@/components/Spinner";
import { CurrUserCtx } from "@/contexts/current_user";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import { IUser } from "@/commonlib/types/frontend/contextTypes";
import { MainWebsiteRole } from "@/types/mainWebsiteRole";
import Permission from "@/commonlib/types/permissions";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

type MemberProfileInitialState = IUser;

export default function MemberProfile() {
  const { setError } = React.useContext(ErrorContext);
  const { user } = useContext(CurrUserCtx);
  const navigate = useNavigate();

  const { id } = useParams() || user;
  const [userDetails, setUserDetails] =
    useState<MemberProfileInitialState>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    if (id && id !== user.id) {
      const userDetailsEndpoint = `/user/get-user/${id}`;
      API.get(userDetailsEndpoint)
        .then((response) => {
          const userData = response.data.data;
          setUserDetails(userData);
        })
        .catch((error) => {
          setError(error);
        });
    } else {
      setUserDetails(user);
    }
  }, []);

  const handleDeleteUser = () => {
    if (!userDetails) return;

    const isOwnProfile = userDetails.id === user.id;
    if (isOwnProfile) {
      toast.error("You cannot delete your own account.");
      return;
    }

    setShowDeleteDialog(true);
    setDeleteConfirmation("");
  };

  const confirmDeleteUser = () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }

    API.delete(`/user/delete-user-superuser/${userDetails.id}`)
      .then(() => {
        toast.success("User deleted successfully");
        setShowDeleteDialog(false);
        navigate("/member/all-members/");
      })
      .catch((error) => {
        setShowDeleteDialog(false);
        setError(error);
      });
  };

  if (userDetails === null)
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <Spinner />
      </div>
    );

  const showDeleteButton =
    user.is_superuser &&
    userDetails.id !== user.id &&
    userDetails.is_superuser === false;

  return (
    <div className="relative max-w-4xl mx-auto my-2 md:my-10 p-8 shadow rounded">
      <div className="space-y-6 mt-4">
        <div className="flex justify-between">
          <div className="flex justify-between">
            <div className="flex gap-1 items-center">
              <div className="md:w-36 md:h-36 w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                <AvatarImage
                  className="h-36 w-36"
                  user_id={userDetails.id}
                  thumbnail={true}
                  alt={userDetails.name}
                />
              </div>
              <div className="ms-4">
                <h1 className="text-left md:text-3xl text-2xl font-semibold text-gray-800 font-sans">
                  {userDetails.name}
                </h1>
                <span className="text-left text-gray-600 md:text-md text-xs">
                  {userDetails.role}
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 m-8 flex flex-col items-end gap-2">
              {userDetails.id === user.id ? (
                <Link
                  to={`/member/edit-details/${userDetails.id}/`}
                  className="bg-blue-500 md:text-md text-sm w-[100px] text-white p-2 rounded hover:bg-green-500 text-center"
                >
                  Edit Info
                </Link>
              ) : (
                <PermissionProtector
                  permission={[Permission.UpdateProfile]}
                  fallback={true}
                >
                  <Link
                    to={`/member/edit-details/${userDetails.id}/`}
                    className="bg-blue-500 md:text-md text-sm w-[100px] text-white p-2 rounded hover:bg-green-500 text-center"
                  >
                    Edit Info
                  </Link>
                </PermissionProtector>
              )}
              {showDeleteButton && (
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="bg-red-500 md:text-md text-sm w-[100px] text-white p-2 rounded hover:bg-red-600 text-center"
                >
                  Delete User
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="mb-6 font-normal text-gray-600 text-lg break-words">
          {userDetails.bio || "No bio available"}
        </p>
        <hr className="border-t border-gray-300 mt-6 mb-6 w-full" />

        <ul className="mb-6">
          <li className="mb-2">
            <span className="text-gray-600 font-semibold">Email :</span>
            <span className="text-gray-600 ml-1">{userDetails.email}</span>
          </li>
          <li className="mb-2">
            <span className="text-gray-600 font-semibold">Joined on :</span>
            <span className="text-gray-600 ml-1">
              {new Date(userDetails.created_at).toDateString()}
            </span>
          </li>
          <li className="mb-2">
            <span className="text-gray-600 font-semibold">Display Role :</span>
            <span className="text-gray-600 ml-1">
              {MainWebsiteRole[userDetails.team_role]}
            </span>
          </li>
          <li className="mb-2">
            <span className="text-gray-600 font-semibold">Is superuser :</span>
            <span className="text-gray-600 ml-1">
              {userDetails.is_superuser ? "Yes" : "No"}
            </span>
          </li>
        </ul>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete User</h2>
            <p className="text-gray-700 mb-2">
              This action will permanently delete{" "}
              <span className="font-semibold">{userDetails.name}</span>'s
              account.
            </p>
            <p className="text-gray-700 mb-4">
              To confirm, please type <span className="font-semibold">DELETE</span>{" "} below.
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="border border-black/30 p-2 rounded w-full mb-4"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation("");
                }}
                className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
