import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/navbar";

function Home() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "This is a placeholder response. Your AI-generated summary will appear here.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 500);
  };

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Navbar />
      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">
                What can I help you summarize today?
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? " text-black"
                        : "bg-white text-gray-800 "
                    }`}
                  >
                    <div className="whitespace-pre-wrap wrap-break-word">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto flex gap-3 items-center"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 max-h-[200px] overflow-y-auto"
                placeholder="Type or paste your text here... (Press Enter to send, Shift+Enter for new line)"
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-blue-600 text-white font-semibold px-10 py-2 rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
