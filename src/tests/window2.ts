import { PostMessageObject } from "../index";
import { IMessageTypeMap, MessageType } from "./define";

const call = (): void => {
    const window1IFrame = window.parent.document.querySelector(
        "#window1_iframe",
    ) as HTMLIFrameElement;
    if (!window1IFrame) throw new Error("window1IFrame is null");
    const window1 = window1IFrame.contentWindow;
    if (!window1) throw new Error("window1 is null");

    const messageTextEl = document.querySelector(
        "#message_text",
    ) as HTMLElement;
    if (!messageTextEl) throw new Error("messageTextEl is null");

    const postMessageObject = new PostMessageObject<IMessageTypeMap>({
        currentWindow: window,
    });

    postMessageObject.receive(
        MessageType.GET_RANDOM_STRING,
        (response, length) => {
            messageTextEl.textContent = `收到来自window1页面的消息-获取随机字符串`;

            let randomString = "";
            const chars =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (let i = 0; i < length; i++) {
                randomString += chars[Math.floor(Math.random() * chars.length)];
            }
            response(randomString);
        },
    );

    (window as any).sendGetRandomNumber = (): void => {
        postMessageObject
            .send(window1, MessageType.GET_RANDOM_NUMBER)
            .then((randomNumber) => {
                messageTextEl.textContent = `响应来自window1页面的消息-获取随机数字: ${randomNumber}`;
            });
    };
};

requestAnimationFrame(call);
