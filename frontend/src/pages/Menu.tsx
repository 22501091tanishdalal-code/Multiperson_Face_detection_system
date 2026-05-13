import { useNavigate } from "react-router-dom";
import {
  User,
  Camera,
  ClipboardList,
  HelpCircle,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tile = {
  title: string;
  icon: LucideIcon;
  path?: string;
  type?: "logout";
};

const tiles: Tile[] = [
  { title: "Student Panel", icon: User, path: "/student-panel" },
  { title: "Face Recognition", icon: Camera, path: "/face-detector" },
  { title: "Attendance", icon: ClipboardList },
  { title: "Help & Support", icon: HelpCircle, path: "/help" },
  { title: "Logout", icon: LogOut, type: "logout" },
];

export default function Menu() {
  const navigate = useNavigate();

  function handleClick(tile: Tile) {
    if (tile.type === "logout") {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    if (tile.path) {
      navigate(tile.path);
    } else {
      alert(`${tile.title} working on it 🙂`);
    }
  }

  return (
    <div className="menu-bg">
      <div className="menu-container">
        <div className="menu-header">
          <h1>Student Dashboard</h1>
          <p>Manage Your attendance </p>
        </div>

        <div className="menu-grid">
          {tiles.map((tile) => {
            const Icon = tile.icon;

            return (
              <button
                key={tile.title}
                className="menu-card"
                onClick={() => handleClick(tile)}
                type="button"
              >
                <div className="menu-icon">
                  <Icon size={28} />
                </div>

                <h3>{tile.title}</h3>
               <p>
  {tile.title === "Student Panel" && "View your profile and academic details"}
  {tile.title === "Face Recognition" && "Mark attendance using face scan"}
  {tile.title === "Attendance" && "Track and manage attendance records"}
  {tile.title === "Help & Support" && "Get support and contact assistance"}
  {tile.title === "Logout" && "Securely sign out from your account"}
</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}