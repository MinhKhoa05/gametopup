import { Github, Linkedin, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FOOTER_CONTACT_LINKS, FOOTER_LINK_COLUMNS } from "@/app/config";
import { routes } from "@/app/router/routes";
import { SiteCredits } from "@/app/components/";
import { BrandLogo } from "@/shared/components";
import { Button } from "@/shared/components";

export function AppFooter() {
  const navigate = useNavigate();

  return (
    <footer className="gt-shell-surface mt-auto border-t gt-border pt-14 pb-10">
      <div className="mx-auto max-w-[1480px] px-6">
        <div className="grid gap-12 border-b gt-border pb-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <section className="flex max-w-md flex-col gap-5">
            <BrandLogo
              className="w-fit"
              onClick={() => navigate(routes.home())}
            />

            <p className="text-sm leading-7 gt-text-muted">
              GameTopUp giúp người chơi mua các gói nạp với mức giá tốt hơn,
              quản lý số dư ví và dễ dàng theo dõi quá trình xử lý đơn hàng.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              {FOOTER_CONTACT_LINKS.map((item) => {
                const Icon = getSocialIcon(item.iconKey);

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="inline-flex"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      leadingIcon={<Icon size={16} />}
                    >
                      {item.label}
                    </Button>
                  </a>
                );
              })}
            </div>
          </section>

          {FOOTER_LINK_COLUMNS.map((column) => (
            <FooterLinkColumn
              key={column.title}
              title={column.title}
              links={column.links}
              onNavigate={navigate}
            />
          ))}
        </div>
      </div>

      <SiteCredits />
    </footer>
  );
}

type FooterLinkColumnProps = {
  title: string;
  links: readonly {
    label: string;
    href: string;
  }[];
  onNavigate: (href: string) => void;
};

function FooterLinkColumn({ title, links, onNavigate }: FooterLinkColumnProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-base font-semibold tracking-wide gt-text">{title}</h3>

      <div className="space-y-2">
        {links.map((link) => (
          <button
            key={link.href}
            type="button"
            className="block bg-transparent text-left text-sm leading-6 gt-text-muted transition-colors hover:text-white"
            onClick={() => onNavigate(link.href)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function getSocialIcon(key: string) {
  switch (key) {
    case "mail":
      return Mail;

    case "github":
      return Github;

    case "linkedin":
      return Linkedin;

    default:
      return ShieldCheck;
  }
}
