import PrivacyPolicyContent from "./PrivacyPolicyContent";

export const metadata = {
  title: "Privacy Policy | What's That Car",
};

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-row justify-center items-start text-left overflow-x-hidden w-full">
      <PrivacyPolicyContent />
    </div>
  );
}
