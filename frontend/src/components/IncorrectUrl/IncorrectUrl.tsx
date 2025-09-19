export default function IncorrectUrl() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0f0e18] via-[#1a1830] to-[#0f0e18] text-white flex-col">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg">The URL you entered is incorrect.</p>
    </div>
  );
}
