import ProfileContent from "./ProfileContent";

export const metadata = {
  title: "Profile | What's That Car",
};

export default function Profile() {
  return (
    <div className="flex flex-row justify-center items-stretch text-center overflow-x-hidden w-full">
      <ProfileContent />
    </div>
  );
}
