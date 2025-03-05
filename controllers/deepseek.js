/**
 * Created by zhaoyadong on 12/11/2017.
 */
var axios = require("axios");

const index = function (req, res, next) {
    // res.send('hello express');
    res.setHeader("Content-type", "text/html;charset=utf-8");
    res.render("deepseek", { title: "Hello", content: "与deepseek聊天" });
    next();
};

async function createChatCompletion(messages) {
    const deepseekSK = process.env.DEEPSEEK_SK;
    console.log(7, deepseekSK);

    const data = JSON.stringify({
        messages: messages,
        model: "deepseek-reasoner",
        response_format: { type: "text" },
        stream: true,
    });

    let config = {
        method: "post",
        url: "https://api.deepseek.com/chat/completions",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${deepseekSK}`,
        },
        responseType: "stream",
        data: data,
    };

    return { config };
}

const chat = async function (req, res, next) {
    let messages = [{ role: "user", content: req.query.message }];
    console.log(38, messages);
    let { config } = await createChatCompletion(messages);
    let response = await axios(config);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // 处理流式响应
    response.data.on("data", async (chunk) => {
        const lines = chunk.toString().split("\n"); // 将数据块转换为字符串并按行分割
        console.log("result::", lines);
        for (const line of lines) {
            if (line.trim() === "") continue; // 跳过空行
            if (line.trim() === "data: [DONE]") continue; // 跳过结束标记
            if (line.startsWith("data:")) {
                // 检查是否以 "data: " 开头
                try {
                    const json = JSON.parse(line.slice(6)); // 去掉前缀 "data: " 并解析 JSON
                    if (json.choices[0].delta.content) {
                        // 检查是否有内容
                        let contents = [];
                        let index = 0;
                        contents.push(json.choices[0].delta.content);
                        for (let i = 0; i < contents.length; i++) {
                            setTimeout(() => {
                                res.write(
                                    `data: ${JSON.stringify({
                                        content: contents[index],
                                    })}\n\n`
                                );
                                index++;
                            }, 200);
                        }
                    }
                } catch (e) {
                    continue; // 如果解析失败，继续处理下一行
                }
            }
        }
    });
};

module.exports = { index, chat };
