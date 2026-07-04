import StackCard from "../../../../components/accessories/StackCard";
import { Reveal, SectionHeader } from "../../../../components/accessories/Rail/Rail";
import { useContextHook } from "../../../../components/accessories/context/Context";

const StackSection = () => {
  const { stack } = useContextHook();
  if (!stack.length) return null;

  return (
    <section id="stack" className="space-y-4">
      <SectionHeader title="Stack & tooling" to="/stack" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stack.map((item, i) => (
          <Reveal key={item.id} delay={Math.min(i * 0.07, 0.28)} className="min-w-0">
            <StackCard to={`/stack/${item.id}`} item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default StackSection;
