import { useApiGET, useApiPOST } from "@/api/fetcher";
import { ApiBotRateGETResponse, ApiBotRatePOSTBody, ApiBotRatePOSTResponse } from "../../../pages/api/bots/[bot]/rate";

import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { useState } from "react";
import clsx from "clsx";

type ChatBotRatingProps = {
    id: string;
};

export default function ChatBotRating(props: ChatBotRatingProps) {
    const { data, error, reloading } = useApiGET<ApiBotRateGETResponse>(`/api/bots/${props.id}/rate`);
    const { post: setRating, error: setRatingError } = useApiPOST<ApiBotRatePOSTBody, ApiBotRatePOSTResponse>(`/api/bots/${props.id}/rate`);
    const rating = data?.yourRating ?? data ? data.average.ratingsTotal / data.average.ratingsCount : 0;
    const ratingType: "unrated" | "personal" | "average" | "unloaded" = data === undefined ? "unloaded" : data.yourRating ? "personal" : data.average.ratingsCount > 0 ? "average" : "unrated";
    const isUnrated = ratingType === "unrated";
    const isPersonal = ratingType === "personal";

    const [hoverRating, setHoverRating] = useState<number | null>(null);

    return <div className="flex flex-col items-start justify-center">
        <div className="flex relative">
            <div
                className="absolute top-0 bottom-0 left-0 right-0"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const rating = x / rect.width * 5;
                    const roundedRating = rating < 1 ? Math.ceil(rating) : rating > 4 ? Math.ceil(rating) : Math.round(rating);
                    console.log(roundedRating);
                    setHoverRating(roundedRating);
                }}
                onMouseLeave={() => setHoverRating(null)}
                onMouseOut={() => setHoverRating(null)}
                onClick={async () => {
                    if (hoverRating !== null) {
                        await setRating({ rating: hoverRating });
                    }
                }}
            />
            {Array(5).fill(0).map((_, i) => {
                var viewRating = hoverRating ? hoverRating : isUnrated ? 0 : rating;
                const isFilled = viewRating - i >= 0.8;
                const isHalfFilled = viewRating - i >= 0.3 && viewRating - i < 0.8;
                const isUnfilled = viewRating - i < 0.3;

                return <div key={i} className="text-xl">
                    {isFilled && <FaStar className={clsx(
                        isPersonal ? "text-yellow-500" : "text-blue-500",
                    )} />}
                    {isHalfFilled && <FaStarHalfStroke className={clsx(
                        isPersonal ? "text-yellow-500" : "text-blue-500",
                    )} />}
                    {isUnfilled && <FaStar className="text-gray-500" />}
                </div>;
            })}
        </div>
        {data && <p className="text-sm text-gray-600">Ratings: {data!.average.ratingsCount}</p>}
    </div>;
}