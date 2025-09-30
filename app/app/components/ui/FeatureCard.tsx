interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  iconColor,
  iconBg,
}: FeatureCardProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <div
        className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center mb-6`}
      >
        <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
