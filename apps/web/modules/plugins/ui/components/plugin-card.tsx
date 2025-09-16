import { Button } from "@workspace/ui/components/button";
import { ArrowLeftRightIcon, LucideIcon, PlugIcon } from "lucide-react";
import Image from "next/image";

export interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
}

interface PluginCardProps {
  isDisabled?: boolean;
  serviceName: string;
  serviceImage: string;
  features: Feature[];
  onSubmit: () => void;
}
export const PluginCard = ({
  isDisabled,
  serviceImage,
  serviceName,
  features,
  onSubmit,
}: PluginCardProps) => {
  return (
    <div className='h-fit w-full rounded-lg border bg-background p-8'>
      <div className='flex justify-center items-center gap-6'>
        <div className='flex flex-col items-center'>
          <Image
            className='rounded object-contain'
            alt={serviceName}
            src={serviceImage}
            height={40}
            width={40}
          />
        </div>

        <div className='flex flex-col items-center gap-1'>
          <ArrowLeftRightIcon />
        </div>

        <div className='flex flex-col items-center'>
          <Image
            className='object-contain'
            alt='Platform'
            src='/logo.svg'
            height={40}
            width={40}
          />
        </div>
      </div>
      <div className='mb-6 text-center'>
        <p className='text-lg'>Connect your {serviceName} account</p>
      </div>

      <div className='mb-6'>
        <div className='space-y-6'>
          {features.map((feature) => (
            <div
              className='flex items-center gap-3 text-muted-foreground'
              key={feature.label}
            >
              <span className='bg-muted p-2 rounded-md border'>
                <feature.icon />
              </span>
              <div>
                <p className='text-black'>{feature.label}</p>
                <p className='text-sm'>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button className='size-full' disabled={isDisabled} onClick={onSubmit}>
        CONNECT
        <PlugIcon />
      </Button>
    </div>
  );
};
