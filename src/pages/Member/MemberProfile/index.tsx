import API from "@/services/API";
import { useContext, useEffect, useState } from "react";
import { CurrUserCtx } from "@/contexts/current_user";
import { Link, useParams } from "react-router-dom";
import { Spinner } from "@/components/Spinner";
import React from "react";
import { ErrorContext } from "@/contexts/error";
import { AvatarImage } from "@/components/AvatarImage";
import { PermissionProtector } from "@/components/PermissionProtector";
import Permission from "@/types/permissions";

interface MemberProfileInitialState {
  id: string;
  name: string;
  role: string;
  email: string;
  bio: string;
}

const initialState: MemberProfileInitialState = {
  id: null,
  name: "",
  role: "",
  email: "",
  bio: "",
};

export default function MemberProfile() {
  const { setError } = React.useContext(ErrorContext);
  const { ready, user } = useContext(CurrUserCtx);

  const { id } = useParams() || user;
  const [userDetails, setUserDetails] =
    useState<MemberProfileInitialState>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== user.id) {
      const userDetailsEndpoint = `/user/get-user/${id}`;
      API.get(userDetailsEndpoint)
        .then((response) => {
          const userData = response.data.data;
          setUserDetails({
            id: userData.id,
            name: userData.name,
            role: userData.role,
            email: userData.email,
            bio: userData.bio,
          });
          setLoading(false);
        })
        .catch((error) => {
          setError(error);
        });
    } else {
      setUserDetails({
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        bio: user.bio,
      });
      setLoading(false);
    }
  }, []);

  if (loading)
    return (
      <div className="flex w-full h-full justify-center items-center">
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
                  silent={true}
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
            <span className="text-gray-600 font-semibold">Email:</span>
            <span className="text-gray-600 ml-1">{userDetails.email}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
