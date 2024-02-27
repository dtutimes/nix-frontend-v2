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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Blog } from "@/types/blog";
import Permission from "@/types/permissions";

interface YourStoriesState {
  blogs: Blog[];
  searchTerm: string;
  statusFilters: BlogStatus[];
  loading: boolean;
}

const initialState: YourStoriesState = {
  blogs: [],
  searchTerm: "",
  statusFilters: Object.keys(BlogStatus).map((v) => Number(v)).filter((v) => !isNaN(v)),
  loading: true,
};

const myBlogsEndpoint = "/blog/my-blogs";

const enum ActionType {
  SetBlogs,
  SetSearchTerm,
  SetStatusFilers,
  SetLoading,
}

const reducer = (state: YourStoriesState, action: { type: ActionType, payload }) => {
  const updatedData = { ...state };
  const newStatusFilters = [...updatedData.statusFilters];
  switch (action.type) {
  case ActionType.SetBlogs:
    updatedData.blogs = action.payload;
    break;
  case ActionType.SetSearchTerm:
    updatedData.searchTerm = action.payload;
    break;
  case ActionType.SetStatusFilers:
    //also spread operator creates only a shallow copy so mutable data structures like arrays still
    //refer to their originals. so we need to spread it out again
    //if present in filter, remove. Else, add
    if (newStatusFilters.includes(action.payload)) {
      console.debug(newStatusFilters, action.payload);
      newStatusFilters.splice(newStatusFilters.indexOf(action.payload), 1);
      console.debug(newStatusFilters);
    } else {
      newStatusFilters.push(action.payload);
    }
    updatedData.statusFilters = newStatusFilters;
    break;
  case ActionType.SetLoading:
    updatedData.loading = action.payload;
    break;
  default:
    return updatedData;
  }
  return updatedData;
};

const getFilteredBlogs = (blogs: Blog[], statusFilters: BlogStatus[], searchTerm: string) => {
  return blogs.filter((blog) =>
    statusFilters.includes(blog.status) &&
    blog?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const tableHeaders = ["Last Updated", "Title", "Category", "Status"];


export default function AllStory() {
  const navigate = useNavigate();
  const { setError } = useContext(ErrorContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    blogs,
    searchTerm,
    statusFilters,
    loading,
  } = state;

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
      "Are you sure you want to delete this story?"
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
      "Are you sure you want to archive this story?"
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

  const handleEdit = (blogId) => {
    //TODO edit blog, should open the blog on the new blog view
    console.debug(blogId);
    API.get(`/blog/get-blog/${blogId}`)
      .then((blogResponse) => {
        const blogDetails = blogResponse.data.data;
        navigate("/story/new-story", { state: { key: blogDetails } });
      })
      .catch((e) => setError(e));
    console.debug("story edited");
  };

  const handleSubmit = (blogId) => {
    const choice = window.confirm(
      "Are you sure you want to submit this story for approval?"
    );
    if (choice) {
      API.put(`/blog/submit-for-approval/${blogId}`)
        .then((_) => {
          toast.success("Successfully submitted for approval!");
          fetchBlogs();
        })
        .catch((e) => setError(e));
      console.debug("story submitted");
    }
  };

  const fetchBlogs = () => {
    API.get(myBlogsEndpoint, { data: { userOnly: true } })
      .then((blogResponse) => {
        dispatch({ type: ActionType.SetBlogs, payload: blogResponse.data.data });
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


  if (loading) return <div className="flex justify-center items-center"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-semibold text-center">Your Stories</h1>
      <div className="px-3 mt-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearch={(value) => dispatch({ type: ActionType.SetSearchTerm, payload: value })}
        />
        <div className="flex mt-4 space-x-8">
          {
            Object.keys(BlogStatus)
              .filter((v) => isNaN(Number(v)))
              .map((status) => { return { status, id: BlogStatus[status] }; })
              .map(({ status, id }) => (
                <label key={id} className="ms-2  text-md text-gray-900">
                  <input
                    className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    type="checkbox"
                    checked={statusFilters.includes(id)}
                    onChange={() => dispatch({ type: ActionType.SetStatusFilers, payload: id })}
                  />
                  {status}
                </label>
              ))
          }
        </div>
      </div>
      <main className="flex-grow p-6">
        <Table
          headers={tableHeaders}
          content={getFilteredBlogs(blogs, statusFilters, searchTerm).map(blog => [
            <div key={blog._id} className="max-w-24">{new Date(blog.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</div>,
            blog.title,
            BlogCategory[blog.category_id],
            <span
              // tailwind is compiled to real css, so we can't use dynamic tailwind wale class names
              // alternative fix is to re-export these class names in index.css
              // i'm lazy, so i just did this impl instead
              className={`px-2 py-1 inline-block rounded-md ${BlogStatus[blog.status]}`}
              key={blog.category_id}
            >
              <TagIcon className="w-4 h-4 inline max-lg:hidden mr-1 size-min" />
              {BlogStatus[blog.status]}
            </span>,
            <MoreMenu
              options={[
                { label: "Read", handler: handleRead, show: true, permissions: [Permission.ReadBlog] },
                { label: "Delete", handler: handleDelete, show: blog.status == BlogStatus.Draft, permissions: [Permission.ReadBlog] }, // i dont think a user should need perm to delete their draft
                // i dont think archive should be available in your stories at all because any user shouldnt be able to archive their published stories
                //  { label: "Archive", handler: handleArchive, show: blog.status == BlogStatus.Published, permissions: [Permission.ReadBlog] },
                { label: "Edit", handler: handleEdit, show: blog.status == BlogStatus.Draft, permissions: [Permission.ReadBlog] },
                { label: "Submit", handler: handleSubmit, show: blog.status == BlogStatus.Draft, permissions: [] }
              ]}
              blogId={blog._id}
              key={blog._id} />
          ])}
        />
      </main>
    </div>
  );
}