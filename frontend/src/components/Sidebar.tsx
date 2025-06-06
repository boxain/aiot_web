import { User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";


const Sidebar = () => {

  const { user, logout } = useAuth();


  return (
    <div className="w-50 bg-[#005EA2] text-white flex flex-col items-center p-4">

      {/* Profile Section */}
      <div className="flex flex-col items-center space-y-4">
          {/* User Icon */}
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white shadow-lg">
              <User className="w-12 h-12 text-blue-600"/>
          </div>

          {/* User Info */}
          <div className="text-center space-y-1">
              <p className="font-semibold text-lg">{user!.name}</p>
              <div className="flex items-center text-sm text-gray-300 overflow-hidden">
                  <span className="truncate">{user!.email}</span>
              </div>
          </div>
      </div>

      {/* Settings and Logout */}
      <div className="mt-auto space-y-2 w-full">
          <div className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-blue-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 mr-3"/>
              Settings
          </div>
          <div className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-blue-700 rounded-lg transition-colors" onClick={logout}>
              <LogOut className="w-5 h-5 mr-3"/>
              Logout
          </div>
      </div>
      
    </div>
  );
};

export default Sidebar;