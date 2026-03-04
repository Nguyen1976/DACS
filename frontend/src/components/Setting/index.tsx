import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Lock, Shield, X } from "lucide-react";
import Profile from "./Profile";

interface ProfileSettingsProps {
  onClose: () => void;
}

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
  return (
    <div className="left-0 right-0 top-0 bottom-0 mx-auto bg-[rgba(0,0,0,0.56)] text-foreground  fixed z-50 ">
      <div className="min-w-1/3 max-w-3/4 mt-5 mx-auto bg-card rounded-lg border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Cài đặt & Quyền riêng tư</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="profile"
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary"
              >
                Hồ sơ
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary"
              >
                Tài khoản
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary"
              >
                Riêng tư
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium data-[state=active]:border-primary"
              >
                Thông báo
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-6 space-y-6">
              <Profile />
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Cài đặt tài khoản
                </h3>

                <Card className="bg-muted border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Mật khẩu & Bảo mật
                    </CardTitle>
                    <CardDescription>
                      Quản lý mật khẩu và các tùy chọn bảo mật
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full bg-transparent">
                      Đổi mật khẩu
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Xác thực 2 lớp
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-muted border-border mt-4">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Phiên đăng nhập
                    </CardTitle>
                    <CardDescription>
                      Quản lý các phiên đang hoạt động
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent">
                      Xem tất cả phiên
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Cài đặt quyền riêng tư
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">Who can see your profile</h4>
                      <p className="text-sm text-muted-foreground">
                        Kiểm soát ai có thể xem thông tin hồ sơ của bạn
                      </p>
                    </div>
                    <select className="px-3 py-1 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Mọi người</option>
                      <option>Chỉ bạn bè</option>
                      <option>Riêng tư</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">
                        Trạng thái hoạt động gần đây
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Hiển thị thời điểm bạn hoạt động gần nhất
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">Trạng thái trực tuyến</h4>
                      <p className="text-sm text-muted-foreground">
                        Hiển thị trạng thái trực tuyến cho người khác
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Tùy chọn thông báo
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">Tin nhắn</h4>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi có tin nhắn mới
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">Lời mời kết bạn</h4>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi có lời mời kết bạn mới
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">Thông báo cuộc gọi</h4>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông báo khi có người gọi cho bạn
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div>
                      <h4 className="font-medium">Âm thanh</h4>
                      <p className="text-sm text-muted-foreground">
                        Phát âm thanh khi có thông báo
                      </p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-accent-foreground transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
