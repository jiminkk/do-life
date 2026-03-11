import { linkFor } from "rwsdk/router";
import type { App } from "rwsdk/worker";

// @ts-ignore - rwsdk type complexity with current route definitions
export const link = linkFor<App>();
