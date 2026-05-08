export function ResearchContact() {
  return (
    <footer className="rounded-3xl border border-slate-200 bg-white/85 p-5 text-sm leading-6 text-slate-600 shadow-sm">
      <h2 className="text-base font-semibold text-ink">Research contact</h2>
      <p className="mt-2 font-medium text-slate-700">Dr. Mohammad Moradi</p>
      <ul className="mt-2 space-y-1">
        <li>
          Email:{" "}
          <a className="font-medium text-research-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-research-600" href="mailto:dr.moradi@gmail.com" aria-label="Email Dr. Mohammad Moradi">
            dr.moradi@gmail.com
          </a>
        </li>
        <li>
          LinkedIn:{" "}
          <a
            className="font-medium text-research-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-research-600"
            href="https://www.linkedin.com/in/mohammad-moradik/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Dr. Mohammad Moradi on LinkedIn"
          >
            mohammad-moradik
          </a>
        </li>
      </ul>
      <p className="mt-3 max-w-4xl">
        I welcome thoughtful feedback, methodological suggestions, and collaboration inquiries. If you are interested in the project or have comments on the study design, I would be very happy to hear from you.
      </p>
    </footer>
  );
}
