import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full flex items-center justify-between bg-white border-gray-200  p-4 shadow-sm">
      <div> </div>
      <div>
        <span className="font-bold text-lg text-blue-400 tracking-tight">
          Text-Summerizer
        </span>
      </div>
      <div>
        {" "}
        <Link to="/logout" className="flex items-center w-full">
          <span className="">LogOut</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
