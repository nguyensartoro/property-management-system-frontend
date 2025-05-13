/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string
  readonly VITE_API_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'react' {
  import * as React from 'react';
  export = React;
}

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  export const User: FC<IconProps>;
  export const Home: FC<IconProps>;
  export const Edit: FC<IconProps>;
  export const Trash2: FC<IconProps>;
  export const ChevronDown: FC<IconProps>;
  export const ChevronUp: FC<IconProps>;
  export const Sun: FC<IconProps>;
  export const Moon: FC<IconProps>;
  export const Settings: FC<IconProps>;
  export const Copy: FC<IconProps>;
  export const Plus: FC<IconProps>;
  export const X: FC<IconProps>;
  export const Phone: FC<IconProps>;
  export const Mail: FC<IconProps>;
  export const Check: FC<IconProps>;
  export const AlertCircle: FC<IconProps>;
  export const Save: FC<IconProps>;
  export const Camera: FC<IconProps>;
  export const Filter: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const List: FC<IconProps>;
  export const Grid: FC<IconProps>;
  export const Pencil: FC<IconProps>;
  export const FileText: FC<IconProps>;
  export const Info: FC<IconProps>;
  export const Wallet: FC<IconProps>;
  export const Send: FC<IconProps>;
  export const Building2: FC<IconProps>;
}
