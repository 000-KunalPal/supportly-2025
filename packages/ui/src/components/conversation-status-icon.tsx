import { cn } from "@workspace/ui/lib/utils";
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";

interface Props {
  status: "resolved" | "escalated" | "unresolved";
}

const statusConfig = {
  resolved: {
    icon: CheckIcon,
    bgColor: "bg-[#3FB62F]",
  },
  unresolved: {
    icon: ArrowRightIcon,
    bgColor: "bg-destructive",
  },
  escalated: {
    icon: ArrowUpIcon,
    bgColor: "bg-yellow-500",
  },
};

export const ConversationStatusIcon = ({ status }: Props) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        config.bgColor,
        "flex justify-center items-center p-1.5 rounded-full"
      )}
    >
      <Icon className='size-3 stroke-3 text-white' />
    </div>
  );
};
