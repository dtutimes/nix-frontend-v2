import API from "@/services/API";

export default function UserCard({ name, email, role, avatar }) {
  return (
    <div id="container" className="mx-auto ">
      <div className="flex flex-col sm:flex-row">
        <div className="p-2">
          <div className="w-60 hover:shadow-xl bg-white px-10 py-8 rounded-lg shadow text-center">
            <div className="mb-3">
              <img
                className="w-2/3 mx-auto rounded-full object-cover"
                src={`${API.getUri()}/images/get-avatar/${avatar}?thumbnail=true`}
                alt={name}
              />
            </div>
            <h2 className="text-xl font-medium text-gray-700">{name}</h2>
            <span className="text-blue-500 block ">{role}</span>
            <div className="text-sm text-gray-500 block mb-5">{email}</div>
            {/** todo: add link to profile */}
            <a
              href="#"
              className="px-4 py-2 bg-blue-500 text-white rounded-full"
            >
              Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
