// src/index.ts
var PostMessageObject = class {
  _messageId = 0;
  _generateMessageId() {
    const messageId = ++this._messageId;
    return `messageId_${messageId}`;
  }
  _getResponseMessageId(messageId) {
    return `_response_${messageId}`;
  }
  _messageCallbackObjectsMap = /* @__PURE__ */ new Map();
  _responseCallbackMap = /* @__PURE__ */ new Map();
  _onAllMessageHandler;
  _currentWindow;
  _targetOrigin;
  constructor(options) {
    this._currentWindow = options.currentWindow;
    this._targetOrigin = options.targetOrigin ?? "*";
    this._onAllMessageHandler = this._onAllMessage.bind(this);
    this._currentWindow.addEventListener(
      "message",
      this._onAllMessageHandler
    );
  }
  _onAllMessage(event) {
    if (typeof event.data !== "string") return;
    const message = event.data;
    if (message.substring(0, 17) !== `{"id":"messageId_`) return;
    const targetWindow = event.source;
    const messageInfo = JSON.parse(message);
    this._triggerMessageCallback(targetWindow, messageInfo);
  }
  /**
   * 发送消息并等待响应
   * @param targetWindow 目标窗口
   * @param type 消息类型
   * @param data 消息参数 可多个
   * @returns 响应参数
   */
  async send(targetWindow, type, ...data) {
    return new Promise((resolve, reject) => {
      try {
        const messageInfo = this._send(targetWindow, type, ...data);
        const responseMessageId = this._getResponseMessageId(
          messageInfo.id
        );
        const responseCallback = (returnValue) => {
          resolve(returnValue);
          this._responseCallbackMap.delete(responseMessageId);
        };
        this._responseCallbackMap.set(
          responseMessageId,
          responseCallback
        );
      } catch (e) {
        reject(e);
      }
    });
  }
  _send(targetWindow, type, ...data) {
    const messageInfo = {
      id: this._generateMessageId(),
      type,
      data
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
  receive(type, callback, target = null) {
    const messageCallbackObject = {
      type,
      callback,
      target
    };
    const messageCallbackObjects = this._messageCallbackObjectsMap.get(type) ?? [];
    messageCallbackObjects.push(messageCallbackObject);
    this._messageCallbackObjectsMap.set(type, messageCallbackObjects);
  }
  _triggerMessageCallback(targetWindow, messageInfo) {
    const messageInfoType = messageInfo.type;
    if (messageInfoType.substring(0, 10) === "_response_") {
      const responseMessageId = messageInfo.type;
      const responseCallback = this._responseCallbackMap.get(responseMessageId);
      if (responseCallback) {
        responseCallback(messageInfo.data[0] ?? void 0);
      }
    } else {
      const responseCallback = (returnValue) => {
        const responseMessageId = this._getResponseMessageId(
          messageInfo.id
        );
        this._send(
          targetWindow,
          responseMessageId,
          returnValue
        );
      };
      const messageCallbackObjects = this._messageCallbackObjectsMap.get(messageInfo.type) ?? [];
      for (const messageCallbackObject of messageCallbackObjects) {
        if (messageCallbackObject.target) {
          messageCallbackObject.callback.call(
            messageCallbackObject.target,
            responseCallback,
            ...messageInfo.data
          );
        } else {
          messageCallbackObject.callback(
            responseCallback,
            ...messageInfo.data
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
  unReceive(type, callback, target = null) {
    const messageCallbackObjects = this._messageCallbackObjectsMap.get(type) ?? [];
    if (messageCallbackObjects.length === 0) return;
    const index = messageCallbackObjects.findIndex(
      (messageCallbackObject) => messageCallbackObject.callback === callback && messageCallbackObject.target === target
    );
    if (index === -1) return;
    messageCallbackObjects.splice(index, 1);
  }
  /**
   * 注销所有消息接收
   */
  unAllReceives() {
    this._messageCallbackObjectsMap.clear();
  }
  /**
   * 清理所有响应回调
   */
  clearAllResponseCallbacks() {
    this._responseCallbackMap.clear();
  }
  /**
   * 清理该对象
   */
  close() {
    window.removeEventListener("message", this._onAllMessageHandler);
  }
};

// src/tests/define.ts
var MessageType = {
  GET_RANDOM_NUMBER: "get_random_number",
  GET_RANDOM_STRING: "get_random_string"
};

// src/tests/window1.ts
var call = () => {
  const window2IFrame = window.parent.document.querySelector(
    "#window2_iframe"
  );
  if (!window2IFrame) throw new Error("window2IFrame is null");
  const window2 = window2IFrame.contentWindow;
  if (!window2) throw new Error("window2 is null");
  const messageTextEl = document.querySelector(
    "#message_text"
  );
  if (!messageTextEl) throw new Error("messageTextEl is null");
  const postMessageObject = new PostMessageObject({
    currentWindow: window
  });
  postMessageObject.receive(MessageType.GET_RANDOM_NUMBER, (response) => {
    messageTextEl.textContent = `\u6536\u5230\u6765\u81EAwindow2\u9875\u9762\u7684\u6D88\u606F-\u83B7\u53D6\u968F\u673A\u6570\u5B57`;
    const randomNumber = Math.floor(Math.random() * 101);
    response(randomNumber);
  });
  window.sendGetRandomString = () => {
    postMessageObject.send(window2, MessageType.GET_RANDOM_STRING, 12).then((randomString) => {
      messageTextEl.textContent = `\u54CD\u5E94\u6765\u81EAwindow2\u9875\u9762\u7684\u6D88\u606F-\u83B7\u53D6\u968F\u673A\u5B57\u7B26\u4E32: ${randomString}`;
    });
  };
};
requestAnimationFrame(call);
//# sourceMappingURL=window1.mjs.map