import { FiSun } from 'react-icons/fi';
import { IoIosMoon } from 'react-icons/io';
import { FaRegBell } from 'react-icons/fa';
import { CardTitle } from '@/components/ui/card';

interface ChartHeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  toggleNotifications: () => void;
  bellAnimating: boolean;
  showNotification: boolean;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  isDarkMode,
  setIsDarkMode,
  toggleNotifications,
  bellAnimating,
  showNotification,
}) => (
  <div className="flex items-center justify-between">
    <CardTitle className={isDarkMode ? 'text-white' : 'text-black'}>
      <div className="flex items-center">
        <span className={`text-3xl font-semibold ml-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Trading Logo
        </span>
      </div>
    </CardTitle>
    <div className="space-x-4 flex items-center">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`px-5 py-4 rounded-md ${
          isDarkMode
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        {isDarkMode ? <FiSun /> : <IoIosMoon />}
      </button>
      <div className="relative">
        <button
          onClick={toggleNotifications}
          className={`px-5 py-4 rounded-md ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <FaRegBell className={bellAnimating ? 'animate-bounce' : ''} />
          {showNotification && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 animate-ping" />
          )}
        </button>
      </div>
    </div>
  </div>
);