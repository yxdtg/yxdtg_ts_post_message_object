import { PostMessageObject } from "../index";
import { IMessageTypeMap, MessageType } from "./define";

const call = (): void => {
    const window2IFrame = window.parent.document.querySelector(
        "#window2_iframe",
    ) as HTMLIFrameElement;
    if (!window2IFrame) throw new Error("window2IFrame is null");
    const window2 = window2IFrame.contentWindow;
    if (!window2) throw new Error("window2 is null");

    const messageTextEl = document.querySelector(
        "#message_text",
    ) as HTMLElement;
    if (!messageTextEl) throw new Error("messageTextEl is null");

    const postMessageObject = new PostMessageObject<IMessageTypeMap>({
        currentWindow: window,
    });

    postMessageObject.receive(MessageType.GET_RANDOM_NUMBER, (response) => {
        messageTextEl.textContent = `收到来自window2页面的消息-获取随机数字`;

        const randomNumber = Math.floor(Math.random() * 101);
        response(randomNumber);
    });

    (window as any).sendGetRandomString = (): void => {
        postMessageObject
            .send(window2, MessageType.GET_RANDOM_STRING, 12)
            .then((randomString) => {
                messageTextEl.textContent = `响应来自window2页面的消息-获取随机字符串: ${randomString}`;
            });
    };
};

requestAnimationFrame(call);
