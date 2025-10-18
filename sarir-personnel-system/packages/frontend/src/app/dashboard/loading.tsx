
export default function Loading(){
  return (
    <div className="px-6 py-8 space-y-4">
      <div className="skeleton h-8 w-44"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neon-card p-5"><div className="skeleton h-6 w-24 mb-2"></div><div className="skeleton h-8 w-32"></div></div>
        <div className="neon-card p-5"><div className="skeleton h-6 w-24 mb-2"></div><div className="skeleton h-8 w-32"></div></div>
        <div className="neon-card p-5"><div className="skeleton h-6 w-24 mb-2"></div><div className="skeleton h-8 w-32"></div></div>
        <div className="neon-card p-5"><div className="skeleton h-6 w-24 mb-2"></div><div className="skeleton h-8 w-32"></div></div>
      </div>
      <div className="neon-card p-5">
        <div className="skeleton h-5 w-40 mb-3"></div>
        <div className="skeleton h-10 w-full mb-2"></div>
        <div className="skeleton h-10 w-5/6"></div>
      </div>
    </div>
  );
}
