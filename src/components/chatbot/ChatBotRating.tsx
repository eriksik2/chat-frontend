import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { useState } from "react";
import clsx from "clsx";
import { useSession } from "next-auth/react";

type ChatBotRatingProps = {
  ratingsCount?: number;
  rating?: number;
  yourRating?: number;
  onRate?: (rating: number) => void;
};

export default function ChatBotRating(props: ChatBotRatingProps) {
  const { data: session } = useSession();

  const rating = props.yourRating ?? props.rating ?? 0;
  const ratingType: "unrated" | "personal" | "average" | "unloaded" =
    props.yourRating ? "personal" : props.rating ? "average" : "unrated";
  const isUnrated = ratingType === "unrated";
  const isPersonal = ratingType === "personal";

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const isUnauthorized = !session || !session.user;

  if (isUnauthorized && isUnrated) return null;

  return (
    <div className="flex flex-col items-start justify-center">
      <div className="relative flex">
        <div
          className="absolute bottom-0 left-0 right-0 top-0"
          onMouseMove={(e) => {
            if (isUnauthorized) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const rating = (x / rect.width) * 5;
            const roundedRating =
              rating < 1
                ? Math.ceil(rating)
                : rating > 4
                ? Math.ceil(rating)
                : Math.round(rating);
            setHoverRating(roundedRating);
          }}
          onMouseLeave={() => setHoverRating(null)}
          onMouseOut={() => setHoverRating(null)}
          onClick={async () => {
            if (isUnauthorized) return;
            if (hoverRating !== null) {
              props.onRate?.(hoverRating);
            }
          }}
        />
        {Array(5)
          .fill(0)
          .map((_, i) => {
            var viewRating = hoverRating ? hoverRating : isUnrated ? 0 : rating;
            const isFilled = viewRating - i >= 0.8;
            const isHalfFilled = viewRating - i >= 0.3 && viewRating - i < 0.8;
            const isUnfilled = viewRating - i < 0.3;

            if (isFilled)
              return (
                <FaStar
                  key={i}
                  className={clsx(
                    "text-xl",
                    isPersonal ? "text-yellow-400" : "text-blue-500",
                  )}
                />
              );
            else if (isHalfFilled)
              return (
                <FaStarHalfStroke
                  key={i}
                  className={clsx(
                    "text-xl",
                    isPersonal ? "text-yellow-400" : "text-blue-500",
                  )}
                />
              );
            else if (isUnfilled)
              return <FaStar key={i} className="text-xl text-gray-500" />;
            return null;
          })}
      </div>
      {props.ratingsCount !== undefined && (
        <p className="text-sm text-gray-600">Ratings: {props.ratingsCount}</p>
      )}
    </div>
  );
}
