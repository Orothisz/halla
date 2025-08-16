export default function Forbidden(){
  return (
    <div className="min-h-[60vh] grid place-items-center bg-black text-white p-6">
      <div className="text-center">
        <div className="text-4xl font-semibold mb-2">403</div>
        <div className="opacity-70">You don’t have access to this page.</div>
      </div>
    </div>
  );
}
