// client/src/app/join/page.tsx

import Footer from "./ui_components/Footer";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-teal-500 from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <section className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-6">
          Welcome to Vedika
        </h1>
        <p className="text-lg text-slate-300 mb-10 leading-relaxed">
          Vedika is the ultimate platform for leaders, politicians, and social activists 
          to build stronger communities. Connect directly with your followers, listen to 
          their concerns, and share your knowledge and vision effectively.
        </p>

        <div className="space-y-4">
          <a
            href="/auth/sign-up"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-black text-slate-100 font-semibold hover:bg-indigo-400 transition"
          >
            Join Vedika Now →
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
            Empower Your Voice
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Create dedicated groups to interact with your supporters. 
            Use our tools to gather feedback, understand local problems, 
            and drive meaningful social change through direct engagement.
          </p>
        </article>

        <article className="rounded-xl bg-teal-600 p-6 shadow-md shadow-slate-900">
          <h2 className="text-xl font-semibold text-slate-100 mb-2">
            Lead with Knowledge
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Educate your followers and spread awareness. Whether it's policy updates, 
            social causes, or community workshops, Vedika gives you the stage 
            to teach and inspire your audience.
          </p>
        </article>
      
      </section>
      <Footer />
    </main>
    
  );
}