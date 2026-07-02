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
};

function Icon({ icon }: { icon: SettingsBookmarkButtonIcon }) {
  if (icon === "connect") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7.5 12h9M12 7.5v9" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "disconnect") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="m6.5 6.5 11 11M8.5 15.5 6 18a3.5 3.5 0 0 1-5-5l2.5-2.5M15.5 8.5 18 6a3.5 3.5 0 0 1 5 5l-2.5 2.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "active") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="m5 12.5 4.2 4.2L19.5 6.4" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "upgrade") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 19V5m0 0-5 5m5-5 5 5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "wait") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "upload") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "social") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8 12a4 4 0 0 1 4-4h2m-4 8h2a4 4 0 0 0 0-8M9 16H8a4 4 0 1 1 0-8h1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "wallet") {
    return (
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 12h3" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4.75C6 3.784 6.784 3 7.75 3h8.5C17.216 3 18 3.784 18 4.75v15.1a.75.75 0 0 1-1.17.62L12 17.2l-4.83 3.27A.75.75 0 0 1 6 19.85V4.75Z"
        fill="white"
      />
    </svg>
  );
}

function ButtonContent({ children, icon }: { children: React.ReactNode; icon: SettingsBookmarkButtonIcon }) {
  return (
    <>
      <span className={styles.IconContainer} aria-hidden="true">
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
}: SettingsBookmarkButtonProps) {
  const className = wide ? `${styles.bookmarkBtn} ${styles.wide}` : styles.bookmarkBtn;

  if (href) {
    return (
      <a className={className} href={href} aria-label={ariaLabel} aria-disabled={disabled || undefined}>
        <ButtonContent icon={icon}>{children}</ButtonContent>
      </a>
    );
  }

  return (
    <button className={className} type={type} disabled={disabled} aria-label={ariaLabel} onClick={onClick}>
      <ButtonContent icon={icon}>{children}</ButtonContent>
    </button>
  );
}
