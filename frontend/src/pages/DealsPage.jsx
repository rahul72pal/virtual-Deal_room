import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { apiRequest } from "@/utils/api";
import { DataTable } from "@/components/DealerTable/dataTable";
import { columns } from "@/components/DealerTable/column";

const DealsPage = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  const [selectedStatus, setSelectedStatus] = useState("");
  const user = useSelector((state) => state.auth.user);
  console.log("User  from Redux:", user); // Direct log

  // Fetch Deals
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      return await apiRequest("GET", "/deals");
    },
  });

  // Create Deal
  const createDealMutation = useMutation({
    mutationFn: async (newDeal) => {
      return await apiRequest("POST", "/deals", newDeal);
    },
    onSuccess: () => {
      toast.success("Deal created successfully!");
      queryClient.invalidateQueries(["deals"]);
      reset();
    },
    onError: () => toast.error("Failed to create deal"),
  });

  // Update Deal Status
  const updateDealMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await apiRequest("PUT", `/deals/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success("Deal status updated!");
      queryClient.invalidateQueries(["deals"]);
    },
    onError: () => toast.error("Failed to update deal"),
  });

  // Delete Deal
  const deleteDealMutation = useMutation({
    mutationFn: async (id) => {
      return await apiRequest("DELETE", `/deals/${id}`);
    },
    onSuccess: () => {
      toast.success("Deal deleted successfully!");
      queryClient.invalidateQueries(["deals"]);
    },
    onError: () => toast.error("Failed to delete deal"),
  });

  // Form Submit Handler
  const onSubmit = (data) => {
    createDealMutation.mutate({ ...data, seller: user.id });
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Deal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                {...register("title", { required: true })}
                placeholder="Enter deal title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                {...register("description", { required: true })}
                placeholder="Enter deal description"
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                {...register("price", { required: true })}
                placeholder="Enter price"
              />
            </div>
            <Button type="submit" className="w-full" onClick={createDealMutation.mutate}>
              Create Deal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading deals...</p>
          ) : (
            <DataTable columns={columns} data={deals}/>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealsPage;
