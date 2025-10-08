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
import { Link, useParams, useNavigate } from "react-router-dom";

type MemberProfileInitialState = IUser;

export default function MemberProfile() {
  const { setError } = React.useContext(ErrorContext);
  const { user } = useContext(CurrUserCtx);
  const navigate = useNavigate();

  const { id } = useParams() || user;
  const [userDetails, setUserDetails] = useState<MemberProfileInitialState>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const canDeleteUser = user?.is_superuser && userDetails?.id !== user?.id;

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
  }, [id, user]);

  const verifyRoleAndDelete = async () => {
    if (confirmText !== "DELETE") {
      alert("Please type 'DELETE' to confirm");
      return;
    }

    setIsVerifying(true);
    
    try {
      const verificationResponse = await API.get('/user/verify-role');
      
      // Fix the data access path - your backend returns data.data.isAuthorized
      if (!verificationResponse.data.data.isAuthorized) {
        alert('Access denied. You do not have permission to delete users.');
        return;
      }

      setIsVerifying(false);
      setIsDeleting(true);

      const deleteResponse = await API.delete(`/user/delete-user/${userDetails.id}`);
      
      if (deleteResponse.status === 200) {
        setShowDeleteModal(false);
        
        // Show success message
        alert('User deleted successfully!');
        
        // Redirect after a brief delay to show the message
        setTimeout(() => {
          navigate('/member/all-members/');
        }, 1000);
    }
      
    }catch (error: unknown) {
      console.error('Delete operation error:', error);

      if (error instanceof Error) {
        setError(error);
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        // Handle Axios error
        const axiosError = error as { response?: { data?: { message?: string } } };
        const errorMessage = axiosError.response?.data?.message || 'Failed to delete user. Please try again.';
        setError(new Error(errorMessage));
      } else {
        setError(new Error('An unexpected error occurred'));
      }
  } finally {
      setIsVerifying(false);
      setIsDeleting(false);
  }
  };
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setConfirmText("");
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setConfirmText("");
  };

  if (userDetails === null) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="relative max-w-4xl mx-auto my-2 md:my-10 p-8 shadow rounded">
        <div className="space-y-6 mt-4">
          <div className="flex justify-between">
            <div className="flex justify-between">
              <div className="flex gap-1 items-center">
                <div className="md:w-36 md:h-36 w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                  <AvatarImage
                    className="h-36 w-36"
                    user_id={userDetails.id}
                    thumbnail="true"
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
              <div className="absolute top-0 right-0 m-8 flex gap-2">
                {userDetails.id === user.id ? (
                  <Link
                    to={`/member/edit-details/${userDetails.id}/`}
                    className="bg-blue-500 md:text-md text-sm w-[100px] text-center text-white p-2 rounded hover:bg-green-500"
                  >
                    Edit Info
                  </Link>
                ) : (
                  <>
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
                    
                    {canDeleteUser && (
                      <button
                        onClick={handleDeleteClick}
                        className="bg-red-500 md:text-md text-sm w-[100px] text-white p-2 rounded hover:bg-red-600 transition-colors"
                      >
                        Delete User
                      </button>
                    )}
                  </>
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
              <span className="text-gray-600 font-semibold">Email: </span>
              <span className="text-gray-600 ml-1">{userDetails.email}</span>
            </li>
            <li className="mb-2">
              <span className="text-gray-600 font-semibold">Joined on: </span>
              <span className="text-gray-600 ml-1">
                {new Date(userDetails.created_at).toDateString()}
              </span>
            </li>
            <li className="mb-2">
              <span className="text-gray-600 font-semibold">Display Role: </span>
              <span className="text-gray-600 ml-1">
                {MainWebsiteRole[userDetails.team_role]}
              </span>
            </li>
            <li className="mb-2">
              <span className="text-gray-600 font-semibold">Is superuser: </span>
              <span className="text-gray-600 ml-1">
                {userDetails.is_superuser ? "Yes" : "No"}
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Warning - Destructive Action
            </h3>
            <p className="text-gray-700 mb-4">
              You are about to permanently delete the account for{" "}
              <strong>{userDetails.name}</strong> (ID: {userDetails.id}). This action cannot be undone.
            </p>
            <p className="text-gray-700 mb-4">
              Your superuser role will be verified before deletion.
            </p>
            <p className="text-gray-700 mb-4">
              To confirm, type <strong>DELETE</strong> below, then click Final Delete.
            </p>
            
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'DELETE' to confirm"
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isVerifying || isDeleting}
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isVerifying || isDeleting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={verifyRoleAndDelete}
                disabled={isVerifying || isDeleting || confirmText !== "DELETE"}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying Role..." : isDeleting ? "Deleting..." : "Final Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}