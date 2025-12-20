import { Link } from "react-router-dom";
import { BsCheck2Square } from "react-icons/bs";
import logo from "../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMessages,
  clearInputText,
  addHistory,
} from "../state/messagesSlice";

const Sidebar = () => {
  const messages = useSelector((state) => state.messages.messages);
  const inputText = useSelector((state) => state.messages.inputText ?? "");
  const history = useSelector((state) => state.messages.history ?? []);
  const dispatch = useDispatch();
  const chat = messages?.map((msg) => msg.content);
  const partChat = chat[0]?.slice(0, 32) ?? "";
  const pathis = history?.map((his) => his.content) ?? [];
  const pathis2 = pathis.map((his) => his[0]?.content);
  const pathis3 = pathis2.map((his) => his?.slice(0, 32) ?? "");

  //   console.log(messages);
  //   console.log(chat);
  //   console.log(partChat);
  //   console.log(inputText);
  console.log(pathis);
  console.log(pathis2);
  console.log(pathis3);
  //   console.log(history);
  const handleClick = () => {
    dispatch(clearInputText());
    dispatch(clearMessages());
    dispatch(addHistory({ id: Date.now(), content: messages }));
  };

  return (
    <div
      className={`sticky top-0 text-blue-400 border border-gray-200 h-screen pt-3 p-2 w-64 flex flex-col`}
    >
      <div className=" flex justify-between items-center mb-4 flex-shrink-0">
        <div>
          <Link to="/">
            <img src={logo} alt="img" className="mr-2 w-8" />
          </Link>
        </div>
        <div>
          <button
            onClick={handleClick}
            className=" text-blue-400 tracking-tight pb-2 pr-2 flex items-center cursor-pointer"
          >
            <BsCheck2Square className="mr-1" />
            <span> New Chat</span>
          </button>
        </div>
      </div>
      <h3 className="flex-shrink-0 pb-2 font-bold">Your chat</h3>
      <ul className="space-y-2 flex flex-col overflow-y-auto flex-1 min-h-0">
        {pathis3.map((his, index) => (
          <li
            key={index}
            className="hover:bg-gray-100 rounded cursor-pointer flex items-center flex-shrink-0"
          >
            <Link to="/" className="flex items-center w-full">
              <span className="">{his.slice(0, 32)}...</span>
            </Link>
          </li>
        ))}
      </ul>
      {/* <ul className="space-y-2 flex flex-col justify-between h-11/12">
        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center">
          <Link to="/" className="flex items-center w-full">
            <span className="">{`${partChat}...`}</span>
          </Link>
        </li>
      </ul> */}
    </div>
  );
};

export default Sidebar;
