"use client";
export default function SkeletonCard(){
  return (
    <div className="neon-card p-5">
      <div className="skeleton h-5 w-24 mb-4"></div>
      <div className="skeleton h-8 w-40 mb-3"></div>
      <div className="skeleton h-3 w-full mb-2"></div>
      <div className="skeleton h-3 w-5/6"></div>
    </div>
  );
}
