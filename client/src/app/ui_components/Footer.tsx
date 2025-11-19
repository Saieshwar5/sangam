export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-slate-100 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4">
        <section>
          <h2 className="text-lg font-semibold text-indigo-200">Vedika</h2>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Vedika empowers leaders and activists to connect with their communities. 
            A space to listen, educate, and solve problems together for a better tomorrow.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Platform
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href="/about" className="hover:text-indigo-300 transition">
                About Vedika
              </a>
            </li>
            <li>
              <a href="/join" className="hover:text-indigo-300 transition">
                Start a Community
              </a>
            </li>
            <li>
              <a href="/careers" className="hover:text-indigo-300 transition">
                Careers
              </a>
            </li>
            <li>
              <a href="/press" className="hover:text-indigo-300 transition">
                Press & Media
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Resources
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href="/blog" className="hover:text-indigo-300 transition">
                Leader's Blog
              </a>
            </li>
            <li>
              <a
                href="/support"
                className="hover:text-indigo-300 transition"
              >
                Help Center
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-indigo-300 transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-indigo-300 transition">
                Terms of Service
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href="mailto:hello@vedika.com"
                className="hover:text-indigo-300 transition"
              >
                hello@vedika.com
              </a>
            </li>
            <li>
              <span className="text-slate-300">
                100 Leadership Avenue<br />
                Hyderabad, India
              </span>
            </li>
            <li>
              <a
                href="tel:+911234567890"
                className="hover:text-indigo-300 transition"
              >
                +91 12345 67890
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {year} Vedika Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-indigo-300 transition">
              Privacy
            </a>
            <a href="/terms" className="hover:text-indigo-300 transition">
              Terms
            </a>
            <a href="/cookies" className="hover:text-indigo-300 transition">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
