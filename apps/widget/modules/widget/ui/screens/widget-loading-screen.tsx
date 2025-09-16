"use client";

import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
  widgetSettingsAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { api } from "@workspace/backend/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";

export const WidgetLoadingScreen = ({
  organizationId,
}: {
  organizationId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("org");
  const [sessionValid, setSessionValid] = useState(false);

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setWidgetSettings = useSetAtom(widgetSettingsAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  // Validate Organization
  const validateOrganization = useAction(api.public.organizations.validate);
  useEffect(() => {
    if (step !== "org") {
      return;
    }

    setLoadingMessage("Finding organization ID...");

    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
      return;
    }

    setLoadingMessage("Verifying organization...");

    validateOrganization({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrganizationId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Unable to verify organization");
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setOrganizationId,
    setStep,
    setLoadingMessage,
    validateOrganization,
  ]);

  // Validate Session (if exists)
  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  );

  useEffect(() => {
    if (step !== "session") {
      return;
    }

    setLoadingMessage("Finding contact session Id...");

    if (!contactSessionId) {
      setSessionValid(false);
      setStep("settings");
      return;
    }

    setLoadingMessage("Validating session...");

    validateContactSession({ contactSessionId })
      .then((result) => {
        setSessionValid(result.valid);
        setStep("settings");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("settings");
      });
  }, [
    step,
    contactSessionId,
    setStep,
    setLoadingMessage,
    validateContactSession,
    setSessionValid,
  ]);

  // Load Widget Settings
  const widgetSettings = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    organizationId ? { organizationId } : "skip"
  );

  useEffect(() => {
    if (step !== "settings") {
      return;
    }

    setLoadingMessage("Loading widget settings...");

    if (widgetSettings !== undefined) {
      setWidgetSettings(widgetSettings);
      setStep("done");
    }
  }, [setLoadingMessage, step, setStep, widgetSettings, setWidgetSettings]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className='flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold'>
          <p className='text-3xl'>Hi there! 👋</p>
          <p className='text-lg'>Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className='flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground'>
        <LoaderIcon className='animate-spin' />
        <p className='text-sm'>{loadingMessage || "Loading..."}</p>
      </div>
    </>
  );
};
