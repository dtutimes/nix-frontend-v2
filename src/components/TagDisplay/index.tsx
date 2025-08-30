import React from 'react';
import { ITag, getTagDisplayName } from '@/commonlib/types/tags';

interface TagDisplayProps {
  tags: ITag[];
}

export const TagDisplay: React.FC<TagDisplayProps> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Credits</h3>
      <div className="space-y-2">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-start">
            <span className="font-medium text-blue-600 mr-2 min-w-max">
              {getTagDisplayName(tag)}:
            </span>
            <div className="flex flex-wrap gap-1">
              {tag.users.map((user, userIndex) => (
                <span
                  key={user._id}
                  className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                >
                  {user.name}
                  {userIndex < tag.users.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};