"use client";

import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";

import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doc, Id } from "@workspace/backend/_generated/dataModel";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import { Message, MessageContent } from "@workspace/ui/components/ai/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@workspace/ui/components/ai/prompt-input";
import { Response } from "@workspace/ui/components/ai/response";
import { DiceBearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Form, FormField } from "@workspace/ui/components/form";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { ConversationStatusButton } from "../components/conversation-status-button";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId
      ? {
          threadId: conversation.threadId,
        }
      : "skip",
    {
      initialNumItems: 10,
    }
  );

  const { canLoadMore, handleLoadMore, isLoadingMore, topElementRef } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const handleEnhanceResponse = async () => {
    setIsEnhancing(true);
    const currentValue = form.getValues("message");
    try {
      const response = await enhanceResponse({
        prompt: currentValue,
      });

      form.setValue("message", response);
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const createMessage = useMutation(api.private.messages.create);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });

      form.reset();
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const updateConversationStatus = useMutation(
    api.private.conversations.updateStatus
  );

  const handleToggleStatus = async () => {
    if (!conversation) {
      return;
    }

    setIsUpdatingStatus(true);

    let newStatus: Doc<"conversations">["status"];

    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved";
    } else {
      newStatus = "unresolved";
    }

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (conversation === undefined || messages.status === "LoadingFirstPage") {
    return <ConversationIdViewLoading />;
  }

  return (
    <div className='flex h-full flex-col bg-muted'>
      <header className='flex items-center justify-between border-b bg-background p-2.5'>
        <Button size='sm' variant='ghost'>
          <MoreHorizontalIcon />
        </Button>
        {!!conversation && (
          <ConversationStatusButton
            onClick={handleToggleStatus}
            status={conversation.status}
            disabled={isUpdatingStatus}
          />
        )}
      </header>

      <Conversation className='max-h-[calc(100vh-180px)]'>
        <ConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            ref={topElementRef}
            onLoadMore={handleLoadMore}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => (
            <Message
              from={message.role === "user" ? "assistant" : "user"}
              key={message.id}
            >
              <MessageContent>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text": // we don't use any reasoning or tool calls in this example
                      return (
                        <Response key={`${message.id}-${i}`}>
                          {part.text}
                        </Response>
                      );
                    default:
                      return null;
                  }
                })}
              </MessageContent>
              {message.role === "user" && (
                <DiceBearAvatar
                  seed={conversation?.contactSessionId ?? "user"}
                  size={32}
                />
              )}
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className='p-2'>
        <Form {...form}>
          <PromptInput
            onSubmit={() => {
              form.handleSubmit(onSubmit)();
            }}
          >
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name='message'
              render={({ field }) => (
                <PromptInputTextarea
                  disabled={
                    conversation?.status === "resolved" ||
                    isEnhancing ||
                    form.formState.isSubmitting
                  }
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Type your message..."
                  }
                  value={field.value}
                />
              )}
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputButton
                  onClick={handleEnhanceResponse}
                  disabled={
                    conversation?.status === "resolved" ||
                    isEnhancing ||
                    !form.formState.isValid
                  }
                >
                  <Wand2Icon />
                  {!!isEnhancing ? "Enhancing..." : "Enhance"}
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={
                  conversation?.status === "resolved" ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  isEnhancing
                }
                status='ready'
                type='submit'
              />
            </PromptInputToolbar>
          </PromptInput>
        </Form>
      </div>
    </div>
  );
};

export const ConversationIdViewLoading = () => {
  return (
    <div className='flex h-full flex-col bg-muted'>
      <header className='flex items-center justify-between border-b bg-background p-2.5'>
        <Button disabled size='sm' variant='ghost'>
          <MoreHorizontalIcon />
        </Button>
      </header>
      <Conversation className='max-h-[calc(100vh-180px)]'>
        <ConversationContent>
          {Array.from({ length: 8 }, (_, i) => {
            const isUser = i % 2 === 0;
            const widths = ["w-48", "w-60", "w-72"];
            const width = widths[i % widths.length];

            return (
              <div
                className={cn(
                  "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                  isUser ? "is-user" : "is-assistant flex-row-reverse"
                )}
                key={i}
              >
                <Skeleton
                  className={`h-9 ${width} rounded-lg bg-neutral-200`}
                />
                <Skeleton className='size-8 rounded-full bg-neutral-200' />
              </div>
            );
          })}
        </ConversationContent>
      </Conversation>
      <div className='p-2'>
        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea
            disabled
            placeholder='Type your response as an operator...'
          />

          <PromptInputToolbar>
            <PromptInputTools />
            <PromptInputSubmit disabled status='ready' />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
