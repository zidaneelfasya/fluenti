
import { BotMessageSquare, MessageSquare } from "lucide-react";


const NoChatpage = () => {


  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-4 h-16">
        <h1 className="text-xl font-bold ml-4">Chat</h1>
      </header>
      <div className="w-full flex flex-1 flex-col items-center justify-center p-16">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce"
            >
              <img className="transform scale-50" src="/logo.png" alt="" />
              {/* <BotMessageSquare className="w-8 h-8 text-primary " /> */}
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Fluenti!</h2>
        <p className="text-base-content/60">
          Select Thread or Create a new Thread to Start Chatting
        </p>
      </div>
    </div>
      
    </div>
  );
};

export default NoChatpage;