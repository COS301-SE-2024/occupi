import "daisyui/dist/full.css";


type ProfileComponentProps = {
  profileImage?: string;
  email?: string;
  name?: string;
};

const ProfileComponent = ({
  profileImage = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg",
  email = "defaultEmail@example.com",
  name = "Janet Doey",
}: ProfileComponentProps) => {
  return (
    <div data-testid="profile">
      <div className="avatar online">
        <div className="w-24 rounded-full">
          <img src={profileImage} alt="Profile" />
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
