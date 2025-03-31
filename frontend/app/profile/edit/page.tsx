import ProfileEditContent from "./ProfileEditContent";

export const metadata = {
  title: "Edit Profile | What's That Car",
};

export default function ProfileEdit() {
  return (
    <div className="flex flex-row justify-center items-stretch text-center overflow-x-hidden w-full">
      <ProfileEditContent />
    </div>
  );
} 