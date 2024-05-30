
import PropTypes from "prop-types";

export const CheckSquareContained = ({ color = "black", className }: { color?: string, className: string }) => {
  return (
    <svg
      className={`check-square-contained ${className}`}
      fill="none"
      height="24"
      viewBox="0 0 29 24"
      width="29"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M17.9745 9.99997L12.6125 13.9999L10.7847 12.6365M23.966 6.99998L23.966 17C23.966 18.6569 22.3565 20 20.3711 20H8.38811C6.4027 20 4.79321 18.6569 4.79321 17V6.99998C4.79321 5.34314 6.4027 4 8.38811 4H20.3711C22.3565 4 23.966 5.34314 23.966 6.99998Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

CheckSquareContained.propTypes = {
  color: PropTypes.string,
};
