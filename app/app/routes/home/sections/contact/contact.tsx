import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "~/components/accessories/Rail/Rail";
import { contact } from "~/lib/contact";

const ContactSection = () => {
  return (
    <Reveal>
      <section id="contact" className="border-t border-border/60 pt-16 sm:pt-20">
        <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">
          Have something in mind? Let's build it.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          I'm looking for software engineering roles and internships, and I'm always
          happy to talk about a good idea.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link
            to="/contact"
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Get in touch
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={`mailto:${contact.email}`}
            className="text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {contact.email}
          </a>
        </div>
      </section>
    </Reveal>
  );
};

export default ContactSection;
