interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <span className={className} role="img" aria-label="Heart logo">
      ❤️
    </span>
  );
};
  