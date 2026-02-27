import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFriendRequestsAPI, type FriendRequestListItem } from "@/apis";
import FriendRequestModal from "@/components/FriendRequestModal";
import { formatDateTime } from "@/utils/formatDateTime";
import { toast } from "sonner";

const ListFriendRequests = () => {
  const [requests, setRequests] = useState<FriendRequestListItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");

  const fetchRequests = async ({
    nextPage,
    replace,
  }: {
    nextPage: number;
    replace?: boolean;
  }) => {
    try {
      setIsLoading(true);
      const data = await getFriendRequestsAPI({ limit: 20, page: nextPage });

      setRequests((prev) => {
        if (replace) return data;

        const merged = [...prev, ...data];
        return Array.from(
          new Map(merged.map((request) => [request.id, request])).values(),
        );
      });
      setPage(nextPage);
    } catch (error) {
      console.log(error);
      toast.error("Không thể tải danh sách lời mời kết bạn");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests({ nextPage: 1, replace: true });
  }, []);

  const handleCloseModal = () => {
    setSelectedRequestId("");
    void fetchRequests({ nextPage: 1, replace: true });
  };

  return (
    <div className="h-full min-h-0 flex-1">
      <FriendRequestModal
        isOpen={selectedRequestId !== ""}
        friendRequestId={selectedRequestId}
        onClose={handleCloseModal}
      />

      <ScrollArea className="h-full">
        <div className="p-6 space-y-3">
          {requests.map((request) => (
            <button
              key={request.id}
              onClick={() => setSelectedRequestId(request.id)}
              className="w-full rounded-lg border p-4 hover:bg-accent transition-colors flex items-center gap-3"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={request.fromUser.avatar || "/placeholder.svg"}
                  alt={request.fromUser.username}
                />
                <AvatarFallback>
                  {(request.fromUser.username || "U")[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left min-w-0">
                <p className="font-medium truncate">
                  {request.fromUser.username}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {request.fromUser.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(request.createdAt)}
                </p>
              </div>

              <Button variant="outline" size="sm" className="bg-transparent">
                Xem chi tiết
              </Button>
            </button>
          ))}

          {requests.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Không có lời mời kết bạn nào
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          )}

          {!isLoading && requests.length > 0 && (
            <div className="w-full flex items-center justify-center my-4">
              <Button
                className="interceptor-loading"
                onClick={() => void fetchRequests({ nextPage: page + 1 })}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ListFriendRequests;
