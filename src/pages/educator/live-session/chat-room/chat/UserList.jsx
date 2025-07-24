import React, { useState } from 'react';
import { Ban } from 'lucide-react'; // Assuming lucide-react is available for the Ban icon

// Mock utility function for demonstration. In a real app, this would resolve paths.
const toAbsoluteUrl = (path) => path; 

/**
 * UserCard Component
 * Manages the state and display for a single user, including ban/unban functionality.
 * @param {object} props - The component props.
 * @param {object} props.user - The user object containing name, avatar, and tasks.
 */
const UserCard = ({ user }) => {
  // State to manage whether the individual user is banned or not
  const [isBanned, setIsBanned] = useState(false);

  /**
   * Toggles the ban status for the current user.
   * This function updates the 'isBanned' state, which in turn
   * changes the background color of the card.
   */
  const toggleBanStatus = () => {
    setIsBanned(!isBanned);
  };

  // Dynamically apply Tailwind CSS classes based on the 'isBanned' state.
  // 'bg-red-100' provides a light red background when the user is banned.
  const cardClasses = `
    card-group 
    flex 
    justify-between 
    items-center 
    py-4 
    px-4 
    rounded-lg 
    shadow-sm 
    transition-colors 
    duration-300 
    ease-in-out
    ${isBanned ? 'bg-red-100' : 'bg-white'} 
    mb-3
  `;

  return (
    <div className={cardClasses}>
      <div className="flex items-center grow gap-2.5">
        {/* User avatar */}
        <img 
          src={toAbsoluteUrl(user.avatar)} 
          className="rounded-full size-9 shrink-0 object-cover" 
          alt={`${user.name}'s avatar`} 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/36x36/cccccc/333333?text=User'; }} // Fallback image
        />
        <div className="flex flex-col gap-1">
          {/* User name */}
          <a href="#" className="text-sm font-medium text-gray-900 hover:text-primary-active">
            {user.name}
          </a>
          {/* User tasks count */}
          <span className="text-xs text-gray-700">{user.tasks} tasks</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Button to toggle ban status */}
        <button 
          className={`
            px-3 
            py-1.5 
            rounded-md 
            text-xs 
            font-semibold 
            transition-all 
            duration-200 
            ease-in-out
            ${isBanned 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-red-500 text-white hover:bg-red-600'}
          `} 
          onClick={toggleBanStatus}
        >
          {/* Change button text based on ban status */}
          {isBanned ? 'Unblock' : 'Block'}
          {/* Optionally, you can add the Ban icon here, e.g., <Ban size={16} className="ml-1" /> */}
        </button>
      </div>
    </div>
  );
};

/**
 * UserList Component
 * Renders a list of UserCard components.
 */
const UserList = () => {
  // Dummy user data for demonstration purposes
  const users = [
    { id: 1, name: 'John Doe', avatar: '/media/avatars/300-3.png', tasks: 26 },
    { id: 2, name: 'Jane Smith', avatar: '/media/avatars/300-4.png', tasks: 15 },
    { id: 3, name: 'Peter Jones', avatar: '/media/avatars/300-5.png', tasks: 30 },
  ];

  return (
    <div className='str-chat__main-panel-inner str-chat__message-list-main-panel p-4 bg-gray-50 '>
       
      <div className="max-w-md mx-auto"> {/* Center the list for better presentation */}
        {/* {users.map((user) => (
          // Render a UserCard for each user, passing the user data as a prop
          <UserCard key={user.id} user={user} />
        ))} */}
      </div>
    </div>
  );
};

// Main App component to render the UserList
const App = () => {
  return (
    <div className="font-sans antialiased text-gray-900 bg-gray-100">
      {/* Tailwind CSS CDN for basic styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      <UserList />
    </div>
  );
};

export default App; // Export App as the default component
