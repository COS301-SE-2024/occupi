import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useUser } from 'UserContext';

interface HeaderComponentProps {
  greeting?: string;
  welcomeMessage?: string;
  actionText?: string;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  greeting = 'Hi',
  welcomeMessage = 'Welcome to Occupi',
  actionText = 'Office bookings',
}) => {
  const { userDetails } = useUser();

  return (
    <div className="flex flex-col mt-6 gap-2 w-11/12 mr-auto ml-auto">
      <div className="w-auto h-6 text-text_col text-xl font-extralight leading-snug">
        {greeting} {userDetails?.email ?? 'Guest'} 👋
      </div>
      <div className="w-auto h-7 text-text_col text-2xl font-semibold leading-none">
        {welcomeMessage}
      </div>
      <motion.div
        whileHover={{ gap: '10px' }}
        className="flex w-full h-8 items-center text-text_col text-3xl font-semibold leading-none mt-6 cursor-pointer"
      >
        {actionText} <ChevronRight size={24} className="mt-1" />
      </motion.div>
    </div>
  );
};

export default HeaderComponent;
