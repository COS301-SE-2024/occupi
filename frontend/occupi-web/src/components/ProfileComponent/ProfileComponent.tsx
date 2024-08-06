import "daisyui/dist/full.css";

type ProfileComponentProps = {
  profileImage?: string;
  email?: string;
  name?: string;
  officeStatus?: "in" | "out" | "booked";
};

const ProfileComponent = ({
  profileImage = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg",
  email = "defaultEmail@example.com",
  name = "Janet Doey",
  officeStatus = "in",
}: ProfileComponentProps) => {
  const getStatusBadge = (status: "in" | "out" | "booked") => {
    let colorClass: string;
    let text: string;

    switch (status) {
      case "in":
        colorClass = "badge-success";
        text = "In Office";
        break;
      case "out":
        colorClass = "badge-error";
        text = "Out of Office";
        break;
      case "booked":
        colorClass = "badge-warning";
        text = "Booked";
        break;
      default:
        colorClass = "badge-info";
        text = "Unknown";
    }

    return <div className={`badge ${colorClass}`}>{text}</div>;
  };

  return (
    <div data-testid="profile" className="flex items-center space-x-4">
      <div className="avatar online">
        <div className="w-24 rounded-full">
          <img src={profileImage} alt="Profile" />
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-semibold">{name}</h2>
        <h3 className="text-sm text-secondary_alt">
          <a href={`mailto:${email}`} title="Click to email">{email}</a>
        </h3>
        {getStatusBadge(officeStatus)}
      </div>
    </div>
  );
};

export default ProfileComponent;