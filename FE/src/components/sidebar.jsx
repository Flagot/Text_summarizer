import { Link } from "react-router-dom";

import logo from "../assets/logo.png";

const Sidebar = () => {
  return (
    <div
      className={`sticky top-0 text-blue-400 border border-gray-200 h-screen pt-3 p-2 w-64`}
    >
      <div className=" flex justify-between items-center mb-4">
        <div>
          <Link to="/">
            <img src={logo} alt="img" className="mr-2 w-8" />
          </Link>
        </div>
        <div>
          <h1 className="font-bold text-lg text-blue-400 tracking-tight pb-2 pr-2">
            History
          </h1>
        </div>
      </div>
      <h3>Your chat</h3>

      <ul className="space-y-2 flex flex-col justify-between h-11/12">
        <div>
          <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center">
            <Link to="/" className="flex items-center w-full">
              <span className="">History one you asked about...</span>
            </Link>
          </li>
          <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center">
            <Link to="/ai" className="flex items-center w-full">
              <span className="">Your AI-generated summary..</span>
            </Link>
          </li>
          <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center">
            <Link to="/score" className="flex items-center w-full">
              <span className="">Your original text shown... </span>
            </Link>
          </li>
          <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center">
            <Link to="/flash" className="flex items-center w-full">
              <span className="">Flash Card</span>
            </Link>
          </li>
          <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center">
            <Link to="/order" className="flex items-center w-full">
              <span className="">Order History</span>
            </Link>
          </li>
        </div>
      </ul>
    </div>
  );
};

export default Sidebar;
