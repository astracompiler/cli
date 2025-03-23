declare module 'postject' {
  export interface InjectOptions {
    /**
     * @default '__POSTJECT'
     */
    machoSegmentName?: string;
    /**
     * @default false
     */
    overwrite?: boolean;
    /**
     * @default "POSTJECT_SENTINEL_fce680ab2cc467b6e072b8b5df1996b2"
     */
    sentinelFuse?: string;
    /**
     * @default false
     */
    quiet?: boolean;
  }
  
  export function inject(filename: string, resourceName: string, resourceData: Buffer, options?: InjectOptions): Promise<void>;  
}
