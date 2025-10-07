import Link from 'next/link';

export default function HeaderLogo() {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Link href="/" className="hover:globe transition-opacity">
          <h1 className="text-2xl font-bold text-white">
            <span className="relative">
              <span className="relative bg-gradient-to-r hover:scale-105 font-bold from-cyan-600 to-cyan-400 bg-clip-text text-transparent hover:from-cyan-400 hover:to-cyan-100 transition-colors duration-700 ease-in-out">
                genRudar
              </span>
            </span>
          </h1>
        </Link>
      </div>
    </div>
  );
}
