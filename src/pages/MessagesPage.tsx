import React from 'react';
import { Archive, Bookmark, Edit, Info, Search, Send, Star, Trash } from 'lucide-react';

const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Messages</h2>
          <p className="text-secondary-500">Communicate with renters and staff</p>
        </div>
        
        <button className="btn btn-primary flex items-center gap-2">
          <Edit size={16} />
          <span>Compose</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 dashboard-card pt-0 overflow-hidden">
          <div className="p-4 bg-primary-50 border-b border-primary-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col divide-y">
            <button className="flex items-center px-4 py-3 hover:bg-primary-50 transition-colors text-left">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img 
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300" 
                  alt="Maria Garcia" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 className="text-sm font-semibold text-secondary-900 truncate">Maria Garcia</h4>
                  <span className="text-xs text-secondary-500">10:23 AM</span>
                </div>
                <p className="text-sm text-secondary-600 truncate">I'll be checking out next Monday...</p>
              </div>
              <div className="ml-2 w-2 h-2 bg-primary-400 rounded-full"></div>
            </button>
            
            <button className="flex items-center px-4 py-3 hover:bg-primary-50 transition-colors text-left">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img 
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300" 
                  alt="Alex Johnson" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 className="text-sm font-semibold text-secondary-900 truncate">Alex Johnson</h4>
                  <span className="text-xs text-secondary-500">Yesterday</span>
                </div>
                <p className="text-sm text-secondary-600 truncate">The air conditioning is not working...</p>
              </div>
            </button>
            
            <button className="flex items-center px-4 py-3 hover:bg-primary-50 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
                <span className="text-secondary-600 font-medium">JS</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 className="text-sm font-semibold text-secondary-900 truncate">John Smith</h4>
                  <span className="text-xs text-secondary-500">Apr 28</span>
                </div>
                <p className="text-sm text-secondary-600 truncate">Thanks for the quick response...</p>
              </div>
            </button>
            
            <button className="flex items-center px-4 py-3 hover:bg-primary-50 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
                <span className="text-secondary-600 font-medium">MM</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 className="text-sm font-semibold text-secondary-900 truncate">Maintenance Manager</h4>
                  <span className="text-xs text-secondary-500">Apr 25</span>
                </div>
                <p className="text-sm text-secondary-600 truncate">Room 202 maintenance is complete.</p>
              </div>
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-3 dashboard-card p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img 
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300" 
                  alt="Maria Garcia" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-md font-semibold text-secondary-900">Maria Garcia</h3>
                <p className="text-xs text-secondary-500">Room #201 • Online</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-gray-100 rounded-full">
                <Info size={18} />
              </button>
              <button className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-gray-100 rounded-full">
                <Star size={18} />
              </button>
              <button className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-gray-100 rounded-full">
                <Archive size={18} />
              </button>
              <button className="p-2 text-danger-400 hover:text-danger-500 hover:bg-danger-400/10 rounded-full">
                <Trash size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <img 
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300" 
                  alt="Maria Garcia" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-gray-100 rounded-lg rounded-tl-none p-3 max-w-[75%]">
                <p className="text-sm text-secondary-900">Hello, I wanted to let you know that I'll be checking out next Monday. Is there anything specific I need to do before leaving?</p>
                <span className="text-xs text-secondary-500 mt-1 block">10:23 AM</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-primary-100 rounded-lg rounded-tr-none p-3 max-w-[75%]">
                <p className="text-sm text-secondary-900">Hi Maria, thanks for letting me know. Yes, there are a few things to take care of before checkout:</p>
                <ul className="list-disc ml-5 text-sm text-secondary-900 mt-1">
                  <li>Please remove all personal belongings</li>
                  <li>Clean the refrigerator</li>
                  <li>Drop the keys at the front desk</li>
                </ul>
                <span className="text-xs text-secondary-500 mt-1 block">10:30 AM</span>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <img 
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300" 
                  alt="Maria Garcia" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-gray-100 rounded-lg rounded-tl-none p-3 max-w-[75%]">
                <p className="text-sm text-secondary-900">Great, I'll take care of everything. Also, is it possible to have my security deposit refunded to my bank account instead of a check?</p>
                <span className="text-xs text-secondary-500 mt-1 block">10:35 AM</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary-400 text-white rounded-full hover:bg-primary-500">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;