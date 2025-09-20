import React, { type ReactNode } from "react";
import { FaFileAlt, FaTrash } from "react-icons/fa";
import { FaPaperPlane } from "react-icons/fa6";

interface Props {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  children: ReactNode;
}

interface FileDropZoneProps extends Props {
  files: File[];
  removeFile: (index: number) => void;
  clearFiles: () => void;
  sendFiles: () => void;
  selectedUser: boolean;
}

export default function FileDropZone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
  files = [],
  removeFile,
  clearFiles,
  sendFiles,
  selectedUser,
}: FileDropZoneProps) {
  return (
    <div
      onDragOver={selectedUser ? onDragOver : undefined}
      onDragLeave={selectedUser ? onDragLeave : undefined}
      onDrop={selectedUser ? onDrop : undefined}
      className="flex-1 h-screen bg-[#0f0e18] flex justify-center items-center relative"
    >
      {!selectedUser && (
        <p className="text-white hidden md:flex">
          Select a user to start chatting
        </p>
      )}

      {selectedUser && isDragging && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/60">
          <div className="bg-gray-800/90 text-white px-6 py-4 rounded-lg border-2 border-dashed border-white">
            Drag files here to send them
          </div>
        </div>
      )}

      {/* Діти DropZone (ChatMessages) */}
      {selectedUser && children}

      {/* Список файлів */}
      {selectedUser && files.length > 0 && (
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
  );
}
