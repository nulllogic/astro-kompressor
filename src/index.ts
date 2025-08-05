import type { AstroIntegration } from "astro";

export default function (): AstroIntegration {

  return {
    name: "astro-kompressor",
    hooks: {
      "astro:build:done": async () => {

      },
    },
  };
}
