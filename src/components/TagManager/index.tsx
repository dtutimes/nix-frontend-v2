import React, { useState, useEffect } from 'react';
import { ITag, TagType, getTagDisplayName } from '@/commonlib/types/tags';
import { IUser } from '@/commonlib/types/frontend/contextTypes';
import API from '@/services/API';

interface TagManagerProps {
  tags: ITag[];
  onTagsChange: (tags: ITag[]) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ tags, onTagsChange }) => {
  const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTag, setNewTag] = useState<{
    tag_type: TagType;
    tag_name?: string;
    selectedUsers: string[];
  }>({
    tag_type: TagType.Author,
    selectedUsers: [],
  });

  // Load available users
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await API.get('/user/get-all-users');
        setAvailableUsers(response.data.data || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleAddTag = () => {
    if (newTag.selectedUsers.length === 0) {
      alert('Please select at least one user for this tag.');
      return;
    }

    if (newTag.tag_type === TagType.Other && !newTag.tag_name?.trim()) {
      alert('Please enter a name for the custom tag.');
      return;
    }

    const usersForTag = availableUsers.filter(user => 
      newTag.selectedUsers.includes(user._id)
    );

    const tag: ITag = {
      tag_type: newTag.tag_type,
      users: usersForTag,
      ...(newTag.tag_type === TagType.Other && { tag_name: newTag.tag_name }),
    } as ITag;

    onTagsChange([...tags, tag]);
    
    // Reset form
    setNewTag({
      tag_type: TagType.Author,
      selectedUsers: [],
    });
    setShowAddForm(false);
  };

  const handleRemoveTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    onTagsChange(updatedTags);
  };

  const handleUserSelection = (userId: string, isSelected: boolean) => {
    if (isSelected) {
      setNewTag(prev => ({
        ...prev,
        selectedUsers: [...prev.selectedUsers, userId]
      }));
    } else {
      setNewTag(prev => ({
        ...prev,
        selectedUsers: prev.selectedUsers.filter(id => id !== userId)
      }));
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 font-semibold">
        Credits & Tags
        <span className="text-sm font-normal text-gray-500 ml-2">
          Give credit to others who contributed to this story
        </span>
      </label>
      
      {/* Display existing tags */}
      <div className="mb-4">
        {tags.length > 0 ? (
          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                <div>
                  <span className="font-medium text-blue-600">
                    {getTagDisplayName(tag)}:
                  </span>
                  <span className="ml-2">
                    {tag.users.map(user => user.name).join(', ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No credits added yet.</p>
        )}
      </div>

      {/* Add new tag button */}
      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Credit
        </button>
      )}

      {/* Add new tag form */}
      {showAddForm && (
        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
          <h4 className="font-semibold mb-3">Add Credit</h4>
          
          {/* Tag type selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Credit Type</label>
            <select
              value={newTag.tag_type}
              onChange={(e) => setNewTag(prev => ({ 
                ...prev, 
                tag_type: parseInt(e.target.value) as TagType 
              }))}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={TagType.Author}>Author</option>
              <option value={TagType.Designer}>Designer</option>
              <option value={TagType.Illustrator}>Illustrator</option>
              <option value={TagType.Photographer}>Photographer</option>
              <option value={TagType.Other}>Other</option>
            </select>
          </div>

          {/* Custom tag name for "Other" type */}
          {newTag.tag_type === TagType.Other && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Custom Credit Name</label>
              <input
                type="text"
                value={newTag.tag_name || ''}
                onChange={(e) => setNewTag(prev => ({ 
                  ...prev, 
                  tag_name: e.target.value 
                }))}
                placeholder="Enter custom credit type (e.g., Editor, Reviewer)"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}

          {/* User selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Select Users</label>
            {loading ? (
              <p className="text-gray-500">Loading users...</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded">
                {availableUsers.map(user => (
                  <label key={user._id} className="flex items-center p-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={newTag.selectedUsers.includes(user._id)}
                      onChange={(e) => handleUserSelection(user._id, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">{user.name} ({user.email})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Form actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Add Credit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewTag({ tag_type: TagType.Author, selectedUsers: [] });
              }}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};