import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-white text-gray-900 scroll-smooth">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">QueryNest</h1>
          <nav className="space-x-4">
            <a href="#features" className="hover:text-blue-500 transition">Features</a>
            <a href="#how-it-works" className="hover:text-blue-500 transition">How It Works</a>
            <a href="#testimonials" className="hover:text-blue-500 transition">Testimonials</a>
            <a href="#get-started" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Get Started</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-50 py-20 text-center px-4">
        <h2 className="text-4xl font-extrabold mb-4">Your Developer Questions, Answered.</h2>
        <p className="text-lg text-gray-700 max-w-xl mx-auto mb-6">
          QueryNest is where developers help each other solve real coding problems, fast.
        </p>
        <div className="space-x-4">
          <Link href="questions/askQuestion" className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition">Ask a Question</Link>
          <Link href="/questions" className="border border-blue-600 text-blue-600 px-6 py-3 rounded hover:bg-blue-100 transition">Explore Questions</Link>
        </div>
        <div className="mt-10 text-6xl">👨‍💻</div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 text-center" id="problem">
        <h3 className="text-3xl font-bold mb-4">Why QueryNest?</h3>
        <p className="text-gray-700 max-w-2xl mx-auto text-lg">
          Stuck on bugs? StackOverflow too intimidating? QueryNest offers a friendly, fast-growing dev community where no question is too small.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 px-4" id="features">
        <h3 className="text-3xl font-bold text-center mb-10">Features You&apos;ll Love</h3>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-2">💬</div>
            <h4 className="text-xl font-semibold mb-2">Ask and Answer in Real-Time</h4>
            <p className="text-gray-600">Get or give help instantly in a collaborative, welcoming space.</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-2">🏷️</div>
            <h4 className="text-xl font-semibold mb-2">Tag-Based Search</h4>
            <p className="text-gray-600">Find questions and solutions faster with smart, searchable tags.</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-2">🎖️</div>
            <h4 className="text-xl font-semibold mb-2">Reputation System</h4>
            <p className="text-gray-600">Earn badges and build credibility as you contribute to the community.</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-2">🧘</div>
            <h4 className="text-xl font-semibold mb-2">Distraction-Free Interface</h4>
            <p className="text-gray-600">Focus on learning and helping with our clean, minimal design.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4" id="how-it-works">
        <h3 className="text-3xl font-bold text-center mb-10">How It Works</h3>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl mb-4">❓</div>
            <h4 className="text-xl font-semibold mb-2">1. Ask</h4>
            <p className="text-gray-600">Post your question with clear tags and details.</p>
          </div>
          <div>
            <div className="text-5xl mb-4">⚡</div>
            <h4 className="text-xl font-semibold mb-2">2. Get Answers</h4>
            <p className="text-gray-600">Receive fast responses from fellow developers.</p>
          </div>
          <div>
            <div className="text-5xl mb-4">✅</div>
            <h4 className="text-xl font-semibold mb-2">3. Mark Solution</h4>
            <p className="text-gray-600">Choose the best answer and help others learn.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 px-4" id="testimonials">
        <h3 className="text-3xl font-bold text-center mb-10">What Developers Are Saying</h3>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="italic text-gray-700">&quot;QueryNest makes asking questions feel safe again. The community is super helpful!&quot;</p>
            <p className="mt-2 text-sm text-gray-500">— Aman, Full Stack Developer</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="italic text-gray-700">&quot;I solved a blocker in 10 minutes that would&apos;ve taken hours elsewhere."</p>
            <p className="mt-2 text-sm text-gray-500">— Priya, CS Student</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 text-center px-4 bg-blue-600 text-white" id="get-started">
        <h3 className="text-3xl font-bold mb-4">Join the QueryNest Community Today</h3>
        <p className="mb-6 text-lg">Start asking questions, sharing answers, and building your dev profile.</p>
        <a href="/ask" className="bg-white text-blue-600 px-8 py-3 font-semibold rounded hover:bg-gray-100 transition">Ask Your First Question</a>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 bg-gray-100">
        © {new Date().getFullYear()} QueryNest. Built with ❤️ for developers.
      </footer>
    </main>
  );
}
