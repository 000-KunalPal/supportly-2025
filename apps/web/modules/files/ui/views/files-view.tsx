"use client";
import { api } from "@workspace/backend/_generated/api";
import { PublicFile } from "@workspace/backend/private/files";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { usePaginatedQuery } from "convex/react";
import {
  FileIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import DeleteFileDialog from "../components/delete-file-dialog";
import { UploadDialog } from "../components/upload-dialog";

export const FilesView = () => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);

  const files = usePaginatedQuery(
    api.private.files.list,
    {},
    { initialNumItems: 10 }
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
  } = useInfiniteScroll({
    status: files.status,
    loadMore: files.loadMore,
    loadSize: 10,
  });

  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file);
    setOpenDeleteDialog(true);
  };

  const handleFileDeleted = () => {
    setSelectedFile(null);
  };

  return (
    <>
      <DeleteFileDialog
        onOpenChange={setOpenDeleteDialog}
        open={openDeleteDialog}
        file={selectedFile}
        onDeleted={handleFileDeleted}
      />
      <UploadDialog
        onOpenChange={setOpenUploadDialog}
        open={openUploadDialog}
      />
      <div className='flex flex-colmin-h-screen p-8 bg-muted'>
        <div className='max-w-screen-md w-full mx-auto'>
          <div className='space-y-2'>
            <h1 className='text-2xl md:text-4xl'>Knowledge base</h1>
            <p className='text-muted-foreground'>
              Upload and manage documents for your AI assistant
            </p>
          </div>

          <div className='mt-8 rounded-lg border bg-background'>
            <div className='flex items-center py-4 px-6 justify-end border-b'>
              <Button onClick={() => setOpenUploadDialog(true)}>
                <PlusIcon /> Add New
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='px-6 py-4'>Name</TableHead>
                <TableHead className='px-6 py-4'>Type</TableHead>
                <TableHead className='px-6 py-4'>Size</TableHead>
                <TableHead className='px-6 py-4'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (isLoadingFirstPage) {
                  return (
                    <TableRow>
                      <TableCell className='h-24 text-center' colSpan={4}>
                        Loading files...
                      </TableCell>
                    </TableRow>
                  );
                }
                if (files.results.length === 0) {
                  return (
                    <TableRow>
                      <TableCell className='h-24 text-center' colSpan={4}>
                        No files found.
                      </TableCell>
                    </TableRow>
                  );
                }

                return files.results.map((file) => (
                  <TableRow className='hover:bg-muted/50' key={file.id}>
                    <TableCell className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <FileIcon />
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <Badge variant='outline' className='uppercase'>
                        {file.type}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-6 py-4 text-muted-foreground'>
                      {file.size}
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className='size-8 p-0'
                            variant='ghost'
                            size='sm'
                          >
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={() => {
                              handleDeleteClick(file);
                            }}
                          >
                            <TrashIcon className='size-4 mr-2' /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>

          {!isLoadingFirstPage && files.results.length > 0 && (
            <div className='border-t'>
              <InfiniteScrollTrigger
                ref={topElementRef}
                canLoadMore={canLoadMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
