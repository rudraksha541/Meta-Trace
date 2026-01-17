"use client";
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Navbar = () => {
  const router = useRouter();
  const isActive = (path) => router.pathname === path;

  return (
    <>
      <div className="bg-[#f7f7f7ff] w-full h-2"></div>
      <nav className="bg-[#f74b25ff] text-[#001215] p-2 rounded-xl shadow-sm mx-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/metatrace.png" alt="MetaTrace Logo" width={40} height={40} />
                <Link href="/" className="font-black text-xl epilogue hover:text-[#f6cc31ff]">
              MetaTrace
            </Link>
          </div>
          <div className="flex space-x-6 poppins font-semibold">
            <Link
              href="/upload"
              className={`pl-4 py-2 rounded-lg hover:text-[#f8d65a] ${
                isActive('/upload') ? 'text-[#f6cc31ff]' : 'text-[#001215]'
              }`}
            >
              Upload
            </Link>
            <Link
              href="/profile"
              className={`py-2 rounded-lg hover:text-[#f8d65a] ${
                isActive('/profile') ? 'text-[#f6cc31ff]' : 'text-[#001215]'
              }`}
            >
              Profile
            </Link>
            <a
              href="/"
              className="bg-[#1a1a1aff] text-[#f7f7ff] px-4 py-2 rounded-lg hover:bg-[#f7f7ff] hover:text-[#1a1a1aff]"
            >
              Logout
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
