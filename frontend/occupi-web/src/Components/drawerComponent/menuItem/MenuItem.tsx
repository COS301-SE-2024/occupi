interface MenuItemProps {
    icon: JSX.Element;
    text: string;
    additionalClasses?: string;
  }
  
  const MenuItem = ({ icon, text, additionalClasses }: MenuItemProps) => (
    <li>
      <a className={`flex items-center gap-4 p-2 rounded-lg hover:bg-gray-200 ${additionalClasses}`}>
        {icon}
        <span className="text-base font-medium">{text}</span>
      </a>
    </li>
  );
  
  export default MenuItem;
  