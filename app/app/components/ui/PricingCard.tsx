interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  savings?: string;
}

export default function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  isPopular = false,
  savings,
}: PricingCardProps) {
  return (
    <div
      className={`bg-white border-2 ${
        isPopular ? "border-blue-500" : "border-gray-200"
      } rounded-lg p-8 relative ${isPopular ? "transform scale-105" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600">/{period}</span>
        </div>
        <p className="text-gray-600 mb-8">{description}</p>
        {savings && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
            {savings}
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full ${
          isPopular
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-900 hover:bg-gray-800"
        } text-white py-3 rounded-lg font-semibold transition-colors`}
      >
        {buttonText}
      </button>
    </div>
  );
}
