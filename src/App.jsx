import React from "react";

function SearchBar({ query, setQuery }) {
  return (
    <input
      type="text"
      placeholder="Search GitHub users..."
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function UserCard({ user, onClick }) {
  return (
    <div
      className="flex items-center bg-white shadow rounded p-3 mb-2 hover:bg-blue-50 cursor-pointer"
      onClick={onClick}
    >
      <img
        src={user.avatar_url}
        alt={user.login}
        className="w-12 h-12 rounded-full mr-4"
      />
      <div className="flex-1">
        <div className="font-bold">{user.login}</div>
      </div>
      <button className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
        View
      </button>
    </div>
  );
}

function UserList({ users, onSelect }) {
  if (!users.length)
    return (
      <div className="text-center text-gray-500 mt-4">No users found.</div>
    );
  return (
    <div className="mt-4 space-y-2">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => onSelect(user.login)}
        />
      ))}
    </div>
  );
}

function UserDetails({ user, onClose }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">{user.name || user.login}</h2>
          <p className="text-gray-600 mb-2">{user.bio}</p>
          <div className="flex space-x-4 mb-2">
            <span className="font-semibold">Repos: {user.public_repos}</span>
            <span className="font-semibold">Followers: {user.followers}</span>
            <span className="font-semibold">Following: {user.following}</span>
          </div>
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View GitHub Profile
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = React.useState("");
  const [users, setUsers] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!query) {
      setUsers([]);
      return;
    }
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      fetch(`https://api.github.com/search/users?q=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setUsers(data.items || []);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch users");
          setLoading(false);
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = (username) => {
    setLoading(true);
    fetch(`https://api.github.com/users/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch user details");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-2 py-6">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          GitHub User Finder
        </h1>
        <SearchBar query={query} setQuery={setQuery} />
        {loading && (
          <div className="text-center text-blue-500 mt-4">Loading...</div>
        )}
        {error && <div className="text-center text-red-500 mt-4">{error}</div>}
        <UserList users={users} onSelect={handleSelectUser} />
      </div>
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
