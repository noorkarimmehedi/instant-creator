import styles from "./SettingsBookmarkButton.module.css";

type SettingsBookmarkButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  href?: string;
  ariaLabel?: string;
  wide?: boolean;
};

function ButtonContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className={styles.IconContainer} aria-hidden="true">
        <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 4.75C6 3.784 6.784 3 7.75 3h8.5C17.216 3 18 3.784 18 4.75v15.1a.75.75 0 0 1-1.17.62L12 17.2l-4.83 3.27A.75.75 0 0 1 6 19.85V4.75Z"
            fill="white"
          />
        </svg>
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
}: SettingsBookmarkButtonProps) {
  const className = wide ? `${styles.bookmarkBtn} ${styles.wide}` : styles.bookmarkBtn;

  if (href) {
    return (
      <a className={className} href={href} aria-label={ariaLabel} aria-disabled={disabled || undefined}>
        <ButtonContent>{children}</ButtonContent>
      </a>
    );
  }

  return (
    <button className={className} type={type} disabled={disabled} aria-label={ariaLabel}>
      <ButtonContent>{children}</ButtonContent>
    </button>
  );
}
