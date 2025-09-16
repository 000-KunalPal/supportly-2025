import { api } from "@workspace/backend/_generated/api";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PhoneNumbers = typeof api.private.vapi.getPhonenumbers._returnType;
type Assistants = typeof api.private.vapi.getAssistants._returnType;

export const useVapiPhoneNumbers = (): {
  data: PhoneNumbers | null;
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<PhoneNumbers | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getPhonenumbers = useAction(api.private.vapi.getPhonenumbers);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getPhonenumbers({});
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (error) {
        if (cancelled) return;
        setError(error as Error);
        toast.error("Failed to fetch phone numbers");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
  };
};

export const useVapiAssistants = (): {
  data: Assistants | null;
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<Assistants | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getAssistants = useAction(api.private.vapi.getAssistants);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getAssistants({});
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (error) {
        if (cancelled) return;
        setError(error as Error);
        toast.error("Failed to fetch assistants");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
  };
};
