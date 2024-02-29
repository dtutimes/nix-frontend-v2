import { useContext, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

import API from "@/services/API";

import { ErrorContext } from "@/contexts/error";

import SearchBar from "@/components/SearchBar";
import { Spinner } from "@/components/Spinner";
import Table from "@/components/Table";

import { TagIcon } from "@/assets/TagIcon";
import BlogCategory from "@/types/blogCategory";
import BlogStatus from "@/types/blogStatus";
import { Blog } from "@/types/blog";

interface PendingStoriesState {
  blogs: Blog[];
  searchTerm: string;
  loading: boolean;
}

const initialState: PendingStoriesState = {
  blogs: [],
  searchTerm: "",
  loading: true,
};

const enum ActionType {
  SetBlogs,
  SetSearchTerm,
  SetLoading,
}

const blogEndpoint = "/blog";

const reducer = (
  state: PendingStoriesState,
  action: { type: ActionType; payload },
) => {
  const updatedData = { ...state };
  switch (action.type) {
    case ActionType.SetBlogs:
      updatedData.blogs = action.payload;
      break;
    case ActionType.SetSearchTerm:
      updatedData.searchTerm = action.payload;
      break;
    case ActionType.SetLoading:
      updatedData.loading = action.payload;
      break;
    default:
      return updatedData;
  }
  return updatedData;
};

const getFilteredBlogs = (blogs, searchTerm) => {
  return blogs.filter((blog) =>
    blog?.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
};

const tableHeaders = ["Last Updated", "Author", "Title", "Category", "Status"];

export default function PendingStories() {
  const navigate = useNavigate();
  const { setError } = useContext(ErrorContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  const { blogs, searchTerm, loading } = state;

  const handleRead = (blogId) => {
    API.get(`/blog/get-blog/${blogId}`)
      .then((blogResponse) => {
        const blogDetails = blogResponse.data.data;
        navigate(`/story/${blogId}`, { state: { key: blogDetails } });
      })
      .catch((e) => setError(e));
  };

  const fetchBlogs = () => {
    API.get(blogEndpoint)
      .then((blogResponse) => {
        dispatch({
          type: ActionType.SetBlogs,
          payload: blogResponse.data.data.filter(
            (blog) => blog.status == BlogStatus.Pending,
          ),
        });
        dispatch({ type: ActionType.SetLoading, payload: false });
      })
      .catch((error) => {
        setError(error);
        dispatch({ type: ActionType.SetLoading, payload: false });
      });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading)
    return (
      <div className="flex flex-grow w-full h-full justify-center items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1>Pending Stories</h1>
      <div className="px-3 mt-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearch={(value) =>
            dispatch({ type: ActionType.SetSearchTerm, payload: value })
          }
        />
      </div>
      <main className="flex-grow p-6">
        <Table
          headers={tableHeaders}
          content={getFilteredBlogs(blogs, searchTerm).map((blog) => [
            <div key={blog._id} className="max-w-24">
              {new Date(blog.updatedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>,
            blog.user.name,
            blog.title,
            BlogCategory[blog.category_id],
            <span
              // tailwind is compiled to real css, so we can't use dynamic tailwind wale class names
              // alternative fix is to re-export these class names in index.css
              // i'm lazy, so i just did this impl instead
              className={`px-2 py-1 inline-block rounded-md ${
                BlogStatus[blog.status]
              }`}
              key={blog.category_id}
            >
              <TagIcon className="w-4 h-4 inline max-lg:hidden mr-1 size-min " />
              {BlogStatus[blog.status]}
            </span>,
            <div key={`${blog._id}-button`}>
              <button
                onClick={() => handleRead(blog._id)}
                type="button"
                className="py-1 px-2 me-2 m-1 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
              >
                Read Story
              </button>
            </div>,
          ])}
        />
      </main>
    </div>
  );
}
