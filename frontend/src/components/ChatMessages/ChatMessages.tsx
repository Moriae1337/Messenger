import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaPaperclip, FaArrowLeft } from "react-icons/fa";
import type { Message } from "../../types/Message";
import type { User } from "../../types/User";

interface ChatMessagesProps {
  messages: Message[];
  selectedUser: User;
  currentUserId: string;
  isDragging: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onBack: () => void;
}

export default function ChatMessages({
  messages,
  selectedUser,
  currentUserId,
  isDragging,
  setMessages,
  onBack,
}: ChatMessagesProps) {
  const ws = useRef<WebSocket | null>(null);
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: Message | null;
  }>({ x: 0, y: 0, message: null });
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!selectedUser) return;

    ws.current = new WebSocket(
      `ws://localhost:8000/ws/chat/${currentUserId}/${
        selectedUser.id
      }?token=${localStorage.getItem("access_token")}`
    );

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.action) {
        case "add":
          setMessages((prev) => [...prev, data.message]);
          break;
        case "update":
          setMessages((prev) =>
            prev.map((msg) => (msg.id === data.message.id ? data.message : msg))
          );
          break;
        case "delete":
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== data.message.id)
          );
          break;
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [currentUserId, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!contextMenu.message) return;

    document.body.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseMenu();
    };
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [contextMenu.message]);

  if (isDragging || !selectedUser) return null;

  const handleSendMessageWS = (action: string, message: Message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, message }));
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;

    const messageObj: Message = {
      text,
      sender_id: parseInt(currentUserId),
      recipient_id: selectedUser.id,
      attachments: [],
    };

    if (editingMessage) {
      handleSendMessageWS("update", { ...editingMessage, text });
      setEditingMessage(null);
    } else {
      handleSendMessageWS("add", messageObj);
    }

    setText("");
  };

  const handleDelete = () => {
    if (!contextMenu.message) return;
    handleSendMessageWS("delete", contextMenu.message);
    handleCloseMenu();
  };

  const handleEdit = () => {
    setText(contextMenu?.message?.text || "");
    setEditingMessage(contextMenu.message);
    handleCloseMenu();
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
  };

  const handleCloseMenu = () => setContextMenu({ x: 0, y: 0, message: null });

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="bg-gray-800 text-white p-3 font-semibold flex items-center gap-5">
        <FaArrowLeft onClick={onBack} className="hover:cursor-pointer" />
        <span>{selectedUser.username}</span>
      </div>

      <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-2">
        {messages.length === 0 ? (
          <p className="text-white">No messages yet</p>
        ) : (
          <div
            className="flex flex-col gap-2 relative"
            onClick={handleCloseMenu}
          >
            {messages.map((msg) => {
              const isMine = msg.sender_id === parseInt(currentUserId);
              const senderName = isMine ? "You" : selectedUser.username;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[70%] ${
                    isMine
                      ? "self-end items-end md:self-start md:items-start"
                      : "self-start items-start"
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, msg)}
                >
                  <span className="text-xs font-semibold mb-1 text-gray-300">
                    {senderName}
                  </span>
                  <div
                    className={`p-2 rounded ${
                      isMine
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {msg.text}
                    {msg?.attachments?.length > 0 && (
                      <ul className="mt-1 text-sm">
                        {msg.attachments.map((att) => (
                          <li key={att.id}>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline text-blue-300"
                            >
                              {att.filename}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
            {contextMenu.message && (
              <div className="fixed inset-0" onClick={handleCloseMenu}>
                <div
                  className="absolute text-white rounded p-2 flex flex-col gap-1"
                  style={{ top: contextMenu.y, left: contextMenu.x }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleEdit}
                    className="bg-gray-800 hover:bg-gray-900 rounded px-1 py-1"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-gray-800 hover:bg-gray-900 rounded px-1 py-1"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full gap-2 p-2 bg-gray-900">
        {editingMessage && (
          <div className="px-2 rounded bg-gray-900 text-white flex justify-between items-center">
            <span>✏️ You are editing message: {editingMessage.text}</span>
            <button
              onClick={() => setEditingMessage(null)}
              className="ml-2 text-white hover:text-red-500 focus:outline-none"
            >
              ❌
            </button>
          </div>
        )}

        <div className="w-full flex items-center gap-2 p-2 bg-gray-900">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            onClick={handleFileClick}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600 text-white"
          >
            <FaPaperclip />
          </button>
          <button
            onClick={handleSend}
            className="p-2 bg-purple-600 rounded hover:bg-purple-700 text-white"
          >
            <FaPaperPlane />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}
