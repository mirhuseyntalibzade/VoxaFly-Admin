import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faExclamationTriangle,
  faBlog
} from '@fortawesome/free-solid-svg-icons';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    shortDesc: '',
    content: '',
    author: '',
    category: '',
    backgroundImageURL: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteType, setDeleteType] = useState('');


  const fetchBlogs = async () => {
    try {
      const response = await axios.get('https://localhost:7085/api/Blogs');
      setPosts(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch blogs');
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchPostDetails = async (id) => {
    try {
      const response = await axios.get(`https://localhost:7085/api/Blogs/${id}`);
      setSelectedPost(response.data);
    } catch (err) {
      console.error('Error fetching blog details:', err);
      setError('Failed to fetch blog details');
    }
  };

  useEffect(() => {
    if (showDetails && selectedPost) {
      fetchPostDetails(selectedPost.id);
    }
  }, [showDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Create FormData object
    const formDataToSend = new FormData();
    formDataToSend.append('Title', formData.title);
    formDataToSend.append('Content', formData.content);
    formDataToSend.append('Author', formData.author);
    formDataToSend.append('ShortDesc', formData.shortDesc);
    formDataToSend.append('Category', formData.category);
    formDataToSend.append('BackgroundImage', formData.backgroundImageURL);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingPost) {
        await axios.put(`https://localhost:7085/api/Blogs/${editingPost.id}`, formDataToSend, config);
      } else {
        await axios.post('https://localhost:7085/api/Blogs', formDataToSend, config);
      }

      setIsModalOpen(false);
      setEditingPost(null);
      setFormData({
        title: '',
        shortDesc: '',
        content: '',
        author: '',
        category: '',
        backgroundImageURL: ''
      });
      fetchBlogs();
    } catch (err) {
      console.log('Error response:', err.response?.data);
      setError('Failed to save blog post. Please fill in all required fields.');
    }
  };

  const handleDeleteClick = (post, type) => {
    setSelectedPost(post);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteType === 'soft') {
        await axios.patch(`https://localhost:7085/api/Blogs/${selectedPost.id}/soft-delete`);
      } else {
        await axios.delete(`https://localhost:7085/api/Blogs/${selectedPost.id}`);
      }
      setShowDeleteModal(false);
      setSelectedPost(null);
      fetchBlogs(); // Refresh the list
    } catch (err) {
      setError(err.response?.data || 'Failed to delete blog post');
    }
  };

  const handleStatusToggle = async (post) => {
    try {
      if (post.isDeleted) {
        await axios.patch(`https://localhost:7085/api/Blogs/${post.id}/revert`);
      } else {
        await axios.patch(`https://localhost:7085/api/Blogs/${post.id}/soft-delete`);
      }
      fetchBlogs(); // Refresh the list
    } catch (err) {
      setError('Failed to update blog post status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faBlog} className="text-blue-600 text-2xl mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Blog Management</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your blog posts</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link
              to="http://localhost:5173/blogs"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              target="_blank"
            >
              View Blog
            </Link>
            <button
              onClick={() => {
                setEditingPost(null);
                setFormData({
                  title: '',
                  shortDesc: '',
                  content: '',
                  author: '',
                  category: '',
                  backgroundImageURL: ''
                });
                setValidationErrors({});
                setIsModalOpen(true);
                console.log("Form initialized with:", formData); // Add this to debug
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Blog Post
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Blog Posts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-scroll">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                        <img className="h-10 w-10 rounded-full object-cover" src={`https://localhost:7085/uploads/bg/${post.backgroundImageURL}`} alt="" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {post.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(post.createdDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {post.isDeleted ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                    <div className="flex justify-end space-x-3">
                      <Link
                        to={`http://localhost:5173/blog/${post.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                        target="_blank"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setFormData({
                            title: post.title || '',
                            shortDesc: post.shortDesc || '',
                            content: post.content || '',
                            author: post.author || '',
                            category: post.category || '',
                            backgroundImageURL: post.backgroundImageURL || ''
                            
                          });
                          console.log(post.backgroundImageURL);
                          setValidationErrors({});
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleStatusToggle(post)}
                        className={`${post.isDeleted ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'} font-medium`}
                      >
                        {post.isDeleted ? 'Activate' : 'Deactivate'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowDetails(true);
                        }}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDeleteClick(post, 'hard')}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-start mt-3 text-center sm:mt-0 sm:text-left">
                    <div className="flex-shrink-0">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Blog Post
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this blog post?
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPost(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedPost && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="relative bg-white rounded-lg max-w-6xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Blog Post Details: {selectedPost.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="aspect-w-16 aspect-h-9 mb-6">
                    <img
                      src={`https://localhost:7085/uploads/bg/${selectedPost.backgroundImageURL}`}
                      alt={selectedPost.title}
                      className="object-cover rounded-lg w-full h-64"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Title</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedPost.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedPost.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Author</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedPost.author}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedPost.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                        ${selectedPost.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                      >
                        {selectedPost.isDeleted ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">Short Description</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPost.shortDesc}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">Content</p>
                    <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {selectedPost.content}
                    </div>
                  </div>

                  {/* Audit Information */}
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Audit Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created By</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedPost.createdBy}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created Date</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPost.createdDate)}</p>
                      </div>
                      {selectedPost.updatedBy && (
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Updated By</p>
                            <p className="mt-1 text-sm text-gray-900">{selectedPost.updatedBy}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Updated Date</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedPost.updatedDate ? formatDate(selectedPost.updatedDate) : '-'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {editingPost ? 'Edit Blog Post' : 'Add Blog Post'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Title and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.Title ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.Title && validationErrors.Title.map((error, index) => (
                        <p key={index} className="mt-1 text-sm text-red-600">{error}</p>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.Category ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Author and Image Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.Author ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, backgroundImageURL: file });
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      value={formData.shortDesc}
                      onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                      rows="2"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.ShortDesc ? 'border-red-300' : 'border-gray-300'
                      }`}
                    ></textarea>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows="8"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.Content ? 'border-red-300' : 'border-gray-300'
                      }`}
                    ></textarea>
                  </div>
                </form>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingPost ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPost(null);
                      setValidationErrors({});
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;