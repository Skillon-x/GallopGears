import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  PaperAirplaneIcon, 
  ChevronLeftIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

const ChatSystem = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    fetchConversations();
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      // Poll for new messages every 3 seconds
      pollInterval.current = setInterval(() => {
        fetchMessages(activeChat.id);
      }, 3000);
    }
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [activeChat]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chats/conversations/${user.id}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chats/${chatId}/messages`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/chats/${activeChat.id}/messages`, {
        senderId: user.id,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(activeChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg min-h-[600px]">
        <div className="grid grid-cols-12 h-[600px]">
          {/* Conversations List */}
          <div className="col-span-4 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Messages</h2>
            </div>
            <div className="overflow-y-auto h-[calc(600px-4rem)]">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${
                    activeChat?.id === conv.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    <div>
                      <h3 className="font-medium">
                        {conv.otherUser.name || conv.otherUser.email}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden mr-2"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {activeChat.otherUser.name || activeChat.otherUser.email}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {activeChat.horseDetails?.name 
                        ? `Regarding: ${activeChat.horseDetails.name}`
                        : ''}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-4 overflow-y-auto h-[calc(600px-8rem)]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.senderId === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === user.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p>{message.content}</p>
                        <span className="text-xs opacity-75">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="input-field flex-1"
                    />
                    <button
                      type="submit"
                      className="btn-primary px-4"
                      disabled={!newMessage.trim()}
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem; 