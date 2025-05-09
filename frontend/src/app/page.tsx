"use client"

import Link from "next/link";

export default function Home() {

  return (
    <>
      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Home</h1>
      <Link href={"/device"}>Device</Link>
    </>
  );
}