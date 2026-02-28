import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  addMembersToConversationAPI,
  getUserProfileByIdAPI,
  leaveConversationAPI,
  removeMemberFromConversationAPI,
} from "@/apis";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, User, Users, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectConversationById,
  setConversationAccessState,
} from "@/redux/slices/conversationSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  getFriends,
  selectFriend,
  selectFriendPage,
} from "@/redux/slices/friendSlice";
import { useLocation } from "react-router";
import { selectUser } from "@/redux/slices/userSlice";
import { toast } from "sonner";

export function GroupMemberManager() {
  const [selectedTab, setSelectedTab] = useState("members");
  const [open, setOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [memberProfileMap, setMemberProfileMap] = useState<
    Record<
      string,
      {
        username?: string;
        fullName?: string;
        avatar?: string;
      }
    >
  >({});

  const conversationId = useLocation().pathname.split("/").pop() || "";

  const conversation = useSelector((state: RootState) =>
    selectConversationById(state, conversationId),
  );

  const friends = useSelector(selectFriend);
  const user = useSelector(selectUser);

  const dispatch = useDispatch<AppDispatch>();

  const page = useSelector(selectFriendPage);

  const loadMoreFriends = () => {
    dispatch(getFriends({ limit: 20, page: page + 1 }));
  };

  const myRole = conversation?.members?.find(
    (member) => member.userId === user.id,
  )?.role;

  const isAdmin = myRole === "ADMIN" || myRole === "OWNER";
  const canLeaveGroup = !isAdmin && conversation?.membershipStatus === "ACTIVE";

  useEffect(() => {
    if (friends.length === 0) {
      dispatch(getFriends({ limit: 20, page: 1 }));
    }
  }, [dispatch, friends.length]);

  useEffect(() => {
    const members = conversation?.members || [];
    const unresolvedMemberIds = members
      .filter((member) => {
        const hasDisplayName = Boolean(member.username || member.fullName);
        const hasAvatar = Boolean(member.avatar);
        const hasCachedProfile = Boolean(memberProfileMap[member.userId]);

        return (!hasDisplayName || !hasAvatar) && !hasCachedProfile;
      })
      .map((member) => member.userId);

    if (unresolvedMemberIds.length === 0) return;

    Promise.all(
      unresolvedMemberIds.map(async (userId) => {
        try {
          const profile = await getUserProfileByIdAPI(userId);
          return {
            userId,
            username: profile.username,
            fullName: profile.fullName,
            avatar: profile.avatar,
          };
        } catch {
          return null;
        }
      }),
    ).then((profiles) => {
      const validProfiles = profiles.filter(Boolean) as Array<{
        userId: string;
        username?: string;
        fullName?: string;
        avatar?: string;
      }>;

      if (validProfiles.length === 0) return;

      setMemberProfileMap((prev) => {
        const next = { ...prev };
        for (const profile of validProfiles) {
          next[profile.userId] = {
            username: profile.username,
            fullName: profile.fullName,
            avatar: profile.avatar,
          };
        }
        return next;
      });
    });
  }, [conversation?.members, memberProfileMap]);
  // Get available friends not already in the group
  const availableFriends = friends.filter(
    (friend) =>
      conversation?.members.map((m) => m.userId).indexOf(friend.id) === -1,
  );

  const handleAddMember = async (friend: {
    id: string;
    username?: string;
    fullName?: string;
    avatar?: string;
  }) => {
    if (!conversationId || !isAdmin) return;

    try {
      setPendingMemberId(friend.id);
      await addMembersToConversationAPI({
        conversationId,
        memberIds: [friend.id],
        members: [
          {
            userId: friend.id,
            username: friend.username,
            fullName: friend.fullName,
            avatar: friend.avatar,
          },
        ],
      });
      toast.success("Đã thêm thành viên vào nhóm");
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        "Không thể thêm thành viên";
      toast.error(String(backendMessage));
    } finally {
      setPendingMemberId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!conversationId || !isAdmin) return;

    try {
      setPendingMemberId(memberId);
      await removeMemberFromConversationAPI({
        conversationId,
        targetUserId: memberId,
      });
      toast.success("Đã xóa thành viên khỏi nhóm");
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        "Không thể xóa thành viên";
      toast.error(String(backendMessage));
    } finally {
      setPendingMemberId(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (isLeaving) return;
    if (!conversationId) return;
    if (conversation?.membershipStatus !== "ACTIVE") {
      toast.info("Bạn không còn trong nhóm này");
      return;
    }
    if (isAdmin) {
      toast.error("Admin không thể rời nhóm. Hãy chuyển quyền admin trước.");
      return;
    }
    try {
      setIsLeaving(true);
      await leaveConversationAPI({
        conversationId,
      });
      dispatch(
        setConversationAccessState({
          conversationId,
          membershipStatus: "LEFT",
          canSendMessage: false,
        }),
      );
      toast.success("Bạn đã rời khỏi nhóm");
      setOpen(false);
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        "Không thể rời nhóm";
      toast.error(String(backendMessage));
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1 border-accent/20 hover:bg-accent/10 bg-transparent"
        >
          <Users className="w-4 h-4" />
          Manage
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background border-accent/20">
        <div className="p-4 border-b border-accent/10">
          <h3 className="text-sm font-semibold text-white">
            {conversation?.groupName}
          </h3>
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleLeaveGroup}
              disabled={isLeaving || !canLeaveGroup}
              className="h-8 gap-2"
            >
              <LogOut className="w-3 h-3" />
              {isLeaving
                ? "Leaving..."
                : isAdmin
                  ? "Admin cannot leave"
                  : "Leave group"}
            </Button>
          </div>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 m-3 mb-2">
            <TabsTrigger
              value="members"
              className="flex items-center gap-2 text-xs"
            >
              <User className="w-3 h-3" />
              Members ({conversation?.members.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className="flex items-center gap-2 text-xs"
            >
              <Plus className="w-3 h-3" />
              Add
            </TabsTrigger>
          </TabsList>

          {/* Members List Tab */}
          <TabsContent value="members" className="m-0 p-3">
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-2">
                {conversation?.members.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                    No members in this group
                  </div>
                ) : (
                  conversation?.members.map((member) =>
                    (() => {
                      const fallbackProfile = memberProfileMap[member.userId];
                      const displayName =
                        member.username ||
                        member.fullName ||
                        fallbackProfile?.username ||
                        fallbackProfile?.fullName ||
                        member.userId;
                      const displayAvatar =
                        member.avatar ||
                        fallbackProfile?.avatar ||
                        "/placeholder.svg";

                      return (
                        <div
                          key={member.userId}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={displayAvatar}
                                alt={displayName || "User"}
                              />
                              <AvatarFallback>
                                {displayName?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p
                                className={`text-sm text-white ${
                                  member.userId === user.id
                                    ? "font-bold"
                                    : "font-medium"
                                }`}
                              >
                                {displayName}
                                {member.userId === user.id ? " (Bạn)" : ""}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {member.role === "ADMIN" && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                    ADMIN
                                  </span>
                                )}
                                {member.userId === user.id && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                    YOU
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isAdmin && member.userId !== user.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={pendingMemberId === member.userId}
                              onClick={() => handleRemoveMember(member.userId)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })(),
                  )
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Add Member Tab */}
          <TabsContent value="add" className="m-0 p-3">
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-2">
                {availableFriends.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                    All friends are already in this group
                  </div>
                ) : (
                  availableFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={friend.avatar || "/placeholder.svg"}
                            alt={friend.username || "User"}
                          />
                          <AvatarFallback>
                            {friend.username?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {friend.username}
                          </p>
                          {/* <p className='text-xs text-muted-foreground'>
                            {friend.status}
                          </p> */}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleAddMember({
                            id: friend.id,
                            username: friend.username,
                            fullName: friend.fullName,
                            avatar: friend.avatar,
                          })
                        }
                        disabled={!isAdmin || pendingMemberId === friend.id}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
                <div className="w-full flex items-center justify-center my-4">
                  <Button
                    className="interceptor-loading"
                    onClick={() => loadMoreFriends()}
                  >
                    Load More
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
