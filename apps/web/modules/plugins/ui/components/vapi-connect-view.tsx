"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { BotIcon, PhoneIcon, SettingsIcon, UnplugIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { VapiAssistantsTab } from "./vapi-assistants-tab";
import { VapiPhoneNumbersTab } from "./vapi-phone-numbers-tab";

export const VapiConnectedView = ({
  onDisconnect,
}: {
  onDisconnect: () => void;
}) => {
  const [activeTab, setActiveTab] = useState("phone-numbers");
  return (
    <div className='space-y-7'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex gap-3 items-center'>
              <Image
                className='rounded-lg object-contain'
                src={"/logo.svg"}
                alt='Vapi'
                height={40}
                width={40}
              />
              <div>
                <CardTitle>Vapi Integration </CardTitle>
                <CardDescription>Manage your phone numbers </CardDescription>
              </div>
            </div>

            <Button variant='destructive' onClick={onDisconnect}>
              <UnplugIcon />
              Disconnect
            </Button>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex gap-3 items-center'>
              <SettingsIcon size={20} />
              <div>
                <CardTitle>Widget Configuration </CardTitle>
                <CardDescription>
                  Set up voice calls for your chat widget{" "}
                </CardDescription>
              </div>
            </div>

            <Button asChild>
              <Link href={"/customization"}>
                <SettingsIcon />
                Configure
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
      <div className=''>
        <Tabs defaultValue={activeTab}>
          <TabsList className='grid h-12 w-full grid-cols-2 p-0'>
            <TabsTrigger value='phone-numbers'>
              <PhoneIcon /> Phone numbers
            </TabsTrigger>
            <TabsTrigger className='h-full rounded-none' value='ai-assistant'>
              <BotIcon /> AI Assistant
            </TabsTrigger>
          </TabsList>
          <TabsContent value='phone-numbers'>
            <VapiPhoneNumbersTab />
          </TabsContent>
          <TabsContent value='ai-assistant'>
            <VapiAssistantsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
