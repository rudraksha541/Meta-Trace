import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const getUserData = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null; // No token found
  }

  try {
    const response = await fetch("/api/protected-route", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Send JWT in Authorization header
      },
    });

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    return await response.json();
  } catch (error) {
    console.error("Authentication failed:", error);
    return null;
  }
};

const ProtectedPage = () => {
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserData();

      if (!userData) {
        router.push("/login"); // Redirect to login if unauthorized
      } else {
        setData(userData);
      }
    };

    fetchData();
  }, [router]);

  return (
    <div>
      {data ? <h1>{data.message}</h1> : <h1>Loading...</h1>}
    </div>
  );
};

export default ProtectedPage;