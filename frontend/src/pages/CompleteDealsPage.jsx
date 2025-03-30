import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { apiRequest } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const CompleteDealsPage = () => {
  const user = useSelector((state) => state.auth.user);

  // Fetch completed deals for logged-in buyer
  const { data: deals = [], isLoading, error } = useQuery({
    queryKey: ["completedDeals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await apiRequest("GET", `/deals/completedeals`);
    },
    enabled: !!user?.id, // Only fetch if user ID exists
  });

  if (error) {
    toast.error("Failed to fetch completed deals");
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Completed Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading deals...</p>
          ) : deals.length === 0 ? (
            <p className="text-gray-500">No completed deals found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal._id}>
                    <TableCell>{deal.title}</TableCell>
                    <TableCell>{deal.seller?.name || "Unknown"}</TableCell>
                    <TableCell>${deal.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteDealsPage;
