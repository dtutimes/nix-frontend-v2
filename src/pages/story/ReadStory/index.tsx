import { useContext, useReducer, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import API from "@/services/API";
import { toast } from "react-toastify";
import { ErrorContext } from "@/contexts/error";

import parse from "html-react-parser";

import { Spinner } from "@/components/Spinner";

import { TagIcon } from "@/assets/TagIcon";

import BlogStatus from "@/types/blogStatus";
import { BlogDetails } from "@/types/blog";
import "./index.css";

interface ReadStoryState {
  showDTPicker: boolean;
  selectedDateTime: string;
  image: string;
}

//https://stackoverflow.com/questions/28760254/assign-javascript-date-to-html5-datetime-local-input
const getLocalDateTime = () => {
  const d = new Date();
  const dateTimeLocalValue = new Date(
    d.getTime() - d.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, -5);
  return dateTimeLocalValue;
};

const formatLocalDateTime = (localDateTime) => {
  const fakeUtcTime = new Date(`${localDateTime}Z`);
  const d = new Date(
    fakeUtcTime.getTime() + fakeUtcTime.getTimezoneOffset() * 60000,
  ).toISOString();
  return d;
};

const initialState: ReadStoryState = {
  showDTPicker: false,
  selectedDateTime: getLocalDateTime(),
  image: "",
};

const enum ActionType {
  SetShowDTPicker,
  SetSelectedDateTime,
  SetImage,
}

const reducer = (
  state: ReadStoryState,
  action: { type: ActionType; payload },
) => {
  const updatedData = { ...state };
  switch (action.type) {
    case ActionType.SetShowDTPicker:
      updatedData.showDTPicker = action.payload;
      break;
    case ActionType.SetSelectedDateTime:
      updatedData.selectedDateTime = action.payload;
      break;
    case ActionType.SetImage:
      updatedData.image = action.payload;
      break;
    default:
      return updatedData;
  }
  return updatedData;
};

export default function ReadStory() {
  const location = useLocation();
  const navigate = useNavigate();
  const { blogId } = useParams();
  if (!blogId) {
    navigate("/story/your-stories");
  }
  // todo: make this page pure
  const blog: BlogDetails = location.state?.key;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { setError } = useContext(ErrorContext);

  const { showDTPicker, selectedDateTime, image } = state;

  const handlePublishNow = () => {
    const choice = window.confirm(
      "Are you sure you want to publish this story?",
    );
    if (choice) {
      const publishEndPoint = `/blog/publish-blog/${blog._id}`;

      API.put(publishEndPoint)
        .then(() => {
          toast.success("Successfully published");
          navigate("/story/pending-stories");
        })
        .catch((e) => setError(e));
    }
  };

  const handlePublishLater = () => {
    //TODO: get some datetime picker
    const choice = window.confirm(
      "Are you sure you want to choose this date and time?",
    );
    if (choice) {
      const publishLaterEndPoint = `/blog/approve-blog/${blog._id}`;

      const request = {
        time: formatLocalDateTime(selectedDateTime),
      };

      API.put(publishLaterEndPoint, request)
        .then(() => {
          toast.success("Successfully set publish time");
          navigate("/story/pending-stories");
        })
        .catch((e) => setError(e));
    }
  };

  const handleSaveToDraft = () => {
    const choice = window.confirm(
      "Are you sure you want to save back to draft?",
    );
    if (choice) {
      const publishEndPoint = `/blog/take-down-blog/${blog._id}`;

      API.put(publishEndPoint)
        .then(() => {
          toast.success("Saved back to drafts!");
          navigate("/story/pending-stories");
        })
        .catch((e) => setError(e));
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: ActionType.SetSelectedDateTime, payload: e.target.value });
  };

  const fetchImage = () => {
    if (!blog.cover) {
      return;
    }
    const imageEndPoint = `/images/get/${blog.cover}?thumbnail=1024`;
    API.get(imageEndPoint, { responseType: "arraybuffer" })
      .then((response) => {
        const imageBlob = new Blob([response.data], { type: "image/png" });
        const reader = new FileReader();
        reader.onload = () => {
          const imageDataUrl = reader.result;
          dispatch({ type: ActionType.SetImage, payload: imageDataUrl });
        };
        reader.readAsDataURL(imageBlob);
      })
      .catch(() => {
        const err = Error("Error fetching the image!");
        setError(err);
      });
  };
  useEffect(() => {
    if (!blog) {
      API.get(`/blog/get-blog/${blogId}`)
        .then((blogResponse) => {
          const blogDetails = blogResponse.data.data;
          navigate(`/story/${blogId}`, {
            state: { key: blogDetails },
            replace: true,
          });
        })
        .catch((e) => setError(e));
    } else {
      fetchImage();
    }
  }, [blog]);

  if (!blog) {
    return (
      <div className="flex flex-grow justify-center items-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow round">
      <h1 className="mb-10">{blog.title}</h1>
      <h4 className="m-2 font-semibold text-gray-500">
        Created By {blog.user.name}
        <br />
        Last Updated on{" "}
        {new Date(blog.updatedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}{" "}
      </h4>
      <span
        className={`px-2 py-1 inline-block rounded-md ${
          BlogStatus[blog.status]
        }`}
        key={blog.category_id}
      >
        <TagIcon className="w-4 h-4 inline mr-1 size-min " />
        {BlogStatus[blog.status]}
      </span>
      <div className="m-2 mt-5 break-words">
        <div>
          {" "}
          {blog.cover ? (
            image === "" ? (
              <center>
                <Spinner className="flex justify-center items-center" /> Loading
                Image
              </center>
            ) : (
              <img
                className="object-contain h-3/6 w-3/6"
                src={image}
                alt="Cover Image"
              />
            )
          ) : (
            <>Cover image not uploaded!</>
          )}
        </div>
        <div className="mt-2 mb-2 text-gray-500"> {blog.byliner} </div>
        <div className="text-gray-900 leading-relaxed">
          {" "}
          {parse(blog.body)}{" "}
        </div>
      </div>

      {blog.status === BlogStatus.Pending && (
        <div>
          <button
            onClick={handlePublishNow}
            type="button"
            className="py-1 px-2 me-2 m-1 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
          >
            Publish Now
          </button>
          <button
            onClick={() =>
              dispatch({ type: ActionType.SetShowDTPicker, payload: true })
            }
            type="button"
            className="py-1 px-2 me-2 m-1 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
          >
            Publish Later
          </button>
          <button
            onClick={handleSaveToDraft}
            type="button"
            className="py-1 px-2 me-2 m-1 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
          >
            Save Back to Draft
          </button>

          {showDTPicker && (
            <div className="m-2">
              <label
                htmlFor="datetime"
                className="text-md font-medium text-gray-900 "
              >
                Choose when to publish :
              </label>
              <input
                type="datetime-local"
                id="datetime"
                placeholder="YYYY-MM-DD"
                value={selectedDateTime}
                min={getLocalDateTime()}
                onChange={handleDateTimeChange}
                className="m-2 border rounded-md px-2 py-1"
              />
              <button
                onClick={handlePublishLater}
                type="button"
                className="py-1 px-2 me-2 m-1 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
              >
                Confirm Choice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
