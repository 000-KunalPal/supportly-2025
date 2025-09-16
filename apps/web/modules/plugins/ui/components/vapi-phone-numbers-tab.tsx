"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { useVapiPhoneNumbers } from "../../hooks/use-vapi-data";

export const VapiPhoneNumbersTab = () => {
  const { data: phoneNumbers, isLoading } = useVapiPhoneNumbers();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Phone number copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy phone number to clipboard");
    }
  };

  return (
    <div className='border-t bg-background'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='px-6 py-4'>Phone number</TableHead>
            <TableHead className='px-6 py-4'>Name</TableHead>
            <TableHead className='px-6 py-4'>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(() => {
            if (isLoading)
              return (
                <TableRow>
                  <TableCell
                    className='px-6 py-8 text-center text-muted-foreground'
                    colSpan={3}
                  >
                    Loading phone numbers
                  </TableCell>
                </TableRow>
              );

            if (phoneNumbers?.length === 0)
              return (
                <TableRow>
                  <TableCell
                    className='px-6 py-8 text-center text-muted-foreground'
                    colSpan={3}
                  >
                    No phone numbers configured
                  </TableCell>
                </TableRow>
              );

            return phoneNumbers?.map((phone) => (
              <TableRow className='hover:bg-muted/50' key={phone.id}>
                <TableCell className='px-6 py-4'>
                  {phone.number || "Not configured"}
                </TableCell>
                <TableCell className='px-6 py-4'>
                  {phone.name || "Not configured"}
                </TableCell>
                <TableCell className='px-6 py-4'>
                  <Badge
                    className='capitalize'
                    variant={
                      phone.status === "active" ? "default" : "destructive"
                    }
                  >
                    {phone.status === "active" ? (
                      <CheckCircleIcon className='mr-1 size-3' />
                    ) : (
                      <XCircleIcon className='mr-1 size-3' />
                    )}
                    {phone.status || "unknown"}
                  </Badge>
                </TableCell>
              </TableRow>
            ));
          })()}
        </TableBody>
      </Table>
    </div>
  );
};
