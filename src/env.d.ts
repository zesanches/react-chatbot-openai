interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_OPENAI_API_KEY?: string;
    readonly REACT_APP_OPENAI_MODEL?: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
} | undefined;
