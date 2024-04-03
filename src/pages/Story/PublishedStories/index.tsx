import { TagIcon } from "@/assets/TagIcon";
import MoreMenu from "@/components/MoreMenu";
import SearchBar from "@/components/SearchBar";
import { Spinner } from "@/components/Spinner";
import Table from "@/components/Table";
import { ErrorContext } from "@/contexts/error";
import BlogCategory from "@/types/blogCategory";
import BlogStatus from "@/types/blogStatus";
import API from "@/services/API";
import { useContext, useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Blog } from "@/types/blog";
import Permission from "@/types/permissions";

interface PublishedStoriesState {
  blogs: Blog[];
  searchTerm: string;
  loading: boolean;
  currentPage: number;
  perPage: number;
}

const initialState: PublishedStoriesState = {
  blogs: [],
  searchTerm: "",
  loading: true,
  currentPage: 1,
  perPage: 9,
};

const enum ActionType {
  SetBlogs,
  SetSearchTerm,
  SetLoading,
  SetCurrentPage,
}

const reducer = (
  state: PublishedStoriesState,
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
    case ActionType.SetCurrentPage:
      updatedData.currentPage = action.payload;
      break;
    default:
      return updatedData;
  }
  return updatedData;
};

const getFilteredBlogs = (blogs, searchTerm, currentPage: number) => {
  return blogs.filter((blog) =>
    blog?.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
};

const tableHeaders = ["Published On", "Author", "Title", "Category", "Status"];

const blogEndpoint = "/blog/published-blogs";

export default function PublishedStories() {
  const navigate = useNavigate();
  const { setError } = useContext(ErrorContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  const { blogs, searchTerm, loading } = state;
  const indexOfLastBlog = state.currentPage * state.perPage;
  const indexOfFirstBlog = indexOfLastBlog - state.perPage;
  const filteredBlogs = getFilteredBlogs(blogs, searchTerm, state.currentPage);
  const paginatedBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  function Pagination() {
    const { currentPage, perPage } = state;
    const totalPages = Math.ceil(filteredBlogs.length / perPage);

    const handlePageChange = (newPage: number) => {
      dispatch({ type: ActionType.SetCurrentPage, payload: newPage });
    };

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages || totalPages === 0;
    const MAX_PAGES_TO_SHOW = 5;
    let startIndex = Math.max(
      1,
      currentPage - Math.floor(MAX_PAGES_TO_SHOW / 2),
    );
    let endIndex = Math.min(
      Math.max(currentPage + Math.floor(MAX_PAGES_TO_SHOW / 2)),
      totalPages,
    );

    if (startIndex < 1) {
      endIndex -= startIndex - 1;
      startIndex = 1;
    }
    if (endIndex > totalPages) {
      startIndex -= endIndex - totalPages;
      endIndex = totalPages;
    }

    const pages = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, index) => startIndex + index,
    );
    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => !isFirstPage && handlePageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={`px-3 py-1 rounded-md border ${
            isFirstPage
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-white text-gray-700"
          }`}
        >
          Previous
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => !isLastPage && handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          className={`px-3 py-1 rounded-md border ${
            isLastPage
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : "bg-white text-gray-700"
          }`}
        >
          Next
        </button>
      </div>
    );
  }

  const handleRead = (blogId) => {
    API.get(`/blog/get-blog/${blogId}`)
      .then((blogResponse) => {
        const blogDetails = blogResponse.data.data;
        navigate(`/story/${blogId}`, { state: { key: blogDetails } });
      })
      .catch((e) => setError(e));
  };

  const handleDelete = (blogId) => {
    const choice = window.confirm(
      "Are you sure you want to delete this story?",
    );
    if (choice) {
      const deleteEndPoint = `/blog/delete-blog/${blogId}`;

      API.delete(deleteEndPoint)
        .then(() => {
          toast.success("Successfully deleted");
          fetchBlogs();
        })
        .catch((e) => setError(e));
      console.debug("story deleted");
    }
  };

  const handleArchive = (blogId) => {
    //archive is same as takedown dw
    const choice = window.confirm(
      "Are you sure you want to archive this story?",
    );
    if (choice) {
      const archiveEndPoint = `/blog/take-down-blog/${blogId}`;

      API.put(archiveEndPoint)
        .then(() => {
          toast.success("Successfully archived");
          fetchBlogs();
        })
        .catch((e) => setError(e));
      console.debug("story archived");
    }
  };

  const fetchBlogs = () => {
    API.get(blogEndpoint)
      .then((blogResponse) => {
        dispatch({
          type: ActionType.SetBlogs,
          payload: blogResponse.data.data,
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
    dispatch({ type: ActionType.SetCurrentPage, payload: 1 });
  }, [searchTerm]);

  if (loading)
    return (
      <div className="flex flex-grow w-full h-screen justify-center items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1>Published Stories</h1>
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
          content={paginatedBlogs.map((blog) => [
            <div key={blog._id} className="max-w-24">
              {new Date(blog.published_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>,
            blog.user.name,
            <Link
              key={`read-${blog._id}`}
              to={`/story/${blog._id}`}
              state={{ blog: blog }}
            >
              {blog.title}
            </Link>,
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
            <MoreMenu
              options={[
                {
                  label: "Read",
                  handler: handleRead,
                  show: true,
                  permissions: [Permission.ReadBlog],
                },
                {
                  label: "Delete",
                  handler: handleDelete,
                  show: true,
                  permissions: [Permission.DeleteBlog],
                },
                {
                  label: "Archive",
                  handler: handleArchive,
                  show: true,
                  permissions: [Permission.DeleteBlog],
                },
              ]}
              blogId={blog._id}
              key={blog._id}
            />,
          ])}
        />
      </main>
      <div className="flex justify-center mt-16 mb-8">
        <Pagination />
      </div>
    </div>
  );
}
