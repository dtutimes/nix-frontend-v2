import TimesLogo from "@/assets/dtutimesIcon";
import { AvatarImage } from "@/components/AvatarImage";
import Leaderboard from "@/components/Leaderboard";
import { Spinner } from "@/components/Spinner";
import { CurrUserCtx } from "@/contexts/current_user";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import React from "react";
import { Link } from "react-router-dom";

interface TopUserData {
  _id: string;
  totalPublishedBlogs: number;
  userDetails: {
    name: string;
    email: string;
    bio: string;
  };
}

interface DashboardInitialState {
  topUserData: TopUserData;
  loading: boolean;
}

const initialState: DashboardInitialState = {
  topUserData: {
    _id: "",
    totalPublishedBlogs: 0,
    userDetails: {
      name: "",
      email: "",
      bio: "",
    },
  },
  loading: true,
};

const enum ActionType {
  SetTopUserData,
}

const reducer = (
  state: DashboardInitialState,
  action: { type: ActionType; payload },
) => {
  const updatedData = { ...state };
  switch (action.type) {
    case ActionType.SetTopUserData:
      updatedData.topUserData = action.payload;
      break;
    default:
      return updatedData;
  }
  return updatedData;
};

export default function Dashbboard() {
  const { ready, user } = React.useContext(CurrUserCtx);
  const { setError } = React.useContext(ErrorContext);

  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { topUserData } = state;

  const clippedBio =
    user?.bio?.length > 150 ? `${user.bio.slice(0, 150)}...` : user.bio;
  React.useEffect(() => {
    const topUserEndpoint = "dashboard/top-users";

    API.get(topUserEndpoint)
      .then((response) => {
        dispatch({
          type: ActionType.SetTopUserData,
          payload: response.data.data,
        });
      })
      .catch((error) => {
        setError(error);
      });
  }, []);

  if (!ready)
    return (
      <div className="flex w-full h-full justify-center items-center">
        <Spinner />
      </div>
    );
  return (
    <div>
      <div className="flex justify-start flex-col xl:flex-row mt-8">
        <div className="flex justify-evenly flex-col lg:flex-row">
          <div className="m-6 w-[300px] h-[464px] border-black border-2 bg-gray-700 text-white rounded-xl overflow-hidden grid grid-rows-2">
            <div className="self-start flex flex-col">
              <div className="flex justify-between">
                <TimesLogo className="w-20 h-20 " />

                <div className="pt-4 pr-4">
                  <div className="text-base">DTU Times</div>
                  <div className="text-xs">2024-25</div>
                </div>
              </div>
              <div className="flex mt-6 justify-center">
                <AvatarImage
                  alt={user.name}
                  className="h-48 w-48 rounded-full border-black border-2"
                  user_id={user.id}
                  thumbnail={true}
                />
              </div>
            </div>
            <div className="bg-black p-6 text-center self-end tracking-widest">
              <div className="text-base pb-2">{user.role}</div>
              <div className="text-xl font-semibold">{user.name}</div>
            </div>
          </div>
          <div className="m-6 w-[300px] h-[464px] bg-id-back bg-cover border-black border-2 text-white rounded-xl overflow-hidden grid grid-rows-2">
            <div className="self-start flex flex-col"></div>
            <div className="bg-black bg-opacity-50 text-opacity-100 p-6 text-right self-end pl-14">
              <div className="text-md  font-semibold">{clippedBio}</div>
            </div>
          </div>
        </div>
        <div className="p-8">
          <h1>Hello {user.name},</h1>
          <p className="text-lg mb-4">Welcome to DTU Times!</p>
          <p>Well done on your role as {user.role}!</p>
          <p className="text-sm my-4">
            This is your Dashboard where you can update your details shared with
            us! Make sure they are up-to-date as these are your official record
            available to DTU Times.
          </p>
          <Link
            to={`/member/edit-details/${user.id}`}
            className="bg-blue-500 text-white p-2 rounded hover:bg-green-500"
          >
            Edit Details
          </Link>
          <div className="my-8">
            <div className="text-sm mb-4">
              Not sure where to start? Here is a tour of this portal&apos;s
              functionality :
            </div>
            <Link
              to={"/usage"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white p-2 rounded hover:bg-green-500"
            >
              Tutorial
            </Link>
          </div>
        </div>
      </div>

      <h1 style={{ marginTop: "30px", fontSize: "2rem" }}>Google Analytics</h1>
      <div className="relative pb-[25%] h-0 overflow-hidden">
        <iframe
          title="GA Dashboard"
          src="https://lookerstudio.google.com/embed/reporting/1b512a23-76f6-4a5a-8a41-b8c49fe08aff/page/bX1WF"
          className="absolute top-10 left-10 w-[95%] h-full"
          style={{ border: "0" }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

      <div className="p-8">
        <div className=" my-4">
          <Leaderboard topUsers={topUserData} />
        </div>
      </div>
    </div>
  );
}
