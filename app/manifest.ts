import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "B&B Consultoria Imobiliária",
    short_name: "B&B Consultoria",
    description:
      "Consultoria imobiliária especializada em imóveis de médio e alto padrão em São José dos Campos.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}