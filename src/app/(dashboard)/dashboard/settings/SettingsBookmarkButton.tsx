import styles from "./SettingsBookmarkButton.module.css";

type SettingsBookmarkButtonIcon = "save" | "connect" | "disconnect" | "active" | "upgrade" | "wait";

type SettingsBookmarkButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  href?: string;
  ariaLabel?: string;
  wide?: boolean;
  icon?: SettingsBookmarkButtonIcon;
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

  return (
    <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.5L19 6.5V19a2 2 0 0 1-2 2Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 3v6h7V3M8 21v-7h8v7" stroke="white" strokeWidth="2" strokeLinejoin="round" />
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
    <button className={className} type={type} disabled={disabled} aria-label={ariaLabel}>
      <ButtonContent icon={icon}>{children}</ButtonContent>
    </button>
  );
}
