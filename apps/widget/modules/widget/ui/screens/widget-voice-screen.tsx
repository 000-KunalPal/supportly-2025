import { Button } from "@workspace/ui/components/button";
import { useSetAtom } from "jotai";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import { Message, MessageContent } from "@workspace/ui/components/ai/message";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeftIcon, MicIcon, MicOffIcon } from "lucide-react";
import { screenAtom } from "../../atoms/widget-atoms";
import { useVapi } from "../../hooks/use-vapi";
import { WidgetHeader } from "../components/widget-header";

export const WidgetVoiceScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const {
    isSpeaking,
    isConnecting,
    isConnected,
    startCall,
    endCall,
    transcript,
  } = useVapi();
  return (
    <>
      <WidgetHeader>
        <div className='flex items-center gap-x-2'>
          <Button
            variant='transparent'
            size='icon'
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Voice chat</p>
        </div>
      </WidgetHeader>
      {transcript.length > 0 ? (
        <Conversation className='h-full flex-1'>
          <ConversationContent>
            {transcript.map((message, index) => (
              <Message
                from={message.role}
                key={`${message.role}-${index}-${message.text}`}
              >
                <MessageContent>{message.text}</MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <div className='h-full flex-1 flex flex-col items-center justify-center gap-y-4'>
          <div className='flex items-center justify-center border bg-white rounded-full p-3'>
            <MicIcon className='size-6 text-muted-foreground' />
          </div>
          <p className='text-muted-foreground'>Transcript will appear here</p>
        </div>
      )}
      <div className='border-t p-4 bg-background'>
        <div className='flex flex-col items-center gap-y-4'>
          {isConnected && (
            <div className='flex items-center gap-x-2'>
              <div
                className={cn(
                  "size-4 rounded-full",
                  isSpeaking ? "animate-pulse bg-red-500" : "bg-green-500"
                )}
              />
              <span className='text-muted-foreground text-sm'>
                {isSpeaking ? "Assistant Speaking..." : "Listening..."}
              </span>
            </div>
          )}
          <div className='flex w-full justify-center'>
            {isConnected ? (
              <Button
                className='w-full'
                size='lg'
                variant='destructive'
                onClick={() => endCall()}
              >
                <MicOffIcon />
                End call
              </Button>
            ) : (
              <Button
                className='w-full'
                disabled={isConnecting}
                size='lg'
                onClick={() => startCall()}
              >
                <MicIcon />
                Start call
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
