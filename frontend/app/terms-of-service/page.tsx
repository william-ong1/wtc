import TermsOfServiceContent from "./TermsOfServiceContent";

export const metadata = {
  title: "Terms of Service | What's That Car",
};

export default function TermsOfService() {
  return (
    <div className="flex flex-row justify-center items-start text-left overflow-x-hidden w-full pb-8">
      <TermsOfServiceContent />
    </div>
  );
}
