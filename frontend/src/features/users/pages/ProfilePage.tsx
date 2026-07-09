import { useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, PencilLine, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { useAuthUserQuery } from "@/features/auth/server";
import { useUpdateMyProfileMutation } from "@/features/users/server";
import {
  Container,
  Field,
  FormActions,
  IconBox,
  LoadingState,
  MediaListItem,
  PageHero,
  PanelShell,
  SectionHeading,
} from "@/shared/components";
import { formatDate } from "@/shared/lib/format";

const DEMO_EMAILS = [
  "admin@gametopup.com",
  "customer01@gametopup.com",
];

export function ProfilePage() {
  const userQuery = useAuthUserQuery();
  const user = userQuery.data ?? null;
  const updateProfileMutation = useUpdateMyProfileMutation();
  const [draftName, setDraftName] = useState("");
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setDraftName(user.displayName);
    }
  }, [user]);

  if (userQuery.isPending && userQuery.data === undefined) {
    return (
      <Container className="py-5 sm:py-7 lg:py-8">
        <LoadingState title="Dang tai ho so..." />
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  const isDemoAccount = DEMO_EMAILS.includes(user.email);
  const trimmedDraftName = draftName.trim();
  const currentDisplayName = user.displayName.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateProfileMutation.mutateAsync({
      displayName: trimmedDraftName,
    });
  }

  function handleChangePassword() {
    if (isDemoAccount) {
      toast.info("Tài khoản demo không hỗ trợ đổi mật khẩu.");
      return;
    }

    setIsChangePasswordOpen(true);
  }

  return (
    <>
      <Container className="py-5 sm:py-7 lg:py-8">
        <div className="grid gap-10 lg:gap-12">
          <PageHero
            visual={
              <IconBox
                size="lg"
                tone="primary"
                className="h-[62px] w-[62px] rounded-[18px]"
              >
                <UserRound size={30} strokeWidth={1.8} />
              </IconBox>
            }
            title={user.displayName}
            description={`Thành viên từ ${formatDate(user.createdAt)}`}
          />

          <section className="w-full">
            <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,2fr)_500px]">
              <PanelShell className="flex h-full flex-col">
                <div className="px-6 pt-6">
                  <SectionHeading
                    title="Thông tin hồ sơ"
                    titleClassName="text-[1.35rem]"
                  />
                </div>

                <form
                  className="flex flex-1 flex-col px-6 pb-6 pt-5"
                  onSubmit={handleSubmit}
                >
                  <div className="grid gap-4">
                    <Field
                      required
                      label="Ten hien thi"
                      value={draftName}
                      placeholder="Nhập tên hiển thị"
                      onChange={(event) => setDraftName(event.target.value)}
                    />

                    <Field
                      label="Email"
                      value={user.email}
                      readOnly
                      trailing={<ShieldCheck size={16} />}
                    />

                    {updateProfileMutation.error instanceof Error && (
                      <div className="rounded-[18px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {updateProfileMutation.error.message}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto border-t gt-border pt-5">
                    <FormActions
                      submitIcon={<PencilLine size={16} />}
                      submitLabel={
                        updateProfileMutation.isPending
                          ? "Đang cập nhật..."
                          : "Lưu thay đổi"
                      }
                      disabled={
                        trimmedDraftName.length === 0 ||
                        trimmedDraftName === currentDisplayName ||
                        updateProfileMutation.isPending
                      }
                    />
                  </div>
                </form>
              </PanelShell>

              <PanelShell className="flex flex-col sticky top-24 h-fit">
                <div className="px-6 pt-6">
                  <SectionHeading
                    title="Bảo mật"
                    titleClassName="text-[1.35rem]"
                  />
                </div>

                <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                  <div className="space-y-4">
                    <MediaListItem
                      leading={
                        <IconBox tone="primary">
                          <LockKeyhole size={18} />
                        </IconBox>
                      }
                      title="Đổi mật khẩu"
                      subtitle="Cập nhật mật khẩu để bảo vệ tài khoản."
                      onClick={handleChangePassword}
                      trailing={
                        <span className="text-sm font-semibold text-cyan-300">
                          Đổi -&gt;
                        </span>
                      }
                      className="min-h-[84px]"
                    />
                  </div>

                  <div className="mt-5 rounded-2xl bg-cyan-500/5 px-4 py-4 text-sm leading-6 gt-text-muted">
                    <p className="font-semibold text-cyan-300">Mẹo bảo mật</p>

                    <p className="mt-2">
                      Không chia sẽ mật khẩu với người khác. Nên sử dụng mật
                      khẩu mạnh gồm chữ hoa, chữ thường, chữ số và ký tự đặc
                      biệt
                    </p>
                  </div>
                </div>
              </PanelShell>
            </div>
          </section>
        </div>
      </Container>

      {isChangePasswordOpen && (
        <ChangePasswordDialog onClose={() => setIsChangePasswordOpen(false)} />
      )}
    </>
  );
}
