import { Link } from "react-router";
import StackCard from "../../../../components/accessories/StackCard";
import { useContextHook } from "../../../../components/accessories/context/Context";

const StackSection = () => {
  const { stack } = useContextHook();
  if (!stack.length) return null;

  return (
    <section id="stack" className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Stack & tooling</h2>
        <Link
          to="/stack"
          className="text-xs font-medium text-primary hover:underline"
        >
          View more
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stack.map((item) => (
          <div key={item.id} className="min-w-0">
            <StackCard to={`/stack/${item.id}`} item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default StackSection;

