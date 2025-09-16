"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  GlobeIcon,
  PhoneCallIcon,
  PhoneIcon,
  WorkflowIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Feature, PluginCard } from "../components/plugin-card";
// import VapiConnectedView from "./vapi-connected-view";
import { api } from "@workspace/backend/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { VapiConnectedView } from "../components/vapi-connect-view";

const vapiFeatures: Feature[] = [
  {
    icon: GlobeIcon,
    label: "Web Voice calls",
    description: "Voice chat directly in your app",
  },
  {
    icon: PhoneIcon,
    label: "Phone numbers",
    description: "Get dedicated business lines",
  },
  {
    icon: PhoneCallIcon,
    label: "Outbound calls",
    description: "Automated customer outreach",
  },
  {
    icon: WorkflowIcon,
    label: "Workflows",
    description: "Custom conversation workflows",
  },
];

const formSchema = z.object({
  publicApiKey: z.string().min(1, { message: "Public API key is required" }),
  privateApiKey: z.string().min(1, { message: "Private API key is required" }),
});

const VapiPluginForm = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}) => {
  const upsertSecret = useMutation(api.private.secrets.upsertBothKeys);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicApiKey: "",
      privateApiKey: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      upsertSecret({
        keys: {
          publicKey: values.publicApiKey,
          privateKey: values.privateApiKey,
        },
        service: "vapi",
      });

      toast.success("Vapi API keys configured successfully!");
    } catch (error: any) {
      // More specific error handling
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You don't have permission to configure API keys");
      } else if (error.data?.code === "NOT_FOUND") {
        toast.error("Organization not found");
      } else {
        toast.error("Failed to save API keys");
        console.error("Vapi key configuration error:", error);
      }
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Vapi</DialogTitle>
          <DialogDescription>
            Your API keys are safely encrypted and stored using AWS Secrets
            manager.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='publicApiKey'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter Vapi public API key'
                      {...field}
                      type='password'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='privateApiKey'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Private Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter Vapi private API key'
                      type='password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full'
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Connecting..." : "Connect"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const VapiPluginRemoveForm = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}) => {
  const removePlugin = useMutation(api.private.plugins.remove);

  const onSubmit = async () => {
    try {
      await removePlugin({
        service: "vapi",
      });
      toast.success("Vapi plugin disconnected successfully!");
    } catch (error) {
      toast.error("Failed to disconnect Vapi plugin");
      console.error(error);
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disconnect Vapi</DialogTitle>
          <DialogDescription>
            Are you sure ? This cannot be undone later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant={"outline"}>
            Cancel
          </Button>
          <Button onClick={onSubmit} variant={"destructive"}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export const VapiView = () => {
  const vapiPlugin = useQuery(api.private.plugins.getOne, {
    service: "vapi",
  });

  const [connectOpen, setConnectOpen] = useState(false);

  const [removeOpen, setRemoveOpen] = useState(false);

  const handleSubmit = () => {
    if (vapiPlugin) setRemoveOpen(true);
    else setConnectOpen(true);
  };

  return (
    <>
      <VapiPluginForm open={connectOpen} onOpenChange={setConnectOpen} />
      <VapiPluginRemoveForm open={removeOpen} onOpenChange={setRemoveOpen} />
      <div className='flex min-h-screen flex-col p-8 bg-muted'>
        <div className='max-w-screen-md w-full mx-auto'>
          <div className='space-y-2'>
            <h1 className='text-xl font-bold sm:text-2xl'>Vapi Plugin</h1>
            <p className='text-muted-foreground'>
              Connect Vapi to enable AI voice calls and phone support
            </p>
          </div>
          <div className='mt-8'>
            {vapiPlugin ? (
              <VapiConnectedView onDisconnect={handleSubmit} />
            ) : (
              <PluginCard
                serviceImage='/logo.svg'
                features={vapiFeatures}
                serviceName='Vapi'
                isDisabled={vapiPlugin === undefined}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
