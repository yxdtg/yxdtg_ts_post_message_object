interface IPostMessageObjectOptions {
    currentWindow: Window;
    targetOrigin?: string;
}
type IMessageResponseCallback<M extends Record<keyof M, any> = any, T extends keyof M = any> = (returnValue: ReturnType<M[T]>) => void;
type IMessageCallback<M extends Record<keyof M, any> = any, T extends keyof M = any> = (response: IMessageResponseCallback<M, T>, ...data: Parameters<M[T]>) => void;
declare class PostMessageObject<M extends Record<keyof M, any> = any> {
    private _messageId;
    private _generateMessageId;
    private _getResponseMessageId;
    private _messageCallbackObjectsMap;
    private _responseCallbackMap;
    private _onAllMessageHandler;
    private _currentWindow;
    private _targetOrigin;
    constructor(options: IPostMessageObjectOptions);
    private _onAllMessage;
    /**
     * 发送消息并等待响应
     * @param targetWindow 目标窗口
     * @param type 消息类型
     * @param data 消息参数 可多个
     * @returns 响应参数
     */
    send<T extends keyof M>(targetWindow: Window, type: T, ...data: Parameters<M[T]>): Promise<ReturnType<M[T]>>;
    private _send;
    /**
     * 接收信息
     * @param type 消息类型
     * @param callback 消息回调
     * @param target 回调this指向
     */
    receive<T extends keyof M>(type: T, callback: IMessageCallback<M, T>, target?: any): void;
    private _triggerMessageCallback;
    /**
     * 注销消息接收
     * @param type 消息类型
     * @param callback 消息回调
     * @param target 回调this指向
     * @returns
     */
    unReceive<T extends keyof M>(type: T, callback: IMessageCallback<M, T>, target?: any): void;
    /**
     * 注销所有消息接收
     */
    unAllReceives(): void;
    /**
     * 清理所有响应回调
     */
    clearAllResponseCallbacks(): void;
    /**
     * 清理该对象
     */
    close(): void;
}

export { PostMessageObject };
