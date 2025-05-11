import { MessageResponse } from "./base";

export type UpdateProfileToolInput = {
  displayName?: string;
  bio?: string;
};

export type UpdateProfileToolResult = MessageResponse<{}>;
