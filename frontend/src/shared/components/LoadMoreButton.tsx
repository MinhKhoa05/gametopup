import { Button } from "./Button";

type LoadMoreButtonProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
};

export function LoadMoreButton({
  className = "pt-1",
  hasMore,
  isLoading,
  onLoadMore,
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <Button
        variant="outline"
        loading={isLoading}
        onClick={onLoadMore}
      >
        Xem thêm
      </Button>
    </div>
  );
}
