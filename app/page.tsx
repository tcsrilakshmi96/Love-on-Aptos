import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            💝 Love on Aptos
          </div>
          <Link
            href="/auth"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Find Your Perfect Match
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4">
            Connect with like-minded souls on the Aptos blockchain
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Experience the future of dating with blockchain-powered matching. 
            Secure, transparent, and built for meaningful connections.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link
              href="/auth"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold text-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Matching →
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-full border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold text-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
            >
              Learn More
            </Link>
          </div>

          {/* Features */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mt-32">
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-pink-200 dark:border-pink-800">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is protected on the Aptos blockchain with end-to-end encryption
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200 dark:border-purple-800">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Verified Profiles
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with verified Twitter profiles for authentic connections
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Smart Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered algorithm finds your perfect match based on interests and values
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-20 text-center text-gray-600 dark:text-gray-400">
        <p>Built with ❤️ on Aptos</p>
      </footer>
    </div>
  );
}
