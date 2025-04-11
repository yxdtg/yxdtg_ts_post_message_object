interface IPostMessageObjectOptions {
    currentWindow: Window;
    targetOrigin?: string;
}

interface IMessageInfo {
    id: string;
    type: string;
    data: any;
}

interface IMessageCallbackObject<
    M extends Record<keyof M, any> = any,
    T extends keyof M = any,
> {
    type: T;
    callback: IMessageCallback<M, T>;
    target: any;
}

type IMessageResponseCallback<
    M extends Record<keyof M, any> = any,
    T extends keyof M = any,
> = (returnValue: ReturnType<M[T]>) => void;

type IMessageCallback<
    M extends Record<keyof M, any> = any,
    T extends keyof M = any,
> = (
    response: IMessageResponseCallback<M, T>,
    ...data: Parameters<M[T]>
) => void;

export class PostMessageObject<M extends Record<keyof M, any> = any> {
    private _messageId: number = 0;
    private _generateMessageId(): string {
        const messageId = ++this._messageId;
        return `messageId_${messageId}`;
    }
    private _getResponseMessageId(messageId: string): string {
        return `_response_${messageId}`;
    }

    private _messageCallbackObjectsMap: Map<
        keyof M,
        IMessageCallbackObject<M, keyof M>[]
    > = new Map();
    private _responseCallbackMap: Map<string, IMessageResponseCallback> =
        new Map();

    private _onAllMessageHandler: (event: MessageEvent) => void;

    private _currentWindow: Window;
    private _targetOrigin: string;
    constructor(options: IPostMessageObjectOptions) {
        this._currentWindow = options.currentWindow;
        this._targetOrigin = options.targetOrigin ?? "*";

        this._onAllMessageHandler = this._onAllMessage.bind(this);
        this._currentWindow.addEventListener(
            "message",
            this._onAllMessageHandler,
        );
    }
    private _onAllMessage(event: MessageEvent): void {
        // console.log(event.data);
        if (typeof event.data !== "string") return;
        const message: string = event.data;
        if (message.substring(0, 17) !== `{"id":"messageId_`) return;

        const targetWindow = event.source as Window;
        const messageInfo: IMessageInfo = JSON.parse(message);
        this._triggerMessageCallback(targetWindow, messageInfo);
    }

    /**
     * 发送消息并等待响应
     * @param targetWindow 目标窗口
     * @param type 消息类型
     * @param data 消息参数 可多个
     * @returns 响应参数
     */
    public async send<T extends keyof M>(
        targetWindow: Window,
        type: T,
        ...data: Parameters<M[T]>
    ): Promise<ReturnType<M[T]>> {
        return new Promise((resolve, reject) => {
            try {
                const messageInfo = this._send(targetWindow, type, ...data);

                const responseMessageId = this._getResponseMessageId(
                    messageInfo.id,
                );
                const responseCallback: IMessageResponseCallback = (
                    returnValue: any,
                ): void => {
                    resolve(returnValue);
                    this._responseCallbackMap.delete(responseMessageId);
                };
                this._responseCallbackMap.set(
                    responseMessageId,
                    responseCallback,
                );
            } catch (e) {
                reject(e);
            }
        });
    }
    private _send<T extends keyof M>(
        targetWindow: Window,
        type: T,
        ...data: Parameters<M[T]>
    ): IMessageInfo {
        const messageInfo: IMessageInfo = {
            id: this._generateMessageId(),
            type: type as any,
            data: data,
        };

        const message = JSON.stringify(messageInfo);
        targetWindow.postMessage(message, this._targetOrigin);

        return messageInfo;
    }

    /**
     * 接收信息
     * @param type 消息类型
     * @param callback 消息回调
     * @param target 回调this指向
     */
    public receive<T extends keyof M>(
        type: T,
        callback: IMessageCallback<M, T>,
        target: any = null,
    ): void {
        const messageCallbackObject: IMessageCallbackObject = {
            type: type,
            callback: callback,
            target: target,
        };

        const messageCallbackObjects =
            this._messageCallbackObjectsMap.get(type) ?? [];
        messageCallbackObjects.push(messageCallbackObject);

        this._messageCallbackObjectsMap.set(type, messageCallbackObjects);
    }
    private _triggerMessageCallback(
        targetWindow: Window,
        messageInfo: IMessageInfo,
    ): void {
        const messageInfoType = messageInfo.type;
        // 响应消息类型
        if (messageInfoType.substring(0, 10) === "_response_") {
            const responseMessageId = messageInfo.type;
            const responseCallback =
                this._responseCallbackMap.get(responseMessageId);

            if (responseCallback) {
                responseCallback(messageInfo.data[0] ?? undefined);
            }
        } else {
            // 普通消息类型
            const responseCallback: IMessageResponseCallback = (
                returnValue: any,
            ): void => {
                const responseMessageId = this._getResponseMessageId(
                    messageInfo.id,
                );
                (this._send as any)(
                    targetWindow,
                    responseMessageId as any,
                    returnValue as any,
                );
            };

            const messageCallbackObjects =
                this._messageCallbackObjectsMap.get(messageInfo.type as any) ??
                [];

            for (const messageCallbackObject of messageCallbackObjects) {
                if (messageCallbackObject.target) {
                    messageCallbackObject.callback.call(
                        messageCallbackObject.target,
                        responseCallback,
                        ...messageInfo.data,
                    );
                } else {
                    messageCallbackObject.callback(
                        responseCallback,
                        ...messageInfo.data,
                    );
                }
            }
        }
    }

    /**
     * 注销消息接收
     * @param type 消息类型
     * @param callback 消息回调
     * @param target 回调this指向
     * @returns
     */
    public unReceive<T extends keyof M>(
        type: T,
        callback: IMessageCallback<M, T>,
        target: any = null,
    ): void {
        const messageCallbackObjects =
            this._messageCallbackObjectsMap.get(type) ?? [];
        if (messageCallbackObjects.length === 0) return;

        const index = messageCallbackObjects.findIndex(
            (messageCallbackObject) =>
                messageCallbackObject.callback === callback &&
                messageCallbackObject.target === target,
        );
        if (index === -1) return;

        messageCallbackObjects.splice(index, 1);
    }
    /**
     * 注销所有消息接收
     */
    public unAllReceives(): void {
        this._messageCallbackObjectsMap.clear();
    }
    /**
     * 清理所有响应回调
     */
    public clearAllResponseCallbacks(): void {
        this._responseCallbackMap.clear();
    }

    /**
     * 清理该对象
     */
    public close(): void {
        window.removeEventListener("message", this._onAllMessageHandler);
    }
}
