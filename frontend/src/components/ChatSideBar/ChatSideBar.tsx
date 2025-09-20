import type { User } from "../../types/User";

interface Props {
  users: User[];
  selectedUser: User | null;
  onUserClick: (user: User) => void;
  query: string;
  onQueryChange: (value: string) => void;
}

export default function ChatSidebar({
  users,
  selectedUser,
  onUserClick,
  query,
  onQueryChange,
}: Props) {
  return (
    <div
      className={`h-screen bg-[#121628] ${
        !selectedUser ? "flex w-full" : "hidden"
      } md:flex md:w-80 flex-col items-center p-4`}
    >
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full px-3 py-2 mb-4 rounded bg-[#1e2035] text-white placeholder-gray-400 focus:outline-none"
      />
      <div className="flex-1 w-full overflow-y-auto">
        <ul>
          {users.length > 0 ? (
            users.map((user) => (
              <li
                onClick={() => onUserClick(user)}
                key={user.id}
                className={`p-4 hover:bg-gray-700 cursor-pointer text-white rounded ${
                  selectedUser?.id === user.id ? "bg-gray-600" : ""
                }`}
              >
                {user.username}
              </li>
            ))
          ) : (
            <li className="p-4 text-gray-400">No users found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
