import { useState } from "react";
import { UserPen } from "lucide-react";

export default function ProfileCard({ name, email, password, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({ name, email, password });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSave = async () => {
    const confirmUpdate = window.confirm("Are you sure you want to update your details?");
    if (!confirmUpdate) return;

    // Validate new password and confirm password
    if (newPassword && newPassword !== confirmPassword) {
      window.alert("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      window.alert("Profile updated successfully!");
      onSave(userData);
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      window.alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#1b1b1cff] epilogue">
          Profile <span className="text-[#ef4d31ff]">Information</span>
        </h2>
        <button
          className="flex items-center space-x-2 text-[#ef4d31ff] font-semibold hover:text-[#bf3e27] transition"
          onClick={() => setIsEditing(!isEditing)}
        >
          <UserPen className="text-xl" />
          <span className="text-xl epilogue">Edit</span>
        </button>
      </div>

      <div className="bg-[#fefefa] rounded-xl shadow-md p-6">
        <div className="space-y-4 poppins">
          <div className="flex items-center justify-between">
            <span className="text-[#5e5e5eff] font-semibold text-xl">Name</span>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 text-[#1c1c1cff] font-medium text-xl"
              />
            ) : (
              <span className="text-[#1c1c1cff] text-xl font-medium">{userData.name}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5e5e5eff] font-semibold text-xl">Email</span>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="border rounded px-2 py-1 text-[#1c1c1cff] font-medium text-xl"
              />
            ) : (
              <span className="text-[#1c1c1cff] text-xl font-medium">{userData.email}</span>
            )}
          </div>
          {isEditing && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[#5e5e5eff] font-semibold text-xl">Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border rounded px-2 py-1 text-[#1c1c1cff] font-medium text-xl"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5e5e5eff] font-semibold text-xl">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border rounded px-2 py-1 text-[#1c1c1cff] font-medium text-xl"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5e5e5eff] font-semibold text-xl">Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border rounded px-2 py-1 text-[#1c1c1cff] font-medium text-xl"
                />
              </div>
            </>
          )}
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            className="mt-4 bg-[#ef4d31ff] text-[#f7f7f7ff] px-4 py-2 rounded-lg shadow font-semibold hover:bg-[#bf3e27] poppins"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}