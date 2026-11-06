import ScreenFrame from "../components/ScreenFrame";
import { HEADLINE, SUMMARY, SKILLS, JOBS, PROJECTS, EDUCATION } from "../data/resume";

function ResumeScreen() {
  return (
    <ScreenFrame 
    title="Welcome to my career"
    action={
      <a className="download" href="/Zachary_Davis_Resume.pdf" download>
        ⬇ DOWNLOAD PDF
      </a>
    }
    >
      <p className="resume-headline">{HEADLINE}</p>
      <p>{SUMMARY}</p>

      <section className="resume-section">
        <h2>EXPERIENCE</h2>
        {JOBS.map((job) => (
        <article key={job.title} className="job">
          <h3>{job.title}</h3>
          <p className="job-meta">
            {job.company} · {job.location} · {job.dates}
          </p>
          <ul>
            {job.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>))}
      </section>

      <section className="resume-section">
        <h2>SKILLS</h2>
        {SKILLS.map((group) => (
          <p key={group.category}>
            <strong>{group.category}:</strong> {group.items}
          </p>
        ))}
      </section>

      <section className="resume-section">
        <h2>PROJECTS</h2>
        {PROJECTS.map((project) => (
          <article key={project.name} className="job">
            <h3>{project.name}</h3>
            <p className="job-meta">{project.tech}</p>
            <p>{project.description}</p>
          </article>
        ))}
      </section>

      <section className="resume-section">
        <h2>EDUCATION & CERTIFICATIONS</h2>
        <ul>
          {EDUCATION.map((item) => (
          <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </ScreenFrame>
  );
}
export default ResumeScreen;