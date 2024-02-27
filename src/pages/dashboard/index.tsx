import { CurrUserCtx } from "@/contexts/current_user";
import API from "@/services/API";
import React from "react";

const AvatarImage = ({ src, alt, className }) => {
  return <img className={`rounded-full ${className}`} src={src} alt={alt} />;
};

import TimesLogo from "@/assets/dtutimesIcon";
import { Spinner } from "@/components/Spinner";

const uri = API.getUri();

export default function Dashbboard() {
  const { ready, user } = React.useContext(CurrUserCtx);
  if (!ready) return <div className="flex w-full h-full justify-center items-center"><Spinner /></div>;
  return (
    <div className="flex justify-start flex-col xl:flex-row">
      <div className="flex justify-evenly flex-col lg:flex-row">
        <div className="m-6 w-[300px] h-[464px] border-black border-2 bg-gray-800 text-white rounded-xl overflow-hidden grid grid-rows-2">
          <div className="self-start flex flex-col">
            <div className="flex justify-between">
              <TimesLogo className="w-16 h-16" />

              <div className="pt-4 pr-4">
                <div className="text-base">DTU Times</div>
                <div className="text-xs">2024-25</div>
              </div>
            </div>
            <div className="flex mt-16 justify-center">
              <AvatarImage alt={user.name} className="h-36 w-36" src={`${uri}/images/get-avatar/${user.id}?thumbnail=true`} />
            </div>
          </div>
          <div className="bg-black p-6 text-center self-end">
            <div className="text-base pb-2">{user.role}</div>
            <div className="text-lg font-semibold">{user.name}</div>
          </div>
        </div>
        <div className="m-6 w-[300px] h-[464px] bg-id-back bg-cover border-black border-2 text-white rounded-xl overflow-hidden grid grid-rows-2">
          <div className="self-start flex flex-col">
          </div>
          <div className="bg-black bg-opacity-50 text-opacity-100 p-6 text-right self-end pl-14">
            <div className="text-lg font-semibold">{user.bio}</div>
          </div>
        </div>
      </div>
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Hello {user.name},</h1>
        <p className="text-lg mb-4">Welcome to DTU Times!</p>
        <p>Well done on your role as {user.role}!</p>
        <p className="text-sm my-4">This is your Dashboard where you can update your details shared with us! Make sure they are up-to-date as these are your official record available to DTU Times.</p>
      </div>
    </div>
  );
}
