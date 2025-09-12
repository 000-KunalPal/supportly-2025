"use client";

import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { DiceBearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { cn } from "@workspace/ui/lib/utils";
import { usePaginatedQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai/react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerUpLeftIcon,
  ListIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { statusFilterAtom } from "../../atoms";

export const ConversationsPanel = () => {
  const pathname = usePathname();

  const statusFilter = useAtomValue(statusFilterAtom);
  const setStatusFilter = useSetAtom(statusFilterAtom);

  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      initialNumItems: 10,
    }
  );

  const {
    canLoadMore,
    handleLoadMore,
    topElementRef,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  });

  return (
    <div className='flex h-full w-full flex-col bg-background text-sidebar-foreground'>
      <div className='flex flex-col gap-3.5 border-b p-2'>
        <Select
          defaultValue='all'
          onValueChange={(value) =>
            setStatusFilter(
              value as "unresolved" | "escalated" | "resolved" | "all"
            )
          }
          value={statusFilter}
        >
          <SelectTrigger className='h-8 border-none shadow-none ring-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0'>
            <SelectValue placeholder='Filter' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              <div className='flex items-center gap-2'>
                <ListIcon className='size-4' />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value='unresolved'>
              <div className='flex items-center gap-2'>
                <ArrowRightIcon className='size-4' />
                <span>Unresolved</span>
              </div>
            </SelectItem>
            <SelectItem value='escalated'>
              <div className='flex items-center gap-2'>
                <ArrowUpIcon className='size-4' />
                <span>Escalated</span>
              </div>
            </SelectItem>
            <SelectItem value='resolved'>
              <div className='flex items-center gap-2'>
                <CheckIcon className='size-4' />
                <span>Resolved</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <SkeletonConversations />
      ) : (
        <ScrollArea className='max-h-[calc(100vh-53px)]'>
          <div className='flex w-full flex-1 flex-col text-sm'>
            {conversations.results.map((conversation) => {
              if (!conversation) return;
              const islastMessageFromOperator =
                conversation.lastMessage?.message?.role !== "user";

              const country = getCountryFromTimezone(
                conversation?.contactSession.metadata?.timezone
              );

              const countryFlagUrl = country?.code
                ? getCountryFlagUrl(country.code)
                : undefined;

              const href = `/conversations/${conversation._id}`;

              return (
                <Link
                  key={conversation?._id}
                  href={href}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground",
                    pathname === href && "bg-accent text-accent-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity",
                      pathname === href && "opacity-100"
                    )}
                  />
                  <DiceBearAvatar
                    badgeImageUrl={countryFlagUrl}
                    seed={conversation.contactSession._id}
                    size={40}
                    className='shrink-0'
                  />
                  <div className='flex-1'>
                    <div className='flex w-full gap-2 items-center'>
                      <span className='truncate font-bold'>
                        {conversation.contactSession.name}
                      </span>
                      <span className='ml-auto shrink-0 text-muted-foreground text-xs'>
                        {formatDistanceToNow(conversation._creationTime)}
                      </span>
                    </div>
                    <div className='mt-1 flex items-center justify-between gap-2'>
                      <div className='flex gap-1 w-0 grow items-center'>
                        {islastMessageFromOperator && (
                          <CornerUpLeftIcon className='size-3 shrink-0 text-muted-foreground' />
                        )}
                        <span
                          className={cn(
                            "text-xs text-muted-foreground line-clamp-1",
                            !islastMessageFromOperator && "font-bold text-black"
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>
                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
              isLoadingMore={isLoadingMore}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export const SkeletonConversations = () => {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-2 overflow-auto'>
      <div className='relative flex w-full min-w-0 flex-col p-2'>
        <div className='w-full space-y-2'>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className='flex items-start gap-3 rounded-lg p-4'>
              <Skeleton className='h-10 w-10 shrink-0 rounded-full' />
              <div className='min-w-0 flex-1'>
                <div className='flex w-full items-center gap-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='ml-auto h-3 w-12 shrink-0' />
                </div>
                <div className='mt-2'>
                  <Skeleton className='h-3 w-full' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
