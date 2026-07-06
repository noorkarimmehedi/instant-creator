import styles from "./SettingsBookmarkButton.module.css";

type SettingsBookmarkButtonIcon =
  | "save"
  | "connect"
  | "disconnect"
  | "active"
  | "upgrade"
  | "wait"
  | "upload"
  | "social"
  | "wallet";

type SettingsBookmarkButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  href?: string;
  ariaLabel?: string;
  wide?: boolean;
  icon?: SettingsBookmarkButtonIcon;
  onClick?: () => void;
  variant?: "default" | "upgrade";
};

function Icon({ icon }: { icon: SettingsBookmarkButtonIcon }) {
  if (icon === "connect") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7.5 12h9M12 7.5v9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "disconnect") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="m6.5 6.5 11 11M8.5 15.5 6 18a3.5 3.5 0 0 1-5-5l2.5-2.5M15.5 8.5 18 6a3.5 3.5 0 0 1 5 5l-2.5 2.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "active") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="m5 12.5 4.2 4.2L19.5 6.4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "upgrade") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 19V5m0 0-5 5m5-5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "wait") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "upload") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "social") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8 12a4 4 0 0 1 4-4h2m-4 8h2a4 4 0 0 0 0-8M9 16H8a4 4 0 1 1 0-8h1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "wallet") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 12h3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4.75C6 3.784 6.784 3 7.75 3h8.5C17.216 3 18 3.784 18 4.75v15.1a.75.75 0 0 1-1.17.62L12 17.2l-4.83 3.27A.75.75 0 0 1 6 19.85V4.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LegacyButtonContent({ children, icon }: { children: React.ReactNode; icon: SettingsBookmarkButtonIcon }) {
  return (
    <>
      <span className={styles.IconContainer} aria-hidden="true" style={{ color: "white" }}>
        <Icon icon={icon} />
      </span>
      <span className={styles.text}>{children}</span>
    </>
  );
}

export function SettingsBookmarkButton({
  children,
  type = "button",
  disabled = false,
  href,
  ariaLabel,
  wide = false,
  icon = "save",
  onClick,
  variant = "default",
}: SettingsBookmarkButtonProps) {
  if (variant === "upgrade") {
    const className = wide ? `${styles.bookmarkBtn} ${styles.wide}` : styles.bookmarkBtn;

    if (href) {
      return (
        <a className={className} href={href} aria-label={ariaLabel} aria-disabled={disabled || undefined}>
          <LegacyButtonContent icon={icon}>{children}</LegacyButtonContent>
        </a>
      );
    }

    return (
      <button className={className} type={type} disabled={disabled} aria-label={ariaLabel} onClick={onClick}>
        <LegacyButtonContent icon={icon}>{children}</LegacyButtonContent>
      </button>
    );
  }

  const twClassName = `relative inline-flex shrink-0 items-center justify-center cursor-pointer rounded-[12px] px-6 py-2.5 text-sm font-medium text-zinc-900 bg-[#E3E3E3]/80 shadow-[0_2px_4px_0_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.16),inset_0_1px_0_0_#FDFDFD] disabled:cursor-wait disabled:opacity-50 transition-all hover:bg-[#E3E3E3] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a1614] gap-2 ${wide ? 'w-full' : ''}`;

  if (href) {
    return (
      <a className={twClassName} href={href} aria-label={ariaLabel} aria-disabled={disabled || undefined}>
        <Icon icon={icon} />
        {children}
      </a>
    );
  }

  return (
    <button className={twClassName} type={type} disabled={disabled} aria-label={ariaLabel} onClick={onClick}>
      <Icon icon={icon} />
      {children}
    </button>
  );
}
