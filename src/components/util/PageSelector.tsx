import clsx from "clsx";

type PageSelectorProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;

  maxShown?: number;
};

export default function PageSelector(props: PageSelectorProps) {
  var maxShown = props.maxShown ?? 4;
  if (maxShown % 2 === 1) maxShown -= 1;
  if (maxShown <= 0) return null;
  const maxShownSided = maxShown / 2;

  const pageLowerBound = Math.max(0, props.page - (maxShownSided - 1));
  const pageUpperBound = Math.min(
    props.totalPages - 1,
    props.page + (maxShownSided - 1),
  );
  const showLeftPage = pageLowerBound > 0;
  const showLeftEllipsis = pageLowerBound > 1;
  const showRightPage = pageUpperBound < props.totalPages - 1;
  const showRightEllipsis = pageUpperBound < props.totalPages - 2;

  return (
    <div className="flex justify-center gap-2">
      {showLeftPage && (
        <button
          className="w-8 rounded bg-slate-300 text-black"
          onClick={() => props.onChange(0)}
        >
          1
        </button>
      )}
      {showLeftEllipsis && <>...</>}
      {props.totalPages > 1 &&
        Array(pageUpperBound - pageLowerBound + 1)
          .fill(0)
          .map((_, i) => {
            i += pageLowerBound;
            return (
              <button
                key={i}
                className={clsx(
                  "w-8 rounded",
                  i === props.page
                    ? "bg-blue-400 text-white"
                    : "bg-slate-300 text-black",
                )}
                onClick={() => props.onChange(i)}
              >
                {i + 1}
              </button>
            );
          })}
      {showRightEllipsis && <>...</>}
      {showRightPage && (
        <button
          className="w-8 rounded bg-slate-300 text-black"
          onClick={() => props.onChange(props.totalPages - 1)}
        >
          {props.totalPages}
        </button>
      )}
    </div>
  );
}
