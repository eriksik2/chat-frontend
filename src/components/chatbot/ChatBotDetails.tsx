import { useApiGET } from "@/api/fetcher";
import { ApibotGETResponse } from "../../../pages/api/bots/[bot]";
import LoadingIcon from "../util/LoadingIcon";

type ChatBotDetailsProps = {
  id: string;
};

export default function ChatBotDetails(props: ChatBotDetailsProps) {
  const { data, error, reloading } = useApiGET<ApibotGETResponse>(
    `/api/bots/${props.id}`,
  );

  if (reloading) return <LoadingIcon />;
  if (data === undefined) return null;

  return (
    <div className="flex flex-col gap-2 bg-gradient-to-br from-slate-400/50 via-slate-300 to-slate-400/75 p-2 shadow-inner">
      <div className="text-xl">
        <h2>{data.name}</h2>
        <p className="text-sm">{data.description}</p>
      </div>
      <div className="text-base">
        <div className="flex gap-4">
          <p>Model:</p>
          <p>{data.model}</p>
        </div>
      </div>
    </div>
  );
}
