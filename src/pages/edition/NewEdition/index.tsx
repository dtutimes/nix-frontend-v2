import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import { Edition } from "@/types/edition";
import { EditionStatus } from "@/types/editionStatus";
import { useContext } from "react";
import { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const initial_state: Edition = {
  _id: null,
  name: "",
  edition_id: null,
  edition_link: "",
  status: EditionStatus.Draft,
  createdAt: null,
  updatedAt: null,
};

export default function NewEdition({ edition: _ed }: { edition?: Edition }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setError } = useContext(ErrorContext);
  const edition = _ed || location.state?.edition || initial_state;
  const { id } = useParams<{ id: string }>();
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const endpoint = id
      ? `/edition/update-edition/${id}`
      : "/edition/create-edition";

    if (id) {
      formData.append("_id", id);
    }
    const data = Object.fromEntries(formData.entries());
    const requestMethod = id ? "PUT" : "POST";

    API({
      method: requestMethod,
      url: endpoint,
      data: data,
    })
      .then(() => {
        toast.success("Edition saved successfully");
        navigate("/edition/all-editions");
      })
      .catch((error) => {
        setError(error);
      });
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 shadow rounded">
      <h1>{id ? "Update" : "Create"} Edition</h1>
      <p className="text-lg font-semibold mt-4 mb-8">
        Editions are the essence of DTU Times! Keep them up-to-date
      </p>
      <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label
            className="text-xl font-medium leading-none mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            className="name border p-2 rounded mb-4"
            type="text"
            id="edition_name"
            placeholder="Enter edition name"
            name="edition_name"
            aria-placeholder="Edition 23"
            defaultValue={edition.name}
            pattern="[A-Za-z 0-9]+"
            title="Only alphabetical-numeric edition names are allowed"
            required
          />

          <label
            className="text-xl font-medium leading-none mb-2"
            htmlFor="edition_id"
          >
            Edition ID
          </label>
          <input
            className="name border p-2 rounded mb-4"
            type="number"
            id="edition_id"
            placeholder="Enter edition id/number"
            name="edition_id"
            aria-placeholder="23"
            defaultValue={edition.edition_id}
            title="Only numeric edition id allowed"
            required
          />

          <label
            className="text-xl font-medium leading-none mb-2"
            htmlFor="edition_link"
          >
            Edition Link
          </label>
          <input
            className="name border p-2 rounded mb-4"
            type="url"
            id="edition_link"
            placeholder="Enter edition url"
            name="edition_link"
            aria-placeholder="https://dtutimes.com/edition/edition-23.pdf"
            defaultValue={edition.edition_link}
            title="Only numeric edition id allowed"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-gray-200 text-black p-2 rounded hover:bg-indigo-500"
          >
            {id ? "Update" : "Create"}
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded hover:bg-indigo-500"
          >
            {id ? "Update" : "Create"} & Publish
          </button>
        </div>
      </form>
    </div>
  );
}
