type StringWithAutocomplete<T> = T | (string & Record<never, never>);
export type HttpMethod = StringWithAutocomplete<
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "TRACE"
  | "CONNECT"
>;

export type HTTPRequestLines = string[];
export type LineEnding = "\r\n" | "\n";

export type ModificationResult =
  | {
      success: true;
      result: string;
    }
  | {
      success: false;
      error: string;
    };
