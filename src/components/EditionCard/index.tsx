import { TagIcon } from "@/assets/TagIcon";
import { IEdition as Edition } from "@/commonlib/types/edition";
import { EditionStatus } from "@/commonlib/types/edition";
import { Link } from "react-router-dom";
import { NixImage } from "../NixImage";

export default function EditionCard({ edition }: { edition: Edition }) {
  // edition cover will be dervied from edition._id only, so no need to pass it as prop
  return (
    <Link
      to={`/edition/update-edition/${edition._id}`}
      // pass state to prevent unnecessary server calls
      state={{ edition }}
    >
      <div
        id="container"
        className="mx-auto bg-gray-50 rounded-md hover:shadow-xl my-4"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="p-2">
            <div className="w-full h-64 mb-4" style={{ minHeight: "200px" }}>
              <NixImage
                alt={`Edition ${edition.edition_id} Cover`}
                className="w-full h-64 object-cover object-center rounded-lg"
                height="400"
                image_id={`edition-${edition.edition_id}`}
                image_type={2}
                thumbnail={true}
                style={{
                  aspectRatio: "600/400",
                  objectFit: "cover",
                }}
                width="600"
              />
            </div>
            <h3 className="text-xl font-bold mb-2 mt-4">
              Edition {edition.edition_id} : {edition.name}
            </h3>
            <span
              className={`px-2 py-1 inline-block rounded-md ${EditionStatus[edition.status]}`}
            >
              <TagIcon className="w-4 h-4 inline max-lg:hidden mr-1 size-min" />
              {EditionStatus[edition.status]}
            </span>
            <p className="text-zinc-500 dark:text-zinc-400 py-2">
              {edition.published_at ? "Published on" : "Last Updated"}
              {": "}
              {new Date(
                edition.published_at || edition.updatedAt,
              ).toDateString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
