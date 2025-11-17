// client/src/app/join/page.tsx

import Footer from "./ui_components/Footer";

export default function JoinPage() {
    return (
      <main className="min-h-screen bg-teal-500 from-slate-900 via-slate-800 to-slate-950 text-slate-100">
        <section className="max-w-4xl mx-auto px-4 py-24">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to Sangam
          </h1>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            Sangam is your community for connecting with groups, joining discussions,
            and building meaningful friendships. Learn about upcoming events, share
            updates, chat with peers, and grow together.
          </p>
  
          <div className="space-y-4">
            <a
              href="/auth/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-black text-slate-100 font-semibold hover:bg-indigo-400 transition"
            >
              Join Sangam Now →
            </a>
  
            <div className="text-sm text-black">
              Already a member?{' '}
              <a href="/auth/sign-in" className="text-blue-500 hover:underline">
                Sign in here
              </a>.
            </div>
          </div>
        </section>
        
        <section className="max-w-5xl mx-auto px-4 py-16 grid gap-10 md:grid-cols-2">
          <article className="rounded-xl bg-teal-600 p-6 shadow-md shadow-slate-900">
            <h2 className="text-xl font-semibold text-slate-100 mb-2">
              Why Sangam?
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Build authentic connections, participate in groups and events, and
              stay in sync with the people that matter most. Sangam brings your
              community together, in one modern social experience.
            </p>
          </article>
  
          <article className="rounded-xl bg-teal-600 p-6 shadow-md shadow-slate-900">
            <h2 className="text-xl font-semibold text-slate-100 mb-2">
              Your Journey Begins
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Visit your profile, discover groups aligned with your interests,
              and join live conversations through chat and community spaces.
              Ready to make a difference with others? Start now.
            </p>
          </article>
        
        </section>
        <Footer />
      </main>
      
    );
  }