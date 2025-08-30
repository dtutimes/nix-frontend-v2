import { AvatarImage } from "@/components/AvatarImage";
import { PermissionProtector } from "@/components/PermissionProtector";
import { Spinner } from "@/components/Spinner";
import { CurrUserCtx } from "@/contexts/current_user";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import { IUser } from "@/commonlib/types/frontend/contextTypes";
// import { MainWebsiteRole } from "@/commonlib/types/mainWebsiteRole";
// Temporary type for build
type MainWebsiteRole = {
  _id: string;
  name: string;
  description?: string;
};
import Permission from "@/commonlib/types/permissions";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type MemberProfileInitialState = IUser;

export default function MemberProfile() {
  const { setError } = React.useContext(ErrorContext);
  const { user } = useContext(CurrUserCtx);

  const { id } = useParams() || user;
  const [userDetails, setUserDetails] =
    useState<MemberProfileInitialState>(null);

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

  if (userDetails === null)
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <Spinner />
      </div>
    );

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
            <div className="absolute top-0 right-0 m-8">
              {userDetails.id === user.id ? (
                <Link
                  to={`/member/edit-details/${userDetails.id}/`}
                  className="bg-blue-500 md:text-md text-sm w-[100px] text-white p-2 rounded hover:bg-green-500"
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
                    className="bg-blue-500 md:text-md text-sm w-[100px] text-white p-2 rounded hover:bg-green-500"
                  >
                    Edit Info
                  </Link>
                </PermissionProtector>
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
    </div>
  );
}
