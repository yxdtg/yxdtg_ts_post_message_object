## 是什么?

yxdtg_ts_post_message_object 是一个用于多个跨域窗口页面之间互相通信的库。

## 为什么不用原生的 postMessage?

我想，直接说该库解决了什么问题吧。

-   类型安全 (发送消息和接收消息全程类型检查，传输数据类型提示，提升开发效率和项目安全)。
-   返回参数 (发送消息后，会等待接收方返回响应数据，加上使用 await 语法糖，可以做到像是在本地调用函数一样的体验)。
-   其他 (请自行探索)

## 安装

npm

```
npm install yxdtg_ts_post_message_object
```

yarn

```
yarn add yxdtg_ts_post_message_object
```

pnpm

```
pnpm add yxdtg_ts_post_message_object
```

## 演示

打开项目根目录 index.html 进行查看演示。(需要启动一个服务端哦，例如 vscode 可以使用 Live Server 插件)

## src 目录结构

```
├── tests // 测试文件夹
    ├── define.ts // 定义文件
    ├── window1.ts // 窗口1演示文件
    ├── window2.ts // 窗口2演示文件
├── index.ts // 源码
```

## 设计图

![alt text](设计图.svg)
