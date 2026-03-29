import { GlobalLoader } from "./GlobalLoader";

export const Loader = ({
  text,
  fullPage = false,
}: {
  text?: string;
  fullPage?: boolean;
}) => <GlobalLoader variant={fullPage ? "fullPage" : "section"} text={text} />;
