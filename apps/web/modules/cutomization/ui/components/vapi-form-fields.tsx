import { UseFormReturn } from "react-hook-form";

import {
  useVapiAssistants,
  useVapiPhoneNumbers,
} from "@/modules/plugins/hooks/use-vapi-data";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FormSchema } from "../../types";

interface VapiFormFieldsProps {
  form: UseFormReturn<FormSchema>;
}

export const VapiFormFields = ({ form }: VapiFormFieldsProps) => {
  const { data: assistants, isLoading: assistantsLoading } =
    useVapiAssistants();
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } =
    useVapiPhoneNumbers();

  return (
    <>
      <FormField
        control={form.control}
        name='vapiSettings.assistantId'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Voice assistant</FormLabel>
            <FormControl>
              <Select
                disabled={assistantsLoading || form.formState.isSubmitting}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        assistantsLoading
                          ? "Loading assistants"
                          : "Select an assistant"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {assistants?.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name || "Unnamed assistant"} -{" "}
                      {assistant.model?.model || "Unknown model"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              The Vapi assistant to use for voice calls
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='vapiSettings.phoneNumber'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Voice assistant</FormLabel>
            <FormControl>
              <Select
                disabled={phoneNumbersLoading || form.formState.isSubmitting}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        assistantsLoading
                          ? "Loading assistants"
                          : "Select an assistant"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {phoneNumbers?.map((phone) => (
                    <SelectItem key={phone.id} value={phone.number || phone.id}>
                      {phone.number || "No number"} - {phone.name || "No name"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              The Vapi assistant to use for voice calls.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
