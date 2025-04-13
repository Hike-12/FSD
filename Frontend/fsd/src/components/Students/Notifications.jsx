import React, { useEffect, useState } from "react";
import { DJANGO_BASE_URL } from "@/lib/utils";

const StudentNotifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${DJANGO_BASE_URL}/api/get-collaboration-requests/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch collaboration requests");

        const data = await response.json();
        console.log("Collaboration Requests:", data);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching collaboration requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRequest = async (requestId, action) => {
    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/collaboration-requests/handle/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request_id: requestId, action }),
      });

      if (!response.ok) throw new Error("Failed to handle collaboration request");

      const message = await response.json();
      alert(message.message);

      // Remove the handled request from the list
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error("Error handling collaboration request:", error);
      alert("Failed to handle collaboration request. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requests.length === 0) {
    return <div>No collaboration requests at the moment.</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div
          key={req.id}
          className="p-4 bg-white shadow-md rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            {req.from_student_profile_picture ? (
              <img
                src={`${DJANGO_BASE_URL}/media/${req.from_student_profile_picture}`}
                alt={req.from_student_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xl">{req.from_student_name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-800">{req.from_student_name}</h4>
              <p className="text-sm text-gray-500">
                Sent on {new Date(req.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              onClick={() => handleRequest(req.id, "accept")}
            >
              Accept
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => handleRequest(req.id, "deny")}
            >
              Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentNotifications;