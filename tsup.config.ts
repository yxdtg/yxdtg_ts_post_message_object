import { defineConfig } from "tsup";

export default defineConfig({
    // 入口文件
    entry: ["src/index.ts", "src/tests/window1.ts", "src/tests/window2.ts"],
    // 输出目录
    outDir: "dist",
    // 打包类型
    format: ["esm"],
    // 生成类型文件
    dts: true,
    // 代码分割
    splitting: false,
    // sourcemap
    sourcemap: true,
    clean: true,
    // minify: true,
});
