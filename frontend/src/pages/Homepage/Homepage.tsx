// pages/Homepage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types/User";
import type { Message } from "../../types/Message";
import ChatSidebar from "../../components/ChatSideBar";
import FileDropZone from "../../components/FileDropZone";
import ChatMessages from "../../components/ChatMessages";
import debounce from "lodash.debounce";

export default function Homepage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const currentUserId = localStorage.getItem("user_id");
  const token = localStorage.getItem("access_token");

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/messages/contacts/?current_user_id=${currentUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
  }, [currentUserId, token, navigate]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const fetchUsers = useCallback(
    async (searchTerm: string) => {
      if (searchTerm.length === 0) {
        fetchContacts();
        return;
      }
      try {
        const res = await fetch(`http://localhost:8000/users/${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` },
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
    },
    [fetchContacts, token, navigate]
  );

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const debouncedFetchUsers = useMemo(
    () => debounce(fetchUsers, 500),
    [fetchUsers]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedFetchUsers(value);
  };

  // Handle selecting a user
  const handleUserClick = async (user: User) => {
    if (selectedUser?.id === user.id) return; // не робимо лишніх запитів
    setSelectedUser(user);

    try {
      const res = await fetch(
        `http://localhost:8000/messages/${currentUserId}/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setMessages([]);
        return;
      }

      const data: Message[] = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages([]);
    }
  };
  const handleUserSendMessage = async (
    text: string,
    sender_id: number,
    recipient_id: number
  ) => {
    try {
      const message_send: Message = {
        text: text,
        sender_id: sender_id,
        recipient_id: recipient_id,
        attachments: [],
      };
      const res = await fetch(`http://localhost:8000/messages/add/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message_send),
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setSelectedUser(null);
        setMessages([]);
        return;
      }
      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
    } catch (err) {
      console.error("Fetch error:", err);
      setSelectedUser(null);
      setMessages([]);
    }
  };
  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };
  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));
  const clearFiles = () => setFiles([]);
  const sendFiles = () => console.log("Sending files:", files);

  return (
    <div className="flex justify-start w-screen h-screen">
      {/* Sidebar */}
      <ChatSidebar
        users={users}
        selectedUser={selectedUser}
        onUserClick={handleUserClick}
        query={query}
        onQueryChange={handleQueryChange}
      />

      {/* Main area */}
      <FileDropZone
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        selectedUser={selectedUser !== null}
      >
        <ChatMessages
          messages={messages}
          setMessages={setMessages}
          selectedUser={selectedUser!}
          currentUserId={currentUserId}
          isDragging={isDragging}
          onSendMessage={handleUserSendMessage}
          onBack={handleBack}
        />

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
                    <span>{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={clearFiles}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  Clear all
                </button>
                <button
                  onClick={sendFiles}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </FileDropZone>
    </div>
  );
}
