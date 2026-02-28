import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getConversationAssetsAPI,
  type ConversationAssetMessage,
} from "@/apis";
import type {
  Conversation,
  ConversationState,
} from "@/redux/slices/conversationSlice";
import { FileText, ImageIcon, Link2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { GroupMemberManager } from "./GroupMemberManager";

interface ProfilePanelProps {
  conversationId: string;
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
}

export default function ProfilePanel({
  conversationId,
  onClose,
  onJumpToMessage,
}: ProfilePanelProps) {
  const [assetKind, setAssetKind] = useState<"MEDIA" | "LINK" | "DOC">("MEDIA");
  const [assets, setAssets] = useState<ConversationAssetMessage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const conversation = useSelector(
    (state: { conversations: ConversationState }) => {
      return state.conversations?.find((c) => c.id === conversationId);
    },
  ) as Conversation;

  const title = useMemo(() => {
    if (!conversation) return "Conversation";
    return conversation.groupName || "Conversation";
  }, [conversation]);

  useEffect(() => {
    setAssets([]);
    setCursor(null);
    setNextCursor(null);
    setHasMore(true);
    setFetchKey((prev) => prev + 1);
  }, [conversationId, assetKind]);

  useEffect(() => {
    if (!conversationId || !hasMore || isLoading) return;

    setIsLoading(true);
    getConversationAssetsAPI({
      conversationId,
      kind: assetKind,
      cursor,
      limit: 18,
    })
      .then((response) => {
        const nextMessages = response.messages || [];
        setAssets((prev) => {
          const merged = [...prev, ...nextMessages];
          return merged.filter(
            (message, index, array) =>
              index === array.findIndex((item) => item.id === message.id),
          );
        });
        setNextCursor(response.nextCursor || null);
        setHasMore(Boolean(response.nextCursor));
      })
      .finally(() => setIsLoading(false));
  }, [conversationId, assetKind, cursor, hasMore, isLoading, fetchKey]);

  const resolveMediaPreviewUrl = (message: ConversationAssetMessage) => {
    const media = message.medias?.[0];
    if (media?.url) return media.url;

    const content = message.text || "";
    if (content.startsWith("http")) return content;
    return "";
  };

  const resolveFileName = (message: ConversationAssetMessage) => {
    const mediaUrl = message.medias?.[0]?.url || message.text || "";
    if (!mediaUrl) return "attachment";
    try {
      const parsed = new URL(mediaUrl);
      return decodeURIComponent(
        parsed.pathname.split("/").pop() || "attachment",
      );
    } catch {
      return decodeURIComponent(mediaUrl.split("/").pop() || "attachment");
    }
  };

  const resolvePrimaryLink = (message: ConversationAssetMessage) => {
    const text = message.text || "";
    const matched = text.match(/https?:\/\/\S+/i);
    if (matched?.[0]) return matched[0];
    return message.medias?.[0]?.url || "";
  };

  return (
    <div className="bg-black-bland border-l border-bg-box-message-incoming flex flex-col custom-scrollbar">
      <div className="flex items-center justify-between p-4 border-b border-bg-box-message-incoming">
        <h2 className="text-lg font-semibold text-text">Profile</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-bg-box-message-incoming text-gray-400 hover:text-text"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage
                src={conversation.groupAvatar || "/placeholder.svg"}
                alt={title}
              />
              <AvatarFallback className="text-3xl">{title?.[0]}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold text-text">{title}</h3>
            {/* <p className='text-sm text-gray-400'>{conversation.groupStatus}</p> */}
          </div>

          {/* Bio */}
          {/* {conversation.bio && (
            <div>
              <h4 className='text-sm font-medium text-gray-400 mb-2'>Bio</h4>
              <p className='text-sm text-text'>{conversation.bio}</p>
            </div>
          )} */}

          {/* Phone */}
          {/* {conversation.phone && (
            <div>
              <h4 className='text-sm font-medium text-gray-400 mb-2'>Mobile</h4>
              <p className='text-sm text-text'>{conversation.phone}</p>
            </div>
          )} */}

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text">Mute Chat</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-bg-box-message-incoming transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-text">Disappearing Messages</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-bg-box-message-incoming transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>

          {conversation.type === "GROUP" && <GroupMemberManager />}

          {/* Media */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              Media, Links & Docs
            </h4>

            <div className="mb-3 flex gap-2">
              {(
                [
                  ["MEDIA", "Media"],
                  ["LINK", "Links"],
                  ["DOC", "Docs"],
                ] as const
              ).map(([kind, label]) => (
                <Button
                  key={kind}
                  size="sm"
                  variant={assetKind === kind ? "default" : "outline"}
                  onClick={() => setAssetKind(kind)}
                  className="h-8"
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              {assets.map((message) => {
                if (assetKind === "MEDIA") {
                  const url = resolveMediaPreviewUrl(message);
                  if (!url) return null;

                  return (
                    <button
                      key={message.id}
                      onClick={() => onJumpToMessage(message.id)}
                      className="w-full text-left rounded-lg border border-bg-box-message-incoming p-2 hover:bg-bg-box-message-incoming/40"
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                        <img
                          src={url}
                          alt="media"
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <p className="truncate text-xs text-gray-300">
                          {message.text || "Media"}
                        </p>
                      </div>
                    </button>
                  );
                }

                if (assetKind === "LINK") {
                  const link = resolvePrimaryLink(message);
                  if (!link) return null;
                  return (
                    <button
                      key={message.id}
                      onClick={() => onJumpToMessage(message.id)}
                      className="w-full text-left rounded-lg border border-bg-box-message-incoming p-2 hover:bg-bg-box-message-incoming/40"
                    >
                      <div className="flex items-start gap-2">
                        <Link2 className="mt-0.5 h-4 w-4 text-gray-400" />
                        <p className="truncate text-xs text-blue-300">{link}</p>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={message.id}
                    onClick={() => onJumpToMessage(message.id)}
                    className="w-full text-left rounded-lg border border-bg-box-message-incoming p-2 hover:bg-bg-box-message-incoming/40"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <p className="truncate text-xs text-gray-200">
                        {resolveFileName(message)}
                      </p>
                    </div>
                  </button>
                );
              })}

              {isLoading && <p className="text-xs text-gray-400">Loading...</p>}

              {!isLoading && assets.length === 0 && (
                <p className="text-xs text-gray-500">No data</p>
              )}

              {!isLoading && hasMore && assets.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!isLoading && nextCursor) {
                      setCursor(nextCursor);
                      setFetchKey((prev) => prev + 1);
                    }
                  }}
                >
                  Load more
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
