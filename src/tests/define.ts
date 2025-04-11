export const MessageType = {
    GET_RANDOM_NUMBER: "get_random_number",
    GET_RANDOM_STRING: "get_random_string",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface IMessageTypeMap {
    [MessageType.GET_RANDOM_NUMBER]: () => number;
    [MessageType.GET_RANDOM_STRING]: (length: number) => string;
}
