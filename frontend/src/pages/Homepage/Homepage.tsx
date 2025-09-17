import { useState, useMemo } from "react";
import type { DragEvent } from "react";
import debounce from "lodash.debounce";

export default function Homepage() {
  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState("");

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
    const files = e.dataTransfer.files;
    for (const file of files) {
      console.log(`  File: ${file}, ${file.name}, ${file.size} bytes\n`);
    }
  };

  const fetchData = (searchTerm: string) => {
    if (searchTerm.length > 3) console.log("API Call:", searchTerm);
  };

  const debouncedFetchData = useMemo(() => debounce(fetchData, 500), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedFetchData(e.target.value);
  };
  return (
    <div className="flex justify-start w-screen h-screen">
      <div className="w-80 h-screen bg-[#121628] hidden md:flex flex-col items-center p-4">
        {/*Search input*/}
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
            <li className="p-4 hover:bg-gray-700 cursor-pointer text-white rounded">
              User 1
            </li>
            <li className="p-4 hover:bg-gray-700 cursor-pointer text-white rounded">
              User 2
            </li>
          </ul>
        </div>
      </div>
      {/* Current chat or empty field */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 h-screen bg-[#0f0e18] flex justify-center items-center"
      >
        {isDragging ? (
          <div className="bg-black/60 w-[100%] h-[100%] flex justify-center items-center rounded-lg">
            <div className="bg-gray-800/90 text-white px-6 py-4 rounded-lg border-2 border-dashed border-white">
              Drag files here to send them
            </div>
          </div>
        ) : (
          <div>
            <h6>Select a chat to start messaging</h6>
          </div>
        )}
      </div>
    </div>
  );
}
