declare module "html2pdf.js" {
  type Html2PdfOptions = {
    [key: string]: unknown;
  };

  type Html2PdfInstance = {
    set: (options: Html2PdfOptions) => Html2PdfInstance;
    from: (source: HTMLElement | string) => Html2PdfInstance;
    save: () => Promise<void>;
  };

  const html2pdf: () => Html2PdfInstance;

  export default html2pdf;
}
