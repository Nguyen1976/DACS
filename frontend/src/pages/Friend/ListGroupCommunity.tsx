import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getConversations,
  selectConversation,
  type Conversation,
} from "@/redux/slices/conversationSlice";
import type { AppDispatch } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

const ListGroupCommunity = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const conversations = useSelector(selectConversation) || [];

  useEffect(() => {
    if (conversations.length === 0) {
      dispatch(getConversations({ limit: 20, cursor: null }));
    }
  }, [dispatch, conversations.length]);

  const groups = conversations.filter(
    (conversation) => conversation.type !== "DIRECT",
  );

  const loadMoreGroups = () => {
    const cursor =
      conversations[conversations.length - 1]?.members?.[0]?.lastMessageAt ||
      null;

    dispatch(getConversations({ limit: 20, cursor }));
  };

  return (
    <div className="h-full min-h-0 flex-1">
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="space-y-2">
            {groups.map((group: Conversation) => (
              <button
                key={group.id}
                onClick={() => navigate(`/chat/${group.id}`)}
                className="w-full p-3 rounded-lg flex items-center gap-3 hover:bg-accent transition-colors group"
              >
                <div className="relative w-12 h-12 shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={(group.groupAvatar as string) || "/placeholder.svg"}
                      alt={group.groupName || "Group"}
                    />
                    <AvatarFallback>
                      {(group.groupName || "G")[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-foreground truncate">
                    {group.groupName || "Nhóm chưa đặt tên"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {group.members.length} thành viên
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-xl">⋮</span>
                </Button>
              </button>
            ))}
          </div>

          {groups.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Chưa có nhóm hoặc cộng đồng
              </p>
            </div>
          )}

          <div className="w-full flex items-center justify-center my-4">
            <Button className="interceptor-loading" onClick={loadMoreGroups}>
              Load More
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ListGroupCommunity;
