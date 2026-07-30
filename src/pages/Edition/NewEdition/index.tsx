import { PermissionProtector } from "@/components/PermissionProtector";
import { Spinner } from "@/components/Spinner";
import { CurrUserCtx } from "@/contexts/current_user";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import { IEdition as Edition } from "@/commonlib/types/edition";
import { EditionStatus } from "@/commonlib/types/edition";
import Permission from "@/commonlib/types/permissions";
import { FormEvent, useContext, useEffect, useRef, useState } from "react";
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
  const { user } = useContext(CurrUserCtx);
  const { id } = useParams<{ id: string }>();
  const [edition, setEdition] = useState<Edition>(null);
  const toastId = useRef(null);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this edition?")) {
      API.delete(`/edition/delete-edition/${id}`, {
        data: { email: user?.email },
      })
        .then(() => {
          toast.success("Edition deleted successfully!");
          navigate("/edition/all-editions");
        })
        .catch((e) => {
          setError(e);
        });
    }
  };

  type Submitter = EditionStatus | "delete";
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    console.debug("New Edition submit action initiated");
    e.preventDefault();

    const submitter = (
      e.nativeEvent as SubmitEvent
    ).submitter.attributes.getNamedItem("value").value as Submitter;
    if (submitter === "delete") {
      return handleDelete();
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const editionNum = Number(formData.get("edition_id"));
    if (editionNum > 200) {
      toast.error("Edition ID is asserted to be less than 200");
      return;
    }
    const endpoint = id
      ? `/edition/update-edition/${id}`
      : "/edition/create-edition";

    if (id) {
      formData.append("_id", id);
    }

    formData.append("status", EditionStatus[submitter]);

    const data = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => {
        const n = Number(value);
        return isNaN(n) ? [key, value] : [key, n];
      }),
    );

    const image_file = document.getElementById("edition-cover") as HTMLInputElement;

    const requestMethod = id ? "PUT" : "POST";

    // FIRST: Create/update edition to get the correct edition_id
    const data_promise = API({
      method: requestMethod,
      url: endpoint,
      data: data,
    });

    // THEN: If image exists, upload it using the returned edition_id
    if (image_file.files && image_file.files.length !== 0) {
      data_promise
        .then((response) => {
          // Wait for edition creation/update to complete
          const created_edition = response.data.data;

          if (!created_edition?.edition_id) {
            throw new Error("Edition ID not found in response");
          }

          const image = image_file.files[0] as File;
          const imageForm = new FormData();
          imageForm.append("image", image);
          toastId.current = toast.info("Uploading 0%", { autoClose: false });

          // Use edition_id from response - works for both new and updated editions
          return API({
            method: "POST",
            url: `/images/edition-image/${created_edition.edition_id}`,
            data: imageForm,
            params: { thumbnail: "true" },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.loaded / progressEvent.total;
              const percentCompleted = Math.round(progress * 100);
              console.debug(progress);
              toast.update(toastId.current, {
                render: `Uploading ${percentCompleted}%`,
                type: "info",
                progress: progress,
              });
            },
          });
        })
        .then(() => {
          toast.update(toastId.current, {
            render: "Uploading complete!",
            type: "info",
            progress: 1,
          });
          toast.done(toastId.current);
          toast.success("Edition and image saved successfully");
          navigate("/edition/all-editions");
        })
        .catch((error) => {
          if (toastId.current) {
            toast.done(toastId.current);
            toastId.current = null;
          }
          setError(error);
        });
    } else {
      data_promise
        .then(() => {
          toast.success("Edition saved successfully");
          navigate("/edition/all-editions");
        })
        .catch((error) => {
          setError(error);
        });
    }
  };

  useEffect(() => {
    const given_state: Edition = _ed || location.state?.edition;
    if (!given_state && id) {
      console.error("Edition not found");
      API.get(`/edition/get-edition/${id}`)
        .then((res) => {
          setEdition(res.data.data);
        })
        .catch((e) => {
          setError(e);
        });
    } else {
      setEdition(given_state || initial_state);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 shadow rounded">
      <h1>{id ? "Update" : "Create"} Edition</h1>
      <p className="text-lg font-semibold mt-4 mb-8">
        Editions are the essence of DTU Times! Keep them up-to-date
      </p>
      {edition === null ? (
        <Spinner />
      ) : (
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
            <label
              className="text-xl font-medium leading-none mb-2"
              htmlFor="edition-cover"
            >
              Edition Cover Photo
            </label>
            <input
              type="file"
              id="edition-cover"
              name="edition-cover"
              accept="image/png, image/jpeg, image/jpg"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              value={EditionStatus[EditionStatus.Draft]}
              className="bg-gray-200 text-black p-2 rounded hover:bg-indigo-500 hover:text-white"
            >
              {id ? "Update" : "Create"} & Draft
            </button>
            <button
              type="submit"
              value={EditionStatus[EditionStatus.Published]}
              className="bg-green-500 text-white p-2 rounded hover:bg-indigo-500"
            >
              {id ? "Update" : "Create"} & Publish
            </button>
            {id && (
              <PermissionProtector
                permission={[Permission.DeleteEdition]}
                fallback={true}
              >
                <button
                  type="submit"
                  value={"delete"}
                  className="p-2 text-white bg-red-500 rounded hover:bg-indigo-500"
                >
                  Delete Edition
                </button>
              </PermissionProtector>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
