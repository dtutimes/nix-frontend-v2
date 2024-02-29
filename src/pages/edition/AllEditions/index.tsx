import { Spinner } from "@/components/Spinner";
import Table from "@/components/Table";
import { ErrorContext } from "@/contexts/error";
import API from "@/services/API";
import { Edition } from "@/types/edition";
import { EditionStatus } from "@/types/editionStatus";
import React from "react";
import { Link } from "react-router-dom";

export default function AllEditions() {
  const { setError } = React.useContext(ErrorContext);
  // umm reducer with a single state is just use state!?

  const [editions, setEditions] = React.useState<Edition[]>(null);
  React.useEffect(() => {
    API.get("/edition/")
      .then((response) => {
        setEditions(response.data.data);
      })
      .catch((error) => {
        setError(error);
      });
  }, []);

  if (editions === null) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <Spinner />
      </div>
    );
  }

  const headers = ["name", "ed_id", "_id", "status", "published/updated"];
  return (
    <Table
      headers={headers}
      content={editions.map((edition) => [
        edition.name,
        edition.edition_id,
        <Link
          key={`update-${edition._id}`}
          to={`/edition/update-edition/${edition._id}`}
          state={{ edition: edition }}
        >
          {edition._id}
        </Link>,
        EditionStatus[edition.status],
        edition.published_at
          ? new Date(edition.published_at).toDateString()
          : new Date(edition.updatedAt).toDateString(),
      ])}
    />
  );
}
