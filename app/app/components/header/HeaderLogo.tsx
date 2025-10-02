import Link from "next/link";

export default function HeaderLogo() {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-gray-300">Tailor</span>Apply
          </h1>
        </Link>
      </div>
    </div>
  );
}
