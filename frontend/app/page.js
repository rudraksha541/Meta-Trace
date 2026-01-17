"use client";
import { useState } from "react";
import Image from "next/image";
import logo from "../public/metatrace.png";
import Footer from "@/components/Footer";

export default function Home() {
  const [activeSection, setActiveSection] = useState("");
  return (
    <div className="bg-[#f7f7f7ff]">
      <div className="bg-[#f7f7f7ff] w-full h-2"></div>
    <nav className="bg-[#f74b25ff] text-black p-2 rounded-xl shadow-sm mx-4 mb-2">
  <div className="container mx-auto flex justify-between items-center">
    <div className="flex items-center space-x-2">
      <Image src={logo} alt="MetaTrace Logo" width={40} height={40} />
      <div className="font-black text-xl epilogue text-[#1a1a1aff]">MetaTrace</div>
    </div>
    <ul className="flex space-x-6 mx-auto poppins font-bold text-[#1a1a1aff]">
  <li>
    <a
      href="#features"
      className={`hover:text-[#fad22bff] ${
        activeSection === "features" ? "text-[#f6cc31ff]" : ""
      }`}
      onClick={() => setActiveSection("features")}
    >
      Features
    </a>
  </li>
  <li>
    <a
      href="#steps"
      className={`hover:text-[#fad22bff] ${
        activeSection === "steps" ? "text-[#f6cc31ff]" : ""
      }`}
      onClick={() => setActiveSection("steps")}
    >
      Steps
    </a>
  </li>
</ul>
    <div className="flex space-x-4 poppins font-semibold">
      
      <a
        href="/login"
        className="bg-[#1a1a1aff] text-[#f7f7ff] px-4 py-2 rounded-lg hover:bg-[#1b1b1cff]"
      >
        Log In 
      </a>
      <a
        href="/signup"
        className="bg-[#1a1a1aff] text-[#f7f7ff] px-4 py-2 rounded-lg hover:bg-[#1b1b1cff]"
      >
        Sign Up
      </a>
    </div>
  </div>
</nav>
  <section className="bg-[#f7f7f7ff] text-[#1a1a1aff] py-28">
  <div className="container mx-auto flex flex-col md:flex-row items-center">
    <div className="md:w-1/2 text-center md:text-left">
      <h1 className="text-4xl font-bold epilogue">Unlock the Power of Your Data with <strong className="text-[#ef4d31ff]">MetaTrace</strong></h1>
      <p className="mt-4 text-xl poppins">
        MetaTrace makes metadata extraction effortless, uncovering actionable insights securely and with user-friendly precision.
      </p>
      <a
        href="/signup"
        className="mt-6 inline-block bg-[#ffd028ff] text-[#1a1a1aff] hover:bg-[#e6bb24] py-2 px-6 rounded-full poppins text-lg font-semibold"
      >
        Start Analyzing Now!
      </a>
    </div>
    <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
      <Image
        src="/landing_page/hero-section.png"
        alt="MetaTrace Insights"
        width={350}
        height={350}
        className="rounded-lg"
      />
    </div>
  </div>
</section>
  <section id="features" className="bg-[#dfdfdf] py-14">
  <div className="container mx-auto text-center">
    <h2 className="text-4xl font-bold mb-4 epilogue text-[#1b1b1cff]"><strong className="text-[#ef4d31ff]">MetaTrace's</strong> Core Offerings</h2>
    <p className="text-lg text-[#5e5e5eff] mb-12 poppins">
    Transform hidden file details into stunning visuals and actionable insights with ease.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="mb-4">
          <img
            src="/landing_page/feature1.png"
            alt="Metadata Icon"
            className="w-12 h-12"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#1c1c1cff] #1a1a1aff epilogue">
          Comprehensive Metadata Extraction
        </h3>
        <p className="text-[#5e5e5eff] text-sm poppins">
        Get detailed insights from images, videos, and documents effortlessly.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="mb-4">
          <img
            src="/landing_page/feature2.png"
            alt="Visual Insights Icon"
            className="w-12 h-12"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#1c1c1cff] epilogue">
          Visualized Insights
        </h3>
        <p className="text-[#5e5e5eff] text-sm poppins">
        Turn data into sleek, presentation-ready charts and graphs.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="mb-4">
          <img
            src="/landing_page/feature3.png"
            alt="Security Icon"
            className="w-12 h-12"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#1c1c1cff] epilogue">
          Security & Privacy First
        </h3>
        <p className="text-[#5e5e5eff] text-sm poppins">
        Your files are protected with robust encryption and strict privacy measures.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="mb-4">
          <img
            src="/landing_page/feature4.png"
            alt="Integration Icon"
            className="w-12 h-12"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2  text-[#1c1c1cff] epilogue">
          Seamless Integration
        </h3>
        <p className="text-[#5e5e5eff] text-sm poppins">
        Work seamlessly across various file formats for a smooth experience.
        </p>
      </div>
    </div>
  </div>
</section>
<section id="steps" className="bg-[#f7f7f7ff] py-14">
  <div className="container mx-auto text-center">
    <h2 className="text-4xl font-bold mb-4 epilogue text-[#1b1b1cff]">Effortless Insights with <strong className="text-[#ef4d31ff]">MetaTrace</strong></h2>
    <p className="text-lg text-[#5e5e5eff] mb-12 poppins">Begin your MetaTrace experience in no time.</p>
    <div className="mt-10 grid grid-cols-4 gap-8">
      <div className="bg-[#ebebeb] p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 mb-4">
          <Image src="/landing_page/step1.png" alt="Upload Icon" width={64} height={64} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#1c1c1cff] epilogue">Upload Your File</h3>
        <p className="text-[#5e5e5eff] text-sm poppins">Upload an image, video, or PDF. MetaTrace supports multiple formats for flexibility.</p>
      </div>
      <div className="bg-[#ebebeb] p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 mb-4">
          <Image src="/landing_page/step2.png" alt="Analyze Icon" width={64} height={64} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#1c1c1cff] epilogue">Analyze the Metadata</h3>
        <p className="text-[#5e5e5eff] text-sm poppins">Extract key details like size, creation date, and resolution instantly.</p>
      </div>
      <div className="bg-[#ebebeb] p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 mb-4">
          <Image src="/landing_page/step3.png" alt="Visualize Icon" width={64} height={64} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#1c1c1cff] epilogue">Visualize Key Insights</h3>
        <p className="text-[#5e5e5eff] text-sm poppins">View trends and correlations through clear, impactful visualizations.</p>
      </div>
      <div className="bg-[#ebebeb] p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 mb-4">
          <Image src="/landing_page/step4.png" alt="Security Icon" width={64} height={64} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[#1c1c1cff] epilogue">Ensure Security and Privacy</h3>
        <p className="text-[#5e5e5eff] text-sm poppins">Enjoy strong encryption and privacy for complete peace of mind.</p>
      </div>
    </div>
  </div>
</section>
<section className="bg-[#dfdfdf] py-14 text-center">
  <div className="container mx-auto flex flex-col items-center">
    <div className="mb-6 rounded-lg shadow-lg">
      <Image
        src="/metatrace.png"
        alt="Get Started Icon"
        width={64}
        height={64}
      />
    </div>
    <h2 className="text-4xl font-bold mb-4 epilogue text-[#ef4d31ff]">Get Started</h2>
    <p className="text-lg text-[#5e5e5eff] poppins mb-6">
      Begin your journey to uncover actionable insights effortlessly.
    </p>
    <a
      href="/signup"
      className="bg-[#ef4d31ff] text-[#f7f7f7ff] py-2 px-6 rounded-full text-lg font-semibold hover:bg-[#bf3e27] poppins"
    >
      Get Started Now
    </a>
  </div>
</section>
<Footer />
  </div>
  );
}
