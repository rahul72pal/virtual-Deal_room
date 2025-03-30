import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { apiRequest } from "@/utils/api";
import { useState } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { columns } from "@/components/BuyerTable/column";
import { DataTable } from "@/components/BuyerTable/dataTable";


const BuyerDealsPage = () => {
  const queryClient = useQueryClient();
  const router = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch deals
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/deals");
      return response;
    },
  });

  // Place a bid
  const bidMutation = useMutation({
    mutationFn: async ({ dealId, offeredPrice }) => {
      return await apiRequest("POST", `/deals/${dealId}/bids`, { buyer: user.id, offeredPrice });
    },
    onSuccess: () => {
      toast.success("Bid placed successfully!");
      queryClient.invalidateQueries(["deals"]);
    },
    onError: () => toast.error("Failed to place bid"),
  });

  // Truncate text properly
  const truncateText = (text = "", maxLength) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const table = useReactTable({
    data: deals,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading deals...</p>
          ) : deals.length === 0 ? (
            <p>No deals found.</p>
          ) : (
            <DataTable columns={columns} data={deals} /> 
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerDealsPage;
