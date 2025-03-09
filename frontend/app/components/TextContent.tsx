import CarInfo from "./CarInfo";

type CarInfo = {
  make: string;
  model: string;
  color: string;
  year: string;
  rarity: string;
};

const TextContent = () => {
  return (
    <div className="flex flex-col flex-1 w-full items-center justify-center w-full h-full p-8 text-lg gap-8">
      From regular traffic to 1-of-1 cars, WTC can detect any car brand from [insert year] with ___* accuracy. Don’t believe us? Give us a try!

      <CarInfo make="N/A" model="N/A" color="N/A" year="N/A" rarity="N/A"/>
    </div>
  )
};

export default TextContent;