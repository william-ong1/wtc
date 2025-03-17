// Feature card components
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  large: boolean;
}

const FeatureCard = ({ icon, title, description, large }: FeatureCardProps) => (
  <div className="flex flex-col items-center gap-2 p-4 bg-gray-900/40 rounded-xl backdrop-blur-sm border border-white/10 transform transition-all duration-300 ease-in-out hover:scale-[1.01]">
    <div className={large ? "text-2xl lg:text-4xl mb-2" : "text-lg lg:text-2xl mb-2"}> {icon} </div>
    <div className={large ? "text-md font-medium" : "text-xs lg:text-sm font-medium"}> {title} </div>
    <div className={large ? "text-sm text-gray-400 text-center" : "text-[0.7rem] lg:text-xs text-gray-400 text-center"}> {description}</div>
  </div>
);

// Stat card component
interface StatCardProps {
  stat: string;
  criteria: string;
  superscript?: string;
}

const StatCard = ({ stat, criteria, superscript }: StatCardProps) => (
  <div className="flex flex-col items-center">
    <span className="text-lg lg:text-xl font-bold text-blue-500"> {stat}{superscript && <sup className="text-[0.7rem]">{superscript} </sup>} </span>
    <span> {criteria} </span>
  </div>
);

export { FeatureCard, StatCard };
