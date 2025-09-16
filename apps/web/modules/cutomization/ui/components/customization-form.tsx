import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { widgetSettingsSchema } from "../../schemas";
import { FormSchema } from "../../types";
import { VapiFormFields } from "./vapi-form-fields";

type WidgetSettings = Doc<"widgetSettings">;

interface CustomizationFormProps {
  initialData?: WidgetSettings | null;
  hasVapiPlugin: boolean;
}

export default function CustomizationForm({
  initialData,
  hasVapiPlugin,
}: CustomizationFormProps) {
  const upsertWidgetSettings = useMutation(api.private.widgetSettings.upsert);

  const form = useForm<FormSchema>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues: {
      greetMessage: initialData?.greetMessage || "How can I help you ?",
      defaultSuggestions: initialData?.defaultSuggestions || {
        suggestion1: "",
        suggestion2: "",
        suggestion3: "",
      },
      vapiSettings: initialData?.vapiSettings || {
        assistantId: "",
        phoneNumber: "",
      },
    },
  });

  async function onSubmit(values: FormSchema) {
    try {
      const vapiSettings: WidgetSettings["vapiSettings"] = {
        assistantId:
          values.vapiSettings.assistantId === "none"
            ? ""
            : values.vapiSettings.assistantId,
        phoneNumber:
          values.vapiSettings.phoneNumber === "none"
            ? ""
            : values.vapiSettings.phoneNumber,
      };

      await upsertWidgetSettings({
        greetMessage: values.greetMessage,
        defaultSuggestions: values.defaultSuggestions,
        vapiSettings,
      });
      toast.success("Widget settings saved");
    } catch (error) {
      console.log(error);
      toast.error("Widget settings saving failed");
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-7'>
        <Card>
          <CardHeader>
            <CardTitle>General Chat Settings</CardTitle>
            <CardDescription>
              Configure basic chat widget behavior and messages
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-7'>
            <FormField
              control={form.control}
              name='greetMessage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Greet message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Welcome message shown when chat open'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The first message customers see when they open the chat.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <div className='space-y-5'>
              <div>
                <p>Default suggestions</p>
                <p className='text-sm text-muted-foreground'>
                  Quick reply suggestions shown to customers to help guide the
                  conversation
                </p>
              </div>

              <FormField
                control={form.control}
                name='defaultSuggestions.suggestion1'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggestion 1</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., How do I get started ?'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='defaultSuggestions.suggestion2'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggestion 2</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., What are your pricing plans ?'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='defaultSuggestions.suggestion3'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggestion 3</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., I need help for my account ?'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        {hasVapiPlugin && (
          <Card>
            <CardHeader>
              <CardTitle>Voice assistant settings</CardTitle>
              <CardDescription>
                Configure voice calling features powered by Vapi
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-7'>
              <VapiFormFields form={form} />
            </CardContent>
          </Card>
        )}
        <Button
          className='w-full'
          type='submit'
          disabled={form.formState.isSubmitting}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
