import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [overlaps, setOverlaps] = useState([]);
  const navigate = useNavigate();

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingOverlap, setLoadingOverlap] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token")

  if (!token) {
    navigate("/")
  }

  useEffect(() => {
    fetchUsers();
    fetchMentors();
  }, []);

  useEffect(() => {
    if (selectedUser && selectedMentor) {
      fetchOverlap(selectedUser.id, selectedMentor.id);
    }
  }, [selectedUser, selectedMentor]);

  // ---------------- API CALLS ----------------

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const data = await res.json();
    setUsers(data);
    setLoadingUsers(false)
  };

  const fetchMentors = async () => {
    const res = await fetch(`${API_URL}/api/admin/mentors`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const data = await res.json();
    setMentors(data);
    setLoadingMentors(false)
  };

  const fetchOverlap = async (userId, mentorId) => {
    const res = await fetch(
      `${API_URL}/api/admin/overlap/${userId}/${mentorId}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    const data = await res.json();
    setOverlaps(data);
    setLoadingOverlap(false)
  };

  const bookMeeting = async (slot) => {
    await fetch(`${API_URL}/api/admin/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        title: "Mentoring Call",
        startTime: slot.startTime,
        endTime: slot.endTime,
        participantEmails: [
          selectedUser.email,
          selectedMentor.email,
        ],
      }),
    });

    alert("✅ Meeting booked!");
  };

  const getScore = (user, mentor) => {
    if (!user || !mentor) return 0;

    let score = 0;

    const userTags = user.tags || [];
    const mentorTags = mentor.tags || [];

    userTags.forEach((tag) => {
      if (mentorTags.includes(tag)) {
        score++;
      }
    });

    return score;
  };

  const sortedMentors = [...mentors].sort(
    (a, b) => getScore(selectedUser, b) - getScore(selectedUser, a)
  );

  // ---------------- UI ----------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 text-black">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Mentoring Scheduler
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {/* USERS */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border">
          <h2 className="text-lg font-semibold mb-4">Users</h2>

          {loadingUsers ? (
            <p className="text-gray-500">Loading users...</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 border-b cursor-pointer rounded-lg ${selectedUser?.id === user.id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
                  }`}
              >
                <div className="font-medium">{user.name}</div>

                <div className="flex gap-2 mt-1">
                  {user.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedUser && (
          <div className="bg-white p-3 rounded shadow mt-4">
            <h3 className="font-semibold">User Requirement</h3>
            <p className="text-sm text-gray-600">
              {selectedUser.description}
            </p>
          </div>
        )}

        {/* MENTORS */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border">
          <h2 className="text-lg font-semibold mb-2">Mentors</h2>

          <p className="text-sm text-gray-500 mb-2">
            Ranked by relevance
          </p>

          {loadingMentors ? (
            <p className="text-gray-500">Loading mentors...</p>
          ) : (
            sortedMentors.map((mentor, index) => (
              <div
                key={mentor.id}
                onClick={() => setSelectedMentor(mentor)}
                className={`p-3 border-b cursor-pointer rounded-lg ${selectedMentor?.id === mentor.id
                  ? "bg-green-100"
                  : "hover:bg-gray-100"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{mentor.name}</span>

                  {selectedUser && (
                    <span className="text-sm text-green-600 font-semibold">
                      Score: {getScore(selectedUser, mentor)}
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex gap-2 mt-1">
                  {mentor.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-green-200 text-green-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* BEST MATCH */}
                {index === 0 && selectedUser && (
                  <div className="mt-1 text-xs text-purple-600 font-bold">
                    ⭐ Best Match
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* OVERLAP + BOOKING */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border">
          <h2 className="text-lg font-semibold mb-4">Available Slots</h2>

          {loadingOverlap ? (
            <p className="text-gray-500">Checking availability...</p>
          ) : (
            <>
              {!selectedUser && <p>Select a user first</p>}
              {selectedUser && !selectedMentor && <p>Select a mentor</p>}

              {overlaps.map((slot, index) => (
                <div
                  key={index}
                  className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-lg mb-2"
                >
                  <span className="font-medium">
                    {new Date(slot.startTime).toLocaleTimeString()} -{" "}
                    {new Date(slot.endTime).toLocaleTimeString()}
                  </span>

                  <button
                    onClick={() => bookMeeting(slot)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg shadow"
                  >
                    Book
                  </button>
                </div>
              ))}
              {selectedUser && selectedMentor && overlaps.length === 0 && (

                <p className="text-red-500">No overlapping slots found</p>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}