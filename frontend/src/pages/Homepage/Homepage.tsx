import { useState, useMemo } from "react";
import type { DragEvent } from "react";
import debounce from "lodash.debounce";
import { FaFileAlt, FaTrash, FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export default function Homepage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => setFiles([]);

  const sendFiles = () => {
    console.log("Sending files:", files);
  };

  const fetchData = async (searchTerm: string) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/users/${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setUsers([]);
        return;
      }

      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setUsers([]);
    }
  };

  const debouncedFetchData = useMemo(() => debounce(fetchData, 500), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedFetchData(e.target.value);
  };

  return (
    <div className="flex justify-start w-screen h-screen">
      <div className="w-80 h-screen bg-[#121628] hidden md:flex flex-col items-center p-4">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search"
          value={query}
          maxLength={50}
          onChange={handleChange}
          className="w-full px-3 py-2 mb-4 rounded bg-[#1e2035] text-white placeholder-gray-400 focus:outline-none"
        />
        {/* Available chats */}
        <div className="flex-1 w-full overflow-y-auto">
          <ul>
            {users.length > 0 ? (
              users.map((user) => (
                <li
                  key={user.id}
                  className="p-4 hover:bg-gray-700 cursor-pointer text-white rounded"
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

      {/* Current chat or drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 h-screen bg-[#0f0e18] flex justify-center items-center relative"
      >
        {isDragging && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/60">
            <div className="bg-gray-800/90 text-white px-6 py-4 rounded-lg border-2 border-dashed border-white">
              Drag files here to send them
            </div>
          </div>
        )}

        {!isDragging && files.length === 0 && (
          <div>
            <h6 className="text-white">Select a chat to start messaging</h6>
          </div>
        )}

        {!isDragging && files.length > 0 && (
          <div className="absolute inset-0 flex justify-center items-center z-10">
            <div className="w-[90%] max-w-lg bg-[#1c1b29] text-white rounded-lg shadow-lg p-6">
              <h4 className="font-semibold mb-4 text-center text-lg">
                Files ready to send:
              </h4>

              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-[#2a2940] p-3 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <FaFileAlt className="text-gray-300" />
                      <div className="flex flex-col">
                        <span className="text-white">{file.name}</span>
                        <span className="text-sm text-gray-400">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={clearFiles}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  <FaTrash /> Clear all
                </button>
                <button
                  onClick={sendFiles}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
                >
                  <FaPaperPlane /> Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
